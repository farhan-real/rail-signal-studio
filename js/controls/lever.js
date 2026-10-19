(function(window) {
    'use strict';

    var LeverControl = {
        render: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var color = ctrl.color || '#d92525';
            var positions = Math.max(2, ctrl.positions || 2);
            var currentVal = SignalState.getControlValue(id) || 0;
            var minAngle = -22, maxAngle = 22;
            var stepAngle = (maxAngle - minAngle) / (positions - 1);
            var angle = minAngle + currentVal * stepAngle;

            var notchesHtml = '';
            for (var p = 0; p < positions; p++) {
                var nAngle = minAngle + p * stepAngle;
                var isActive = (p === currentVal) ? 'active' : '';
                notchesHtml += '<div class="lever-notch ' + isActive + '" style="transform: rotate(' + nAngle.toFixed(1) + 'deg)" data-pos-val="' + p + '"></div>';
            }

            var html = [
                '<div class="console-item lever-item" data-control-id="' + id + '">',
                '  <div class="lever-frame">',
                '    <div class="lever-quadrant">',
                notchesHtml,
                '    </div>',
                '    <div class="lever-handle" style="transform: rotate(' + angle.toFixed(1) + 'deg);">',
                '      <div class="lever-grip" style="background-color: ' + color + ';"></div>',
                '      <div class="lever-latch-trigger"></div>',
                '      <div class="lever-rod"></div>',
                '    </div>',
                '    <div class="lever-pivot-bolt"></div>',
                '  </div>',
                '  <div class="lever-meta">',
                '    <span class="lever-label" data-edit-label="' + id + '">' + label + '</span>',
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
                    var frame = item.querySelector('.lever-frame');
                    if (frame) {
                        frame.addEventListener('click', function(e) {
                            e.stopPropagation();
                            var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                            if (!ctrl) return;
                            var maxPos = Math.max(2, ctrl.positions || 2) - 1;
                            var cur = SignalState.getControlValue(id) || 0;
                            var nextVal = cur >= maxPos ? 0 : cur + 1;
                            SignalState.setControlValue(id, nextVal);
                        });
                    }
                })(items[i]);
            }
        }
    };

    window.LeverControl = LeverControl;
})(window);