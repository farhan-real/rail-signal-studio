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

            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 1.5) + '" fill="#090a0d" stroke="#1c212c" stroke-width="1.5" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + palette.off + '" stroke="#0a0b0e" stroke-width="1.5" class="lamp-glass-off" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.72) + '" class="fresnel-ring" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.44) + '" class="fresnel-ring" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.22) + '" class="fresnel-ring" />';

            svg += '<g class="lamp-lit-layer" style="' + displayStyle + '">';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 1.8) + '" fill="' + palette.glow + '" opacity="' + (brightness * 0.45) + '" filter="url(#glowFilter)" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + palette.lit + '" opacity="' + brightness + '" stroke="#ffffff" stroke-width="1.2" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.42) + '" fill="#ffffff" opacity="' + (brightness * 0.9) + '" />';
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
                var top = cy - r - 4;
                var d = [
                    'M', left, cy + 2,
                    'V', top,
                    'H', left + w,
                    'V', cy + 2,
                    'H', left + w - 2.5,
                    'V', top + 2.5,
                    'H', left + 2.5,
                    'V', cy + 2,
                    'Z'
                ].join(' ');
                var shadowSq = '<path d="M ' + (cx - r) + ' ' + (cy - r) + ' H ' + (cx + r) + ' V ' + (cy - r * 0.2) + ' H ' + (cx - r) + ' Z" fill="rgba(0,0,0,0.4)" pointer-events="none" />';
                return '<path d="' + d + '" class="visor-hood" fill="#080a0e" stroke="#1d232f" stroke-width="1.2" />' + shadowSq;
            }

            var cowlPath = [
                'M', cx - r - 3, cy,
                'A', r + 3, r + 4, 0, 0, 1, cx + r + 3, cy,
                'L', cx + r + 1, cy - 1,
                'A', r + 1, r + 2, 0, 0, 0, cx - r - 1, cy - 1,
                'Z'
            ].join(' ');

            var innerShadow = '<path d="M ' + (cx - r) + ' ' + cy + ' A ' + r + ' ' + r + ' 0 0 1 ' + (cx + r) + ' ' + cy + ' A ' + r + ' ' + (r * 0.45) + ' 0 0 1 ' + (cx - r) + ' ' + cy + ' Z" fill="rgba(0,0,0,0.42)" pointer-events="none" />';

            return '<path d="' + cowlPath + '" class="visor-hood" fill="#080a0e" stroke="#1d232f" stroke-width="1.2" />' + innerShadow;
        }
    };

    window.LampRenderer = LampRenderer;
    window.LampColors = LampColors;
})(window);