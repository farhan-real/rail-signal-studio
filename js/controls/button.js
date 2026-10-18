(function(window) {
    'use strict';

    var ButtonControl = {
        renderButton: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var color = ctrl.color || '#3b82f6';
            var currentVal = SignalState.getControlValue(id) || 0;
            var activeClass = currentVal === 1 ? 'button-active' : '';

            return [
                '<div class="console-item button-item ' + activeClass + '" data-control-id="' + id + '">',
                '  <div class="push-button" style="border-color: ' + color + '">',
                '    <div class="button-cap" style="background-color: ' + color + '"></div>',
                '  </div>',
                '  <div class="button-meta">',
                '    <span class="button-label">' + label + '</span>',
                '  </div>',
                '</div>'
            ].join('');
        },

        renderSwitch: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var currentVal = SignalState.getControlValue(id) || 0;
            var toggleClass = currentVal === 1 ? 'switch-on' : 'switch-off';

            return [
                '<div class="console-item switch-item" data-control-id="' + id + '">',
                '  <div class="toggle-plate ' + toggleClass + '">',
                '    <div class="toggle-bat"></div>',
                '  </div>',
                '  <div class="switch-meta">',
                '    <span class="switch-label">' + label + '</span>',
                '    <span class="switch-state">' + (currentVal === 1 ? 'ON' : 'OFF') + '</span>',
                '  </div>',
                '</div>'
            ].join('');
        },

        bindEvents: function(container) {
            var buttons = container.querySelectorAll('.button-item');
            for (var i = 0; i < buttons.length; i++) {
                (function(btn) {
                    var id = btn.getAttribute('data-control-id');
                    var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                    if (!ctrl) return;

                    if (ctrl.isToggle) {
                        btn.addEventListener('click', function() {
                            var cur = SignalState.getControlValue(id) || 0;
                            SignalState.setControlValue(id, cur === 1 ? 0 : 1);
                        });
                    } else {
                        btn.addEventListener('pointerdown', function(e) {
                            e.preventDefault();
                            SignalState.setControlValue(id, 1);
                        });
                        window.addEventListener('pointerup', function() {
                            if (SignalState.getControlValue(id) === 1) SignalState.setControlValue(id, 0);
                        });
                    }
                })(buttons[i]);
            }

            var switches = container.querySelectorAll('.switch-item');
            for (var j = 0; j < switches.length; j++) {
                (function(sw) {
                    var id = sw.getAttribute('data-control-id');
                    sw.addEventListener('click', function() {
                        var cur = SignalState.getControlValue(id) || 0;
                        SignalState.setControlValue(id, cur === 1 ? 0 : 1);
                    });
                })(switches[j]);
            }
        }
    };

    window.ButtonControl = ButtonControl;
})(window);
