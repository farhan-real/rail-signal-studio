(function(window) {
    'use strict';

    var LeverControl = {
        render: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var color = ctrl.color || '#d92525';
            var positions = ctrl.positions || 2;
            var currentVal = SignalState.getControlValue(id) || 0;
            var minAngle = -25, maxAngle = 25;
            var stepAngle = (maxAngle - minAngle) / Math.max(1, positions - 1);
            var angle = minAngle + currentVal * stepAngle;

            var html = [
                '<div class="console-item lever-item" data-control-id="' + id + '">',
                '  <div class="lever-housing">',
                '    <div class="lever-arc"></div>',
                '    <div class="lever-handle" style="transform: rotate(' + angle.toFixed(1) + 'deg); background-color: ' + color + ';">',
                '      <div class="lever-grip"></div>',
                '      <div class="lever-latch"></div>',
                '    </div>',
                '    <div class="lever-pivot"></div>',
                '  </div>',
                '  <div class="lever-meta">',
                '    <span class="lever-label">' + label + '</span>',
                '    <span class="lever-val">POS ' + currentVal + '</span>',
                '  </div>',
                '</div>'
            ].join('');

            return html;
        },

        bindEvents: function(container) {
            var items = container.querySelectorAll('.lever-item');
            for (var i = 0; i < items.length; i++) {
                (function(item) {
                    var id = item.getAttribute('data-control-id');
                    item.addEventListener('click', function() {
                        var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                        if (!ctrl) return;
                        var maxPos = (ctrl.positions || 2) - 1;
                        var cur = SignalState.getControlValue(id) || 0;
                        var nextVal = cur >= maxPos ? 0 : cur + 1;
                        SignalState.setControlValue(id, nextVal);
                    });
                })(items[i]);
            }
        }
    };

    window.LeverControl = LeverControl;
})(window);