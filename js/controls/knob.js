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

        render: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var states = this.getStates(ctrl);
            var currentVal = SignalState.getControlValue(id) || 0;
            var numStates = Math.max(1, states.length);
            var stepAngle = numStates > 1 ? 270 / (numStates - 1) : 0;
            var angle = -135 + currentVal * stepAngle;

            var cx = 56, cy = 48, radius = 38;
            var labelsHtml = '';

            for (var i = 0; i < states.length; i++) {
                var itemAngle = -135 + i * stepAngle;
                var rad = itemAngle * Math.PI / 180;
                var lx = cx + Math.sin(rad) * radius;
                var ly = cy - Math.cos(rad) * radius;
                var isActive = (i === currentVal) ? 'active' : '';
                var stateText = states[i];
                labelsHtml += '<span class="knob-dial-label ' + isActive + '" style="left:' + lx.toFixed(1) + 'px; top:' + ly.toFixed(1) + 'px;" data-knob-id="' + id + '" data-pos-idx="' + i + '">' + stateText + '</span>';
            }

            var html = [
                '<div class="console-item knob-item" data-control-id="' + id + '">',
                '  <div class="knob-assembly">',
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
                        bezel.addEventListener('click', function(e) {
                            e.stopPropagation();
                            var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                            if (!ctrl) return;
                            var states = self.getStates(ctrl);
                            var cur = SignalState.getControlValue(id) || 0;
                            var nextVal = (cur + 1) % states.length;
                            SignalState.setControlValue(id, nextVal);
                        });
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