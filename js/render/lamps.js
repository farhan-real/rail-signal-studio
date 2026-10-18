(function(window) {
    'use strict';

    var LampColors = {
        red: { off: '#240808', lit: '#ff2014', glow: 'rgba(255, 32, 20, 0.9)' },
        yellow: { off: '#261b05', lit: '#ffb300', glow: 'rgba(255, 179, 0, 0.9)' },
        green: { off: '#05220f', lit: '#00f543', glow: 'rgba(0, 245, 67, 0.9)' },
        white: { off: '#1a1f26', lit: '#e6f3ff', glow: 'rgba(230, 243, 255, 0.95)' },
        violet: { off: '#200826', lit: '#d03bff', glow: 'rgba(208, 59, 255, 0.9)' }
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
            svg += this.renderVisor(cx, cy, r, hoodType);

            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + palette.off + '" stroke="#0a0b0e" stroke-width="2" class="lamp-glass-off" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.7) + '" class="fresnel-ring" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.4) + '" class="fresnel-ring" />';

            svg += '<g class="lamp-lit-layer" style="' + displayStyle + '">';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 1.8) + '" fill="' + palette.glow + '" opacity="' + (brightness * 0.45) + '" filter="url(#glowFilter)" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + palette.lit + '" opacity="' + brightness + '" stroke="#ffffff" stroke-width="1.2" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.4) + '" fill="#ffffff" opacity="' + (brightness * 0.85) + '" />';
            svg += '</g>';

            svg += '</g>';
            return svg;
        },

        renderVisor: function(cx, cy, r, type) {
            if (type === 'none') return '';
            var visorLength = r * 1.35;
            if (type === 'square') {
                return '<rect x="' + (cx - r * 1.15) + '" y="' + (cy - r - visorLength) + '" width="' + (r * 2.3) + '" height="' + visorLength + '" rx="2" class="visor-hood" />';
            }
            var path = [
                'M', cx - r - 2, cy,
                'A', r + 2, r + 2, 0, 0, 1, cx + r + 2, cy,
                'L', cx + r + 2, cy - visorLength,
                'A', r + 2, visorLength * 0.6, 0, 0, 0, cx - r - 2, cy - visorLength,
                'Z'
            ].join(' ');
            return '<path d="' + path + '" class="visor-hood" />';
        }
    };

    window.LampRenderer = LampRenderer;
    window.LampColors = LampColors;
})(window);