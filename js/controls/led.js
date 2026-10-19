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
            var isBlinking = window.SignalRuntime && window.SignalRuntime.activeBlinks && !!window.SignalRuntime.activeBlinks[id];
            var stateText = isBlinking ? 'BLINK' : (isLit ? 'ON' : 'OFF');

            var litClass = isLit ? 'is-lit' : 'is-off';
            var inlineStyle = '--led-on: ' + pal.hex + '; --led-glow: ' + pal.glow + '; --led-off: ' + pal.off + ';';

            return [
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
                '    <span class="led-state-text">' + stateText + '</span>',
                '  </div>',
                '</div>'
            ].join('');
        },

        bindEvents: function() {
            // Panel indicator LEDs are output displays driven by interlocking simulation
        }
    };

    window.LedControl = LedControl;
})(window);