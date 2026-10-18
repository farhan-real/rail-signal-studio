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
        TICK_MS: 50,

        init: function() {
            var self = this;
            SignalEvents.on('control:changed', function(payload) {
                if (self.holdOnNext && payload.value !== 0) {
                    self.holdOnNext = false;
                    self.holdBlinks = {};
                }
                self.onTick();
            });
        },

        loadAst: function(ast) {
            this.stop();
            this.ast = ast;
            this.activeAspectIndex = -1;
            this.holdUntil = 0;
            this.holdOnNext = false;
            this.holdBlinks = {};
            SignalState.groups = ast.groups || {};
            SignalState.enums = ast.enums || {};
            SignalState.variables = {};
            for (var k in ast.variables) SignalState.variables[k] = ast.variables[k];
            if (ast.aspectList.length > 0) this.setAspect(ast.aspectList[0]);
            this.startMainClock();
            this.onTick();
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
                var curIdx = SignalState.getControlValue(ctrl.id) || 0;
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
            if (name.toUpperCase() === 'ALL') {
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
            if (target.toUpperCase() === 'ALL') {
                var all = this.getAllUnits();
                for (var a = 0; a < all.length; a++) SignalState.setLamp(all[a].id, isLit);
                if (!isLit && SignalState.matrix) { SignalState.matrix.text = ''; SignalEvents.emit('matrix:updated', ''); }
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
            if (target.toUpperCase() === 'ALL') {
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
                } else if (this.blinkState[lampId] === false) {
                    this.blinkState[lampId] = true;
                    SignalEvents.emit('lamp:blink', { id: lampId, visible: true });
                }
            }
        },

        onTick: function() {
            if (!this.ast) return;
            var now = Date.now();

            if (this.holdUntil) {
                if (now < this.holdUntil) {
                    this.activeBlinks = Object.assign({}, this.holdBlinks);
                    this.processLamps(now);
                    return;
                }
                this.holdUntil = 0;
                this.holdBlinks = {};
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
                    if (stmt.op === 'label') { idx++; continue; }
                    if (stmt.op === 'end') { this.highlightLine(stmt.line); break; }
                    if (stmt.op === 'jump' && labelMap[stmt.target] !== undefined) {
                        this.highlightLine(stmt.line); idx = labelMap[stmt.target]; continue;
                    }
                    if (stmt.op === 'if' && this.evalExpr(stmt.expr)) {
                        var jumped = false, ended = false;
                        for (var a = 0; a < stmt.actions.length; a++) {
                            var act = stmt.actions[a];
                            if (act.op === 'end') { ended = true; this.highlightLine(stmt.line); break; }
                            if (act.op === 'jump' && labelMap[act.target] !== undefined) {
                                this.highlightLine(stmt.line); idx = labelMap[act.target]; jumped = true; break;
                            }
                            this.executeAction(act);
                        }
                        if (ended) break;
                        if (jumped) continue;
                    } else if (stmt.op === 'assign' || stmt.op === 'resume_after' || stmt.op === 'resume_onnextaction') {
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
            this.setAspect(this.ast.aspectList[(this.activeAspectIndex + 1) % this.ast.aspectList.length]);
        },

        stepPrev: function() {
            if (!this.ast || this.ast.aspectList.length === 0) return;
            this.setAspect(this.ast.aspectList[(this.activeAspectIndex - 1 + this.ast.aspectList.length) % this.ast.aspectList.length]);
        },

        startTimer: function() {
            this.stopTimer();
            if (!this.ast || this.ast.timers.length === 0) return;
            var timer = this.ast.timers[0], self = this;
            this.stepTimerId = setInterval(function() {
                self.highlightLine(timer.line);
                if (timer.action === 'next') self.stepNext();
                else if (timer.action === 'prev') self.stepPrev();
                else self.setAspect(timer.action);
            }, timer.duration);
            SignalEvents.emit('runtime:timer', true);
        },

        stopTimer: function() {
            if (this.stepTimerId) { clearInterval(this.stepTimerId); this.stepTimerId = null; SignalEvents.emit('runtime:timer', false); }
        },

        highlightLine: function(lineNum) {
            this.activeLine = lineNum; SignalEvents.emit('runtime:line', lineNum);
        },

        stop: function() {
            this.stopTimer(); this.stopMainClock(); this.activeBlinks = {}; this.blinkState = {};
            this.holdUntil = 0; this.holdOnNext = false; this.holdBlinks = {};
        }
    };

    SignalRuntime.init();
    window.SignalRuntime = SignalRuntime;
})(window);
