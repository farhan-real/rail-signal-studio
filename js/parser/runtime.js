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

        pause: function() {
            this.isPaused = true;
            this.stopMainClock();
            this.stopTimer();
            SignalEvents.emit('runtime:status', { running: false, aspect: SignalState.currentAspect });
        },

        resume: function() {
            this.isPaused = false;
            this.startMainClock();
            this.onTick();
            SignalEvents.emit('runtime:status', { running: true, aspect: SignalState.currentAspect });
        },

        startMainClock: function() {
            this.stopMainClock();
            var self = this;
            var lastTick = Date.now();
            this.clockId = setInterval(function() {
                var now = Date.now();
                if (now - lastTick >= self.TICK_MS - 4) {
                    lastTick = now;
                    self.onTick();
                }
            }, this.TICK_MS);
        },

        stopMainClock: function() {
            if (this.clockId) { clearInterval(this.clockId); this.clockId = null; }
        },

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

        checkIs: function(leftId, rightVal) {
            var ctrl = SignalState.controls.filter(function(c) { return c.id === leftId; })[0];
            if (ctrl) {
                var curIdx = SignalState.getControlValue(ctrl.id);
                if (curIdx === undefined) curIdx = 0;
                if (String(curIdx) === String(rightVal)) return true;
                var states = (ctrl.enumType && SignalState.enums[ctrl.enumType]) || ctrl.states;
                if (states && states[curIdx] && String(states[curIdx]).toUpperCase() === String(rightVal).toUpperCase()) return true;
                for (var en in SignalState.enums) {
                    var list = SignalState.enums[en];
                    for (var m = 0; m < list.length; m++) {
                        if (String(list[m]).toUpperCase() === String(rightVal).toUpperCase() && curIdx === m) return true;
                    }
                }
                return false;
            }
            return String(this.resolveValue(leftId)).toUpperCase() === String(this.resolveValue(rightVal)).toUpperCase();
        },

        resolveValue: function(name) {
            var v = SignalState.getVar(name);
            if (v !== undefined) return v;
            var ctrlVal = SignalState.getControlValue(name);
            if (ctrlVal !== undefined) return ctrlVal;
            return name;
        },

        getAllUnits: function() {
            var all = SignalState.lamps.concat(SignalState.feathers);
            for (var c = 0; c < SignalState.controls.length; c++) {
                if (SignalState.controls[c].type === 'led') all.push(SignalState.controls[c]);
            }
            return all;
        },

        isItemOrGroupSet: function(name) {
            if (!name) return false;
            if (String(name).toUpperCase() === 'ALL') {
                var all = this.getAllUnits();
                for (var a = 0; a < all.length; a++) { if (!SignalState.getLamp(all[a].id)) return false; }
                return true;
            }
            var group = SignalState.groups[name];
            if (group && group.length > 0) {
                for (var i = 0; i < group.length; i++) { if (!SignalState.getLamp(group[i])) return false; }
                return true;
            }
            return SignalState.getLamp(name);
        },

        applySetAction: function(target, isLit) {
            if (!target) return;
            if (String(target).toUpperCase() === 'ALL') {
                var all = this.getAllUnits();
                for (var a = 0; a < all.length; a++) SignalState.setLamp(all[a].id, isLit);
                return;
            }
            var group = SignalState.groups[target];
            if (group) {
                for (var i = 0; i < group.length; i++) SignalState.setLamp(group[i], isLit);
            } else {
                SignalState.setLamp(target, isLit);
            }
        },

        applyBlinkAction: function(target, rate) {
            if (!target) return;
            if (String(target).toUpperCase() === 'ALL') {
                var all = this.getAllUnits();
                for (var a = 0; a < all.length; a++) this.activeBlinks[all[a].id] = rate;
                return;
            }
            var group = SignalState.groups[target];
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
            } else if (act.op === 'matrix') {
                if (SignalState.matrix && SignalState.matrix.text !== act.text) {
                    SignalState.matrix.text = act.text; SignalEvents.emit('matrix:updated', act.text);
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
            var ctrl = SignalState.controls.filter(function(c) { return c.id === target; })[0];
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
            SignalState.setVar(target, this.resolveValue(value));
        },

        runActionList: function(actions, ruleKey, now) {
            if (!actions) return null;
            for (var a = 0; a < actions.length; a++) {
                var act = actions[a];
                if (act.op === 'delay') {
                    this.delayedQueues[ruleKey] = {
                        nextTime: now + (act.duration || 1000),
                        remaining: actions.slice(a + 1)
                    };
                    return 'delay';
                }
                if (act.op === 'end') return 'end';
                this.executeAction(act);
            }
            this.delayedQueues[ruleKey] = { completed: true };
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
                for (var s = 0; s < stmts.length; s++) { if (stmts[s].op === 'label') labelMap[stmts[s].name] = s; }

                var idx = 0, safeGuard = 0;
                while (idx < stmts.length && safeGuard < 120) {
                    safeGuard++;
                    var stmt = stmts[idx];
                    var ruleKey = 'm' + m + '_s' + idx;

                    if (stmt.op === 'label') { idx++; continue; }
                    if (stmt.op === 'end') { this.highlightLine(stmt.line); break; }
                    if (stmt.op === 'jump' && labelMap[stmt.target] !== undefined) {
                        this.highlightLine(stmt.line); idx = labelMap[stmt.target]; continue;
                    }
                    if (stmt.op === 'if') {
                        if (this.evalExpr(stmt.expr)) {
                            var outcome;
                            if (this.delayedQueues[ruleKey]) {
                                var queue = this.delayedQueues[ruleKey];
                                if (!queue.completed && now >= queue.nextTime) {
                                    outcome = this.runActionList(queue.remaining, ruleKey, now);
                                }
                            } else {
                                outcome = this.runActionList(stmt.actions, ruleKey, now);
                            }
                            if (outcome === 'end') break;
                        } else {
                            if (this.delayedQueues[ruleKey]) delete this.delayedQueues[ruleKey];
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
            if (aspect.matrix !== undefined && SignalState.matrix) {
                SignalState.matrix.text = aspect.matrix; SignalEvents.emit('matrix:updated', aspect.matrix);
            }
            SignalEvents.emit('aspect:changed', aspectName);
        },

        stepNext: function() {
            if (!this.ast || this.ast.aspectList.length === 0) return;
            var nextIdx = (this.activeAspectIndex + 1) % this.ast.aspectList.length;
            this.setAspect(this.ast.aspectList[nextIdx]);
        },

        stepPrev: function() {
            if (!this.ast || this.ast.aspectList.length === 0) return;
            var prevIdx = (this.activeAspectIndex - 1 + this.ast.aspectList.length) % this.ast.aspectList.length;
            this.setAspect(this.ast.aspectList[prevIdx]);
        },

        startTimer: function() {
            this.stopTimer();
            if (!this.ast || !this.ast.timers || this.ast.timers.length === 0) return;
            var timer = this.ast.timers[0], self = this;
            this.stepTimerId = setInterval(function() {
                if (self.isPaused) return;
                self.highlightLine(timer.line);
                if (timer.action === 'next') self.stepNext();
                else if (timer.action === 'prev') self.stepPrev();
                else self.setAspect(timer.action);
            }, timer.duration);
        },

        stopTimer: function() {
            if (this.stepTimerId) { clearInterval(this.stepTimerId); this.stepTimerId = null; }
        },

        highlightLine: function(lineNum) {
            this.activeLine = lineNum; SignalEvents.emit('runtime:line', lineNum);
        },

        stop: function() {
            this.stopTimer(); this.stopMainClock(); this.activeBlinks = {}; this.blinkState = {};
            this.holdUntil = 0; this.holdOnNext = false; this.holdBlinks = {}; this.delayedQueues = {};
            this.isPaused = false;
        }
    };

    SignalRuntime.init();
    window.SignalRuntime = SignalRuntime;
})(window);