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
            var stepAngle = 270 / Math.max(1, states.length - 1);
            var angle = -135 + currentVal * stepAngle;
            var stateLabel = states[currentVal] !== undefined ? states[currentVal] : currentVal;

            var html = [
                '<div class="console-item knob-item" data-control-id="' + id + '">',
                '  <div class="knob-bezel">',
                '    <div class="knob-indicator-dot" style="transform: rotate(' + angle + 'deg)">',
                '      <div class="knob-line"></div>',
                '    </div>',
                '    <div class="knob-center"></div>',
                '  </div>',
                '  <div class="knob-meta">',
                '    <span class="knob-label">' + label + '</span>',
                '    <span class="knob-state">' + stateLabel + '</span>',
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
                    item.addEventListener('click', function() {
                        var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                        if (!ctrl) return;
                        var states = self.getStates(ctrl);
                        var cur = SignalState.getControlValue(id) || 0;
                        var nextVal = (cur + 1) % states.length;
                        SignalState.setControlValue(id, nextVal);
                    });
                })(items[i]);
            }
        }
    };

    window.KnobControl = KnobControl;
})(window);
