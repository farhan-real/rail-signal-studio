(function(window) {
    'use strict';

    var LedPalette = {
        red: { hex: '#ff2b2b', glow: 'rgba(255, 43, 43, 0.9)', off: '#240606' },
        yellow: { hex: '#ffb300', glow: 'rgba(255, 179, 0, 0.9)', off: '#261b05' },
        green: { hex: '#00f543', glow: 'rgba(0, 245, 67, 0.9)', off: '#05220f' },
        white: { hex: '#f0f6ff', glow: 'rgba(240, 246, 255, 0.95)', off: '#1a1f26' },
        blue: { hex: '#298bff', glow: 'rgba(41, 139, 255, 0.9)', off: '#07162b' }
    };

    var LedControl = {
        palette: LedPalette,
        colorKeys: ['red', 'yellow', 'green', 'white', 'blue'],

        render: function(ctrl) {
            var id = ctrl.id;
            var label = ctrl.label || id;
            var cKey = (ctrl.colorKey || 'red').toLowerCase();
            var pal = this.palette[cKey] || this.palette.red;
            var isLit = SignalState.getLamp(id);

            var litClass = isLit ? 'is-lit' : 'is-off';
            var inlineStyle = '--led-on: ' + pal.hex + '; --led-glow: ' + pal.glow + '; --led-off: ' + pal.off + ';';

            var html = [
                '<div class="console-item led-item" data-control-id="' + id + '" style="' + inlineStyle + '">',
                '  <div class="panel-led">',
                '    <div class="led-bezel">',
                '      <div class="led-lens ' + litClass + '">',
                '        <div class="led-reflection"></div>',
                '      </div>',
                '    </div>',
                '  </div>',
                '  <div class="led-meta">',
                '    <span class="led-label" data-edit-label="' + id + '">' + label + '</span>',
                '  </div>',
                '</div>'
            ].join('');

            return html;
        },

        bindEvents: function(container) {
            var self = this;
            var leds = container.querySelectorAll('.led-item');
            for (var i = 0; i < leds.length; i++) {
                (function(el) {
                    var id = el.getAttribute('data-control-id');
                    var ctrl = SignalState.controls.filter(function(c) { return c.id === id; })[0];
                    if (!ctrl) return;

                    el.addEventListener('contextmenu', function(e) {
                        e.preventDefault();
                        var curKey = (ctrl.colorKey || 'red').toLowerCase();
                        var nextIdx = (self.colorKeys.indexOf(curKey) + 1) % self.colorKeys.length;
                        ctrl.colorKey = self.colorKeys[nextIdx];
                        SignalEvents.emit('state:changed');
                    });
                })(leds[i]);
            }
        }
    };

    window.LedControl = LedControl;
})(window);