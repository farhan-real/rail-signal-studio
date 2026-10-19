(function(window) {
    'use strict';

    var KnobControl = {
        getStates: function(ctrl) {
            if (ctrl.enumType && SignalState.enums[ctrl.enumType]) {
                return SignalState.enums[ctrl.enumType];
            }
            for (var eKey in SignalState.enums) {
                if (eKey.toUpperCase() === ctrl.id.toUpperCase() || (ctrl.label && eKey.toUpperCase() === ctrl.label.toUpperCase())) {
                    return SignalState.enums[eKey];
                }
            }
            return ctrl.states || ['0', '1', '2'];
        },

        getAngles: function(ctrl, states) {
            var isHalf = (ctrl.mode === 'half');
            var numStates = Math.max(1, states.length);
            var minAngle = isHalf ? -90 : -135;
            var maxAngle = isHalf ? 90 : 135;
            var totalSweep = maxAngle - minAngle;
            var stepAngle = numStates > 1 ? totalSweep / (numStates - 1) : 0;
            return { isHalf: isHalf, minAngle: minAngle, maxAngle: maxAngle, stepAngle: stepAngle };
        },

        getShortestAngle: function(currentAngle, targetAngle) {
            if (currentAngle === undefined || isNaN(currentAngle)) return targetAngle;
            var diff = (targetAngle - currentAngle) % 360;
            if (diff < 0) diff += 360;
            if (diff > 180) diff -= 360;
            else if (diff === 180) diff = 180;
            return currentAngle + diff;
        },

        render: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var states = this.getStates(ctrl);
            var currentVal = SignalState.getControlValue(id) || 0;
            var cfg = this.getAngles(ctrl, states);
            var baseAngle = cfg.minAngle + currentVal * cfg.stepAngle;
            var angle = this.getShortestAngle(ctrl._currentAngle, baseAngle);
            ctrl._currentAngle = angle;

            var maxLen = 0;
            for (var m = 0; m < states.length; m++) {
                if (states[m] && states[m].length > maxLen) maxLen = states[m].length;
            }
            var asmWidth = (maxLen >= 9 || states.length >= 4) ? 190 : 140;
            var cx = Math.round(asmWidth / 2);
            var cy = cfg.isHalf ? 48 : 48;
            var bezelLeft = cx - 22;

            var labelsHtml = '', ticksHtml = '';

            for (var i = 0; i < states.length; i++) {
                var itemAngle = cfg.minAngle + i * cfg.stepAngle;
                var rad = itemAngle * Math.PI / 180;
                var isActive = (i === currentVal) ? 'active' : '';

                var dist = 30;
                var transform = 'translate(-50%, -100%)';

                if (itemAngle <= -65) {
                    transform = 'translate(-100%, -50%)';
                    dist = 28;
                } else if (itemAngle >= 65) {
                    transform = 'translate(0%, -50%)';
                    dist = 28;
                } else if (itemAngle < -15) {
                    transform = 'translate(-100%, -75%)';
                    dist = 30;
                } else if (itemAngle > 15) {
                    transform = 'translate(0%, -75%)';
                    dist = 30;
                } else {
                    transform = 'translate(-50%, -100%)';
                    dist = 32;
                }

                var lx = cx + Math.sin(rad) * dist;
                var ly = cy - Math.cos(rad) * dist;

                var stateText = states[i];
                labelsHtml += '<span class="knob-dial-label ' + isActive + '" style="left:' + lx.toFixed(1) + 'px; top:' + ly.toFixed(1) + 'px; transform:' + transform + ';" data-knob-id="' + id + '" data-pos-idx="' + i + '">' + stateText + '</span>';
                ticksHtml += '<div class="knob-tick ' + isActive + '" style="transform: rotate(' + itemAngle.toFixed(1) + 'deg)" data-tick-idx="' + i + '"></div>';
            }

            var assemblyClass = 'knob-assembly' + (cfg.isHalf ? ' mode-half' : '');
            var itemStyle = 'min-width: ' + (asmWidth + 14) + 'px;';
            var asmStyle = 'width: ' + asmWidth + 'px;';
            var bezelStyle = 'left: ' + bezelLeft + 'px;';

            return [
                '<div class="console-item knob-item" data-control-id="' + id + '" style="' + itemStyle + '">',
                '  <div class="' + assemblyClass + '" style="' + asmStyle + '">',
                labelsHtml,
                '    <div class="knob-ticks-layer" style="' + bezelStyle + '">' + ticksHtml + '</div>',
                '    <div class="knob-bezel" style="' + bezelStyle + '">',
                '      <div class="knob-body" style="transform: rotate(' + angle.toFixed(1) + 'deg)">',
                '        <div class="knob-pointer"></div>',
                '        <div class="knob-cap"></div>',
                '      </div>',
                '    </div>',
                '  </div>',
                '  <div class="knob-meta">',
                '    <span class="knob-label">' + label + '</span>',
                '  </div>',
                '</div>'
            ].join('');
        },

        bindEvents: function(container) {
            var self = this;
            var items = container.querySelectorAll('.knob-item');
            for (var i = 0; i < items.length; i++) {
                (function(item) {
                    var id = item.getAttribute('data-control-id');
                    var bezel = item.querySelector('.knob-bezel');
                    if (!bezel) return;

                    var isPointerDown = false, hasDragged = false;
                    var startX = 0, startY = 0;
                    var downLabelIdx = null, downTickIdx = null;

                    var advanceNext = function() {
                        var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                        if (!ctrl) return;
                        var states = self.getStates(ctrl);
                        if (states.length <= 1) return;
                        var cur = SignalState.getControlValue(id) || 0;
                        SignalState.setControlValue(id, (cur + 1) % states.length);
                    };

                    var selectAnglePosition = function(e) {
                        var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                        if (!ctrl) return;
                        var states = self.getStates(ctrl);
                        if (states.length <= 1) return;
                        var cfg = self.getAngles(ctrl, states);

                        var rect = bezel.getBoundingClientRect();
                        var bcx = rect.left + rect.width / 2;
                        var bcy = rect.top + rect.height / 2;
                        var dx = e.clientX - bcx;
                        var dy = bcy - e.clientY;

                        var angleDeg = Math.atan2(dx, dy) * 180 / Math.PI;
                        var clamped = Math.max(cfg.minAngle, Math.min(cfg.maxAngle, angleDeg));
                        var closestIdx = Math.round((clamped - cfg.minAngle) / cfg.stepAngle);
                        closestIdx = Math.max(0, Math.min(states.length - 1, closestIdx));
                        SignalState.setControlValue(id, closestIdx);
                    };

                    var onPointerDown = function(e) {
                        if (e.target.closest('.control-dot') || e.target.closest('.control-dot-menu')) return;
                        e.stopPropagation();

                        var lbl = e.target.closest('.knob-dial-label');
                        downLabelIdx = lbl ? parseInt(lbl.getAttribute('data-pos-idx'), 10) : null;
                        var tck = e.target.closest('.knob-tick');
                        downTickIdx = tck ? parseInt(tck.getAttribute('data-tick-idx'), 10) : null;

                        isPointerDown = true;
                        hasDragged = false;
                        startX = e.clientX;
                        startY = e.clientY;
                        try { item.setPointerCapture(e.pointerId); } catch (err) {}
                    };

                    var onPointerMove = function(e) {
                        if (!isPointerDown) return;
                        if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) {
                            hasDragged = true;
                            selectAnglePosition(e);
                        }
                    };

                    var onPointerUp = function(e) {
                        if (!isPointerDown) return;
                        isPointerDown = false;
                        try { item.releasePointerCapture(e.pointerId); } catch (err) {}

                        if (hasDragged) return;

                        if (downLabelIdx !== null && !isNaN(downLabelIdx)) {
                            SignalState.setControlValue(id, downLabelIdx);
                            return;
                        }

                        if (downTickIdx !== null && !isNaN(downTickIdx)) {
                            SignalState.setControlValue(id, downTickIdx);
                            return;
                        }

                        var rect = bezel.getBoundingClientRect();
                        var bcx = rect.left + rect.width / 2;
                        var bcy = rect.top + rect.height / 2;
                        var dist = Math.hypot(e.clientX - bcx, e.clientY - bcy);

                        if (dist <= (rect.width / 2 + 2)) {
                            advanceNext();
                            return;
                        }

                        var meta = item.querySelector('.knob-meta');
                        if (meta && meta.contains(document.elementFromPoint(e.clientX, e.clientY))) {
                            advanceNext();
                            return;
                        }

                        selectAnglePosition(e);
                    };

                    item.addEventListener('pointerdown', onPointerDown);
                    item.addEventListener('pointermove', onPointerMove);
                    item.addEventListener('pointerup', onPointerUp);
                    item.addEventListener('pointercancel', onPointerUp);
                })(items[i]);
            }
        }
    };

    window.KnobControl = KnobControl;
})(window);