(function(window) {
    'use strict';

    var ButtonControl = {
        renderButton: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var color = ctrl.color || '#2e68f8';
            var currentVal = SignalState.getControlValue(id) || 0;
            var activeClass = currentVal === 1 ? 'button-pressed' : '';

            return [
                '<div class="console-item button-item ' + activeClass + '" data-control-id="' + id + '">',
                '  <div class="button-bezel">',
                '    <div class="button-cap" style="background-color: ' + color + ';">',
                '      <div class="button-light"></div>',
                '    </div>',
                '  </div>',
                '  <div class="button-meta">',
                '    <span class="button-label" data-edit-label="' + id + '">' + label + '</span>',
                '    <span class="button-state">' + (ctrl.isToggle ? (currentVal === 1 ? 'ON' : 'OFF') : '') + '</span>',
                '  </div>',
                '</div>'
            ].join('');
        },

        renderSwitch: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var currentVal = SignalState.getControlValue(id) || 0;
            var activeClass = currentVal === 1 ? 'switch-on' : 'switch-off';

            return [
                '<div class="console-item switch-item ' + activeClass + '" data-control-id="' + id + '">',
                '  <div class="switch-plate">',
                '    <div class="switch-screw screw-tl"></div>',
                '    <div class="switch-screw screw-br"></div>',
                '    <div class="switch-well">',
                '      <div class="switch-bat"></div>',
                '    </div>',
                '  </div>',
                '  <div class="switch-meta">',
                '    <span class="switch-label" data-edit-label="' + id + '">' + label + '</span>',
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

                    var bezel = btn.querySelector('.button-bezel');
                    if (!bezel) return;

                    if (ctrl.isToggle) {
                        bezel.addEventListener('click', function(e) {
                            e.stopPropagation();
                            var cur = SignalState.getControlValue(id) || 0;
                            SignalState.setControlValue(id, cur === 1 ? 0 : 1);
                        });
                    } else {
                        bezel.addEventListener('pointerdown', function(e) {
                            e.stopPropagation();
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
                    var plate = sw.querySelector('.switch-plate');
                    if (plate) {
                        plate.addEventListener('click', function(e) {
                            e.stopPropagation();
                            var cur = SignalState.getControlValue(id) || 0;
                            SignalState.setControlValue(id, cur === 1 ? 0 : 1);
                        });
                    }
                })(switches[j]);
            }
        }
    };

    window.ButtonControl = ButtonControl;
})(window);