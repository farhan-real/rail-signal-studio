(function(window) {
    'use strict';

    var LampColors = {
        red: { off: '#240808', lit: '#ff1e10', core: '#ff3020' },
        yellow: { off: '#261b05', lit: '#ff9e00', core: '#ffb31a' },
        green: { off: '#05220f', lit: '#00e844', core: '#1afe56' },
        white: { off: '#1a1f26', lit: '#eef5fc', core: '#f8fbff' },
        violet: { off: '#200826', lit: '#cc22ff', core: '#d944ff' }
    };

    var LampRenderer = {
        render: function(lamp, isLit) {
            var cx = lamp.x || 0, cy = lamp.y || 0, r = (lamp.diameter || 36) / 2;
            var colorType = (lamp.color || 'red').toLowerCase();
            var palette = LampColors[colorType] || LampColors.red;
            var brightness = Math.max(0.2, Math.min(1.0, lamp.brightness !== undefined ? lamp.brightness : 1.0));
            var hoodType = lamp.hood || 'round';
            var displayStyle = isLit ? 'display: inline;' : 'display: none;';

            var svg = '<g class="signal-lamp-unit ' + (isLit ? 'lit' : '') + '" data-lamp-id="' + lamp.id + '">';

            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 2.5) + '" fill="#0a0d16" stroke="#262d3e" stroke-width="1.5" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + palette.off + '" stroke="#141926" stroke-width="2" class="lamp-glass-off" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.72).toFixed(1) + '" class="fresnel-ring" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.44).toFixed(1) + '" class="fresnel-ring" />';

            svg += '<g class="lamp-lit-layer" style="' + displayStyle + '">';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="#0a0d16" stroke="#262d3e" stroke-width="1.8" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.74).toFixed(1) + '" fill="' + palette.lit + '" opacity="' + brightness + '" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.44).toFixed(1) + '" fill="' + palette.core + '" opacity="' + brightness + '" />';
            svg += '</g>';

            svg += this.renderVisor(cx, cy, r, hoodType);
            svg += '</g>';
            return svg;
        },

        renderVisor: function(cx, cy, r, type) {
            if (type === 'none') return '';

            if (type === 'square') {
                var w = (r * 2) + 6;
                var left = cx - r - 3;
                var top = cy - r - 3;
                var d = [
                    'M', left, cy + 1,
                    'V', top,
                    'H', left + w,
                    'V', cy + 1,
                    'H', left + w - 3,
                    'V', top + 3,
                    'H', left + 3,
                    'V', cy + 1,
                    'Z'
                ].join(' ');
                return '<path d="' + d + '" class="visor-hood" fill="#080a0e" stroke="#1d232f" stroke-width="1.2" />';
            }

            var cowlPath = [
                'M', cx - r - 3, cy + 1,
                'A', r + 3, r + 4, 0, 0, 1, cx + r + 3, cy + 1,
                'L', cx + r + 1, cy,
                'A', r + 1, r + 2, 0, 0, 0, cx - r - 1, cy,
                'Z'
            ].join(' ');

            return '<path d="' + cowlPath + '" class="visor-hood" fill="#080a0e" stroke="#1d232f" stroke-width="1.2" />';
        }
    };

    window.LampRenderer = LampRenderer;
    window.LampColors = LampColors;
})(window);