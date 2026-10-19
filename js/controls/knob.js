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

        render: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var states = this.getStates(ctrl);
            var currentVal = SignalState.getControlValue(id) || 0;
            var cfg = this.getAngles(ctrl, states);
            var angle = cfg.minAngle + currentVal * cfg.stepAngle;

            var cx = 58, cy = cfg.isHalf ? 50 : 48;
            var radius = cfg.isHalf ? 36 : 38;
            var labelsHtml = '';

            for (var i = 0; i < states.length; i++) {
                var itemAngle = cfg.minAngle + i * cfg.stepAngle;
                var rad = itemAngle * Math.PI / 180;
                var lx = cx + Math.sin(rad) * radius;
                var ly = cy - Math.cos(rad) * radius;
                var isActive = (i === currentVal) ? 'active' : '';
                var stateText = states[i];
                labelsHtml += '<span class="knob-dial-label ' + isActive + '" style="left:' + lx.toFixed(1) + 'px; top:' + ly.toFixed(1) + 'px;" data-knob-id="' + id + '" data-pos-idx="' + i + '">' + stateText + '</span>';
            }

            var assemblyClass = 'knob-assembly' + (cfg.isHalf ? ' mode-half' : '');
            var html = [
                '<div class="console-item knob-item" data-control-id="' + id + '">',
                '  <div class="' + assemblyClass + '">',
                labelsHtml,
                '    <div class="knob-bezel">',
                '      <div class="knob-body" style="transform: rotate(' + angle.toFixed(1) + 'deg)">',
                '        <div class="knob-pointer"></div>',
                '        <div class="knob-cap"></div>',
                '      </div>',
                '    </div>',
                '  </div>',
                '  <div class="knob-meta">',
                '    <span class="knob-label" data-edit-label="' + id + '">' + label + '</span>',
                '  </div>',
                '</div>'
            ].join('');

            return html;
        },

        bindEvents: function(container) {
            var self = this;
            var items = container.querySelectorAll('.knob-item');
            for (var i = 0; i < items.length; i++) {
                (function(item) {
                    var id = item.getAttribute('data-control-id');
                    var bezel = item.querySelector('.knob-bezel');
                    if (bezel) {
                        var isRotating = false;
                        var onPointerDown = function(e) {
                            e.stopPropagation();
                            isRotating = true;
                            bezel.setPointerCapture(e.pointerId);
                            handleTurn(e);
                        };

                        var onPointerMove = function(e) {
                            if (!isRotating) return;
                            handleTurn(e);
                        };

                        var onPointerUp = function(e) {
                            if (!isRotating) return;
                            isRotating = false;
                            try { bezel.releasePointerCapture(e.pointerId); } catch (err) {}
                        };

                        var handleTurn = function(e) {
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

                        bezel.addEventListener('pointerdown', onPointerDown);
                        bezel.addEventListener('pointermove', onPointerMove);
                        bezel.addEventListener('pointerup', onPointerUp);
                        bezel.addEventListener('pointercancel', onPointerUp);
                    }

                    var dialLabels = item.querySelectorAll('.knob-dial-label');
                    for (var d = 0; d < dialLabels.length; d++) {
                        dialLabels[d].addEventListener('click', function(e) {
                            e.stopPropagation();
                            var posIdx = parseInt(this.getAttribute('data-pos-idx'), 10);
                            SignalState.setControlValue(id, posIdx);
                        });
                    }
                })(items[i]);
            }
        }
    };

    window.KnobControl = KnobControl;
})(window);