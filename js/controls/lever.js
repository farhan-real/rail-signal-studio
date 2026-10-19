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
                        var isDraggingHandle = false;
                        var hasMoved = false;
                        var startX = 0, startY = 0;

                        var handleMove = function(e) {
                            var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                            if (!ctrl) return;
                            var positions = Math.max(2, ctrl.positions || 2);
                            var minAngle = -22, maxAngle = 22;
                            var stepAngle = (maxAngle - minAngle) / (positions - 1);

                            var rect = frame.getBoundingClientRect();
                            var pivotX = rect.left + rect.width / 2;
                            var pivotY = rect.top + rect.height * 0.86;
                            var dx = e.clientX - pivotX;
                            var dy = pivotY - e.clientY;
                            var angleDeg = Math.atan2(dx, dy) * 180 / Math.PI;

                            var clamped = Math.max(minAngle, Math.min(maxAngle, angleDeg));
                            var closest = Math.round((clamped - minAngle) / stepAngle);
                            closest = Math.max(0, Math.min(positions - 1, closest));
                            SignalState.setControlValue(id, closest);
                        };

                        frame.addEventListener('pointerdown', function(e) {
                            e.stopPropagation();
                            isDraggingHandle = true;
                            hasMoved = false;
                            startX = e.clientX;
                            startY = e.clientY;
                            frame.setPointerCapture(e.pointerId);
                        });

                        frame.addEventListener('pointermove', function(e) {
                            if (!isDraggingHandle) return;
                            if (Math.abs(e.clientX - startX) > 4 || Math.abs(e.clientY - startY) > 4) {
                                hasMoved = true;
                                handleMove(e);
                            }
                        });

                        var stopDrag = function(e) {
                            if (!isDraggingHandle) return;
                            isDraggingHandle = false;
                            try { frame.releasePointerCapture(e.pointerId); } catch (err) {}

                            if (!hasMoved) {
                                var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                                if (!ctrl) return;
                                var positions = Math.max(2, ctrl.positions || 2);
                                var cur = SignalState.getControlValue(id) || 0;
                                var nextVal = (cur + 1) % positions;
                                SignalState.setControlValue(id, nextVal);
                            }
                        };

                        frame.addEventListener('pointerup', stopDrag);
                        frame.addEventListener('pointercancel', stopDrag);
                    }
                })(items[i]);
            }
        }
    };

    window.LeverControl = LeverControl;
})(window);