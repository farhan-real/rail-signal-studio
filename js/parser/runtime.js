(function(window) {
    'use strict';

    var SignalRuntime = {
        ast: null,
        activeAspectIndex: -1,
        stepTimerId: null,
        clockId: null,
        activeBlinks: {},
        blinkState: {},
        activeLine: 1,
        holdUntil: 0,
        holdOnNext: false,
        holdBlinks: {},
        delayedQueues: {},
        isPaused: false,
        TICK_MS: 50,

        init: function() {
            var self = this;
            SignalEvents.on('control:changed', function(payload) {
                if (self.holdOnNext && payload.value !== 0) {
                    self.holdOnNext = false;
                    self.holdBlinks = {};
                }
                if (!self.isPaused) self.onTick();
            });
        },

        loadAst: function(ast) {
            this.stop();
            this.ast = ast;
            this.activeAspectIndex = -1;
            this.holdUntil = 0;
            this.holdOnNext = false;
            this.holdBlinks = {};
            this.delayedQueues = {};
            this.isPaused = false;
            SignalState.groups = (ast && ast.groups) || {};
            SignalState.enums = (ast && ast.enums) || {};
            SignalState.variables = {};
            if (ast && ast.variables) {
                for (var k in ast.variables) SignalState.variables[k] = ast.variables[k];
            }
            if (ast && ast.aspectList && ast.aspectList.length > 0) {
                this.setAspect(ast.aspectList[0]);
            }
            this.startMainClock();
            this.onTick();
            SignalEvents.emit('runtime:status', { running: true, aspect: SignalState.currentAspect });
        },

        pause: function() { this.isPaused = true; this.stopMainClock(); this.stopTimer(); SignalEvents.emit('runtime:status', { running: false, aspect: SignalState.currentAspect }); },
        resume: function() { this.isPaused = false; this.startMainClock(); this.onTick(); SignalEvents.emit('runtime:status', { running: true, aspect: SignalState.currentAspect }); },

        startMainClock: function() {
            this.stopMainClock();
            var self = this, lastTick = Date.now();
            this.clockId = setInterval(function() {
                var now = Date.now();
                if (now - lastTick >= self.TICK_MS - 4) { lastTick = now; self.onTick(); }
            }, this.TICK_MS);
        },

        stopMainClock: function() { if (this.clockId) { clearInterval(this.clockId); this.clockId = null; } },

        evalExpr: function(node) {
            if (!node) return false;
            switch (node.type) {
                case 'OR': return this.evalExpr(node.left) || this.evalExpr(node.right);
                case 'AND': return this.evalExpr(node.left) && this.evalExpr(node.right);
                case 'NOT': return !this.evalExpr(node.expr);
                case 'GT': return Number(this.resolveValue(node.left)) > Number(node.right);
                case 'LT': return Number(this.resolveValue(node.left)) < Number(node.right);
                case 'IS': return this.checkIs(node.left, node.right);
                case 'LAMP_SET': return this.isItemOrGroupSet(node.lamp);
                default: return false;
            }
        },

        getMatchingBranch: function(node) {
            if (!node) return null;
            if (this.evalExpr(node.expr)) return { actions: node.actions, key: '_if' };
            if (node.elifs && node.elifs.length) {
                for (var i = 0; i < node.elifs.length; i++) {
                    if (this.evalExpr(node.elifs[i].expr)) return { actions: node.elifs[i].actions, key: '_elif' + i };
                }
            }
            if (node.elseActions && node.elseActions.length) return { actions: node.elseActions, key: '_else' };
            return null;
        },

        checkIs: function(leftId, rightVal) {
            var cleanLeft = String(leftId).replace(/[\s_]/g, '').toUpperCase();
            var ctrl = SignalState.controls.filter(function(c) {
                var cIdClean = String(c.id).replace(/[\s_]/g, '').toUpperCase();
                var cLblClean = c.label ? String(c.label).replace(/[\s_]/g, '').toUpperCase() : '';
                return cIdClean === cleanLeft || cLblClean === cleanLeft;
            })[0];

            if (ctrl) {
                var curIdx = SignalState.getControlValue(ctrl.id);
                if (curIdx === undefined) curIdx = 0;
                var rawClean = String(rightVal).replace(/[\s_"'`]/g, '').toUpperCase();
                if (String(curIdx) === String(rightVal) || String(curIdx) === rawClean) return true;
                var states = (ctrl.enumType && SignalState.enums[ctrl.enumType]) || ctrl.states;
                if (states && states[curIdx]) {
                    var sClean = String(states[curIdx]).replace(/[\s_"'`]/g, '').toUpperCase();
                    if (sClean === rawClean) return true;
                }
                for (var en in SignalState.enums) {
                    var list = SignalState.enums[en];
                    for (var m = 0; m < list.length; m++) {
                        var eClean = String(list[m]).replace(/[\s_"'`]/g, '').toUpperCase();
                        if (eClean === rawClean && curIdx === m) return true;
                    }
                }
                return false;
            }

            var lVal = String(this.resolveValue(leftId)).replace(/[\s_"'`]/g, '').toUpperCase();
            var rVal = String(this.resolveValue(rightVal)).replace(/[\s_"'`]/g, '').toUpperCase();
            if (rVal === 'ON' || rVal === 'SET') return lVal === '1' || lVal === 'ON' || lVal === 'SET';
            if (rVal === 'OFF') return lVal === '0' || lVal === 'OFF';
            return lVal === rVal;
        },

        resolveValue: function(name) {
            var v = SignalState.getVar(name);
            if (v !== undefined) return v;
            var ctrlVal = SignalState.getControlValue(name);
            if (ctrlVal !== undefined) return ctrlVal;
            var uName = String(name).toUpperCase();
            for (var i = 0; i < SignalState.lamps.length; i++) {
                if (SignalState.lamps[i].id.toUpperCase() === uName) return SignalState.getLamp(SignalState.lamps[i].id) ? 1 : 0;
            }
            for (var f = 0; f < SignalState.feathers.length; f++) {
                if (SignalState.feathers[f].id.toUpperCase() === uName) return SignalState.getLamp(SignalState.feathers[f].id) ? 1 : 0;
            }
            return name;
        },

        getAllUnits: function() {
            var all = SignalState.lamps.concat(SignalState.feathers);
            for (var c = 0; c < SignalState.controls.length; c++) {
                if (SignalState.controls[c].type === 'led') all.push(SignalState.controls[c]);
            }
            return all;
        },

        getGroup: function(name) {
            if (!name || !SignalState.groups) return null;
            if (SignalState.groups[name]) return SignalState.groups[name];
            var uName = String(name).toUpperCase();
            for (var g in SignalState.groups) {
                if (g.toUpperCase() === uName) return SignalState.groups[g];
            }
            return null;
        },

        isItemOrGroupSet: function(name) {
            if (!name) return false;
            var uName = String(name).toUpperCase();
            if (uName === 'ALL') {
                var all = this.getAllUnits();
                for (var a = 0; a < all.length; a++) { if (!SignalState.getLamp(all[a].id)) return false; }
                return true;
            }
            if (uName === 'FEATHERS' || uName === 'FEATHER') {
                for (var f = 0; f < SignalState.feathers.length; f++) {
                    if (SignalState.getLamp(SignalState.feathers[f].id)) return true;
                }
                return false;
            }
            if (uName === 'MATRIX') return !!(SignalState.matrix && SignalState.matrix.lit);
            var group = this.getGroup(name);
            if (group && group.length > 0) {
                for (var i = 0; i < group.length; i++) { if (!SignalState.getLamp(group[i])) return false; }
                return true;
            }
            return SignalState.getLamp(name);
        },

        applySetAction: function(target, isLit) {
            if (!target) return;
            var tUpper = String(target).toUpperCase();
            if (tUpper === 'MATRIX') {
                if (SignalState.matrix) {
                    SignalState.matrix.enabled = true;
                    SignalState.matrix.lit = isLit;
                    SignalEvents.emit('matrix:updated', isLit ? SignalState.matrix.text : '');
                }
                return;
            }
            if (tUpper === 'ALL') {
                var all = this.getAllUnits();
                for (var a = 0; a < all.length; a++) SignalState.setLamp(all[a].id, isLit);
                if (!isLit && SignalState.matrix && SignalState.matrix.lit) {
                    SignalState.matrix.lit = false;
                    SignalEvents.emit('matrix:updated', '');
                }
                return;
            }
            if (tUpper === 'FEATHERS' || tUpper === 'FEATHER') {
                for (var k = 0; k < SignalState.feathers.length; k++) SignalState.setLamp(SignalState.feathers[k].id, isLit);
                return;
            }

            var matchedFeather = null;
            for (var f = 0; f < SignalState.feathers.length; f++) {
                if (SignalState.feathers[f].id.toUpperCase() === tUpper) {
                    matchedFeather = SignalState.feathers[f];
                    break;
                }
            }
            if (matchedFeather) {
                if (isLit) {
                    for (var f2 = 0; f2 < SignalState.feathers.length; f2++) {
                        if (SignalState.feathers[f2].id !== matchedFeather.id) {
                            SignalState.setLamp(SignalState.feathers[f2].id, false);
                        }
                    }
                }
                SignalState.setLamp(matchedFeather.id, isLit);
                return;
            }

            var group = this.getGroup(target);
            if (group) {
                for (var i = 0; i < group.length; i++) SignalState.setLamp(group[i], isLit);
            } else {
                SignalState.setLamp(target, isLit);
            }
        },

        applyBlinkAction: function(target, rate) {
            if (!target) return;
            var tUpper = String(target).toUpperCase();
            if (tUpper === 'ALL') {
                var all = this.getAllUnits();
                for (var a = 0; a < all.length; a++) this.activeBlinks[all[a].id] = rate;
                return;
            }
            if (tUpper === 'FEATHERS' || tUpper === 'FEATHER') {
                for (var f = 0; f < SignalState.feathers.length; f++) this.activeBlinks[SignalState.feathers[f].id] = rate;
                return;
            }
            var group = this.getGroup(target);
            if (group) {
                for (var i = 0; i < group.length; i++) this.activeBlinks[group[i]] = rate;
            } else {
                this.activeBlinks[target] = rate;
            }
        },

        executeAction: function(act) {
            if (!act) return;
            if (act.op === 'aspect') {
                if (SignalState.currentAspect !== act.target) this.setAspect(act.target);
            } else if (act.op === 'set') {
                this.applySetAction(act.target, true);
            } else if (act.op === 'unset') {
                this.applySetAction(act.target, false);
            } else if (act.op === 'matrix_assign') {
                if (SignalState.matrix) {
                    SignalState.matrix.enabled = true;
                    var assigned = String(this.resolveValue(act.text)).replace(/[\s"']/g, '');
                    SignalState.matrix.text = assigned;
                    if (SignalState.matrix.lit) SignalEvents.emit('matrix:updated', assigned);
                }
            } else if (act.op === 'matrix_set') {
                if (SignalState.matrix) {
                    SignalState.matrix.enabled = true;
                    if (act.text !== undefined && act.text !== '') {
                        SignalState.matrix.text = String(this.resolveValue(act.text)).replace(/[\s"']/g, '');
                    }
                    SignalState.matrix.lit = true;
                    SignalEvents.emit('matrix:updated', SignalState.matrix.text);
                }
            } else if (act.op === 'matrix_unset') {
                if (SignalState.matrix) {
                    SignalState.matrix.lit = false;
                    SignalEvents.emit('matrix:updated', '');
                }
            } else if (act.op === 'blink') {
                this.applyBlinkAction(act.target, act.rate || 500);
            } else if (act.op === 'resume_after') {
                this.holdUntil = Math.max(this.holdUntil || 0, Date.now() + act.duration);
                this.holdBlinks = Object.assign({}, this.activeBlinks);
            } else if (act.op === 'resume_onnextaction') {
                this.holdOnNext = true;
                this.holdBlinks = Object.assign({}, this.activeBlinks);
            } else if (act.op === 'assign') {
                this.executeAssign(act.target, act.value);
            }
        },

        executeAssign: function(target, value) {
            var cleanT = String(target).replace(/[\s_]/g, '').toUpperCase();
            var ctrl = SignalState.controls.filter(function(c) {
                var cIdClean = String(c.id).replace(/[\s_]/g, '').toUpperCase();
                var cLblClean = c.label ? String(c.label).replace(/[\s_]/g, '').toUpperCase() : '';
                return cIdClean === cleanT || cLblClean === cleanT;
            })[0];

            if (ctrl) {
                var targetIdx = -1;
                for (var en in SignalState.enums) {
                    var list = SignalState.enums[en];
                    for (var m = 0; m < list.length; m++) {
                        if (String(list[m]).toUpperCase() === String(value).toUpperCase()) { targetIdx = m; break; }
                    }
                    if (targetIdx !== -1) break;
                }
                SignalState.setControlValue(ctrl.id, targetIdx !== -1 ? targetIdx : (parseInt(value, 10) || 0));
                return;
            }

            var uTarget = String(target).toUpperCase();
            var isFeatherOrLamp = SignalState.feathers.concat(SignalState.lamps).some(function(u) {
                return u.id.toUpperCase() === uTarget;
            });
            if (isFeatherOrLamp) {
                var sVal = String(value).trim().toUpperCase();
                var bVal = (sVal === '1' || sVal === 'ON' || sVal === 'SET' || sVal === 'TRUE');
                this.applySetAction(target, bVal);
                return;
            }
            SignalState.setVar(target, this.resolveValue(value));
        },

        runActionList: function(actions, ruleKey, now) {
            if (!actions) return null;
            for (var a = 0; a < actions.length; a++) {
                var act = actions[a];
                if (act.op === 'if') {
                    var branch = this.getMatchingBranch(act);
                    if (branch) {
                        var nestedOutcome = this.runActionList(branch.actions, ruleKey + '_sub' + a + branch.key, now);
                        if (nestedOutcome === 'end' || (nestedOutcome && nestedOutcome.op === 'jump')) return nestedOutcome;
                    }
                    continue;
                }
                if (act.op === 'jump' || act.op === 'goto') return { op: 'jump', target: act.target, line: act.line };
                if (act.op === 'delay') {
                    this.delayedQueues[ruleKey] = { nextTime: now + (act.duration || 1000), remaining: actions.slice(a + 1) };
                    return 'delay';
                }
                if (act.op === 'end') return 'end';
                this.executeAction(act);
            }
            if (this.delayedQueues[ruleKey]) this.delayedQueues[ruleKey] = { completed: true };
            return 'done';
        },

        processLamps: function(now) {
            var allUnits = this.getAllUnits();
            for (var i = 0; i < allUnits.length; i++) {
                var lampId = allUnits[i].id;
                var isLit = SignalState.getLamp(lampId);
                var rate = this.activeBlinks[lampId];
                if (rate && isLit) {
                    var vis = (now % (rate * 2)) < rate;
                    if (this.blinkState[lampId] !== vis) {
                        this.blinkState[lampId] = vis;
                        SignalEvents.emit('lamp:blink', { id: lampId, visible: vis });
                    }
                } else {
                    if (this.blinkState[lampId] !== isLit) {
                        this.blinkState[lampId] = isLit;
                        SignalEvents.emit('lamp:blink', { id: lampId, visible: isLit });
                    }
                }
            }
        },

        onTick: function() {
            if (!this.ast || this.isPaused) return;
            var now = Date.now();

            if (this.holdUntil) {
                if (now < this.holdUntil) {
                    this.activeBlinks = Object.assign({}, this.holdBlinks);
                    this.processLamps(now);
                    return;
                }
                this.holdUntil = 0; this.holdBlinks = {};
            }

            if (this.holdOnNext) {
                this.activeBlinks = Object.assign({}, this.holdBlinks);
                this.processLamps(now);
                return;
            }

            this.activeBlinks = {};
            for (var m = 0; m < this.ast.mainloops.length; m++) {
                var stmts = this.ast.mainloops[m].statements;
                var labelMap = {};
                for (var s = 0; s < stmts.length; s++) {
                    if (stmts[s].op === 'label' && stmts[s].name) {
                        labelMap[stmts[s].name] = s;
                        labelMap[String(stmts[s].name).toUpperCase()] = s;
                    }
                }

                var idx = 0, safeGuard = 0;
                while (idx < stmts.length && safeGuard < 120) {
                    safeGuard++;
                    var stmt = stmts[idx];
                    var ruleKey = 'm' + m + '_s' + idx;

                    if (stmt.op === 'label') { idx++; continue; }
                    if (stmt.op === 'end') { this.highlightLine(stmt.line); break; }
                    if (stmt.op === 'jump' || stmt.op === 'goto') {
                        var jIdx = (labelMap[stmt.target] !== undefined) ? labelMap[stmt.target] : labelMap[String(stmt.target).toUpperCase()];
                        if (jIdx !== undefined) { this.highlightLine(stmt.line); idx = jIdx; continue; }
                    }
                    if (stmt.op === 'if') {
                        var branch = this.getMatchingBranch(stmt);
                        if (branch) {
                            var branchKey = ruleKey + branch.key;
                            if (this.delayedQueues[ruleKey] && this.delayedQueues[ruleKey].branchKey !== branchKey) delete this.delayedQueues[ruleKey];
                            var outcome;
                            if (this.delayedQueues[ruleKey]) {
                                var queue = this.delayedQueues[ruleKey];
                                if (!queue.completed && now >= queue.nextTime) outcome = this.runActionList(queue.remaining, ruleKey, now);
                            } else {
                                outcome = this.runActionList(branch.actions, ruleKey, now);
                            }
                            if (this.delayedQueues[ruleKey]) this.delayedQueues[ruleKey].branchKey = branchKey;
                            if (outcome === 'end') break;
                            if (outcome && outcome.op === 'jump') {
                                var tIdx = (labelMap[outcome.target] !== undefined) ? labelMap[outcome.target] : labelMap[String(outcome.target).toUpperCase()];
                                if (tIdx !== undefined) { this.highlightLine(outcome.line || stmt.line); idx = tIdx; continue; }
                            }
                        } else if (this.delayedQueues[ruleKey]) {
                            delete this.delayedQueues[ruleKey];
                        }
                    } else {
                        this.executeAction(stmt);
                    }
                    idx++;
                }
            }

            this.processLamps(now);
        },

        setAspect: function(aspectName) {
            if (!this.ast || !this.ast.aspects[aspectName]) return;
            var aspect = this.ast.aspects[aspectName];
            SignalState.currentAspect = aspectName;
            this.activeAspectIndex = this.ast.aspectList.indexOf(aspectName);
            this.highlightLine(aspect.line);
            for (var i = 0; i < aspect.unsets.length; i++) this.applySetAction(aspect.unsets[i], false);
            for (var j = 0; j < aspect.sets.length; j++) this.applySetAction(aspect.sets[j], true);

            if (aspect.matrixLit !== undefined && SignalState.matrix) {
                SignalState.matrix.enabled = true;
                if (aspect.matrixText !== undefined && aspect.matrixText !== '') {
                    SignalState.matrix.text = aspect.matrixText;
                }
                SignalState.matrix.lit = aspect.matrixLit;
                SignalEvents.emit('matrix:updated', aspect.matrixLit ? SignalState.matrix.text : '');
            }
            SignalEvents.emit('aspect:changed', aspectName);
        },

        stepNext: function() { if (!this.ast || !this.ast.aspectList.length) return; this.setAspect(this.ast.aspectList[(this.activeAspectIndex + 1) % this.ast.aspectList.length]); },
        stepPrev: function() { if (!this.ast || !this.ast.aspectList.length) return; this.setAspect(this.ast.aspectList[(this.activeAspectIndex - 1 + this.ast.aspectList.length) % this.ast.aspectList.length]); },
        highlightLine: function(lineNum) { this.activeLine = lineNum; SignalEvents.emit('runtime:line', lineNum); },

        stop: function() {
            this.stopMainClock(); this.activeBlinks = {}; this.blinkState = {};
            this.holdUntil = 0; this.holdOnNext = false; this.holdBlinks = {}; this.delayedQueues = {};
            this.isPaused = false;
        }
    };

    SignalRuntime.init();
    window.SignalRuntime = SignalRuntime;
})(window);