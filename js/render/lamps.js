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
        getBoxColor: function(lamp) {
            if (lamp && lamp.boxColor) {
                return {
                    fill: lamp.boxColor,
                    stroke: lamp.boxStroke || '#262d3e'
                };
            }
            var cx = (lamp && lamp.x !== undefined) ? lamp.x : 0;
            var cy = (lamp && lamp.y !== undefined) ? lamp.y : 0;

            if (window.SignalState && window.SignalState.shapes && window.SignalState.shapes.length > 0) {
                var shapes = window.SignalState.shapes;
                for (var i = shapes.length - 1; i >= 0; i--) {
                    var s = shapes[i];
                    if (s.type === 'rounded-rect') {
                        var sx = s.x || 0, sy = s.y || 0, sw = s.width || 60, sh = s.height || 100;
                        if (cx >= sx - 6 && cx <= sx + sw + 6 && cy >= sy - 6 && cy <= sy + sh + 6) {
                            return {
                                fill: s.fill || '#0a0d16',
                                stroke: s.stroke || '#262d3e'
                            };
                        }
                    } else if (s.type === 'circle-sector') {
                        var scx = s.x || 0, scy = s.y || 0, srad = s.radius || 30;
                        if (Math.hypot(cx - scx, cy - scy) <= srad + 6) {
                            return {
                                fill: s.fill || '#0a0d16',
                                stroke: s.stroke || '#262d3e'
                            };
                        }
                    } else if (s.type === 'triangle') {
                        return {
                            fill: s.fill || '#0a0d16',
                            stroke: s.stroke || '#262d3e'
                        };
                    }
                }
                return {
                    fill: shapes[0].fill || '#0a0d16',
                    stroke: shapes[0].stroke || '#262d3e'
                };
            }
            return { fill: '#0a0d16', stroke: '#262d3e' };
        },

        render: function(lamp, isLit) {
            var cx = lamp.x || 0, cy = lamp.y || 0, r = (lamp.diameter || 36) / 2;
            var colorType = (lamp.color || 'red').toLowerCase();
            var palette = LampColors[colorType] || LampColors.red;
            var brightness = Math.max(0.2, Math.min(1.0, lamp.brightness !== undefined ? lamp.brightness : 1.0));
            var hoodType = lamp.hood || 'round';
            var displayStyle = isLit ? 'display: inline;' : 'display: none;';
            var box = this.getBoxColor(lamp);

            var svg = '<g class="signal-lamp-unit ' + (isLit ? 'lit' : '') + '" data-lamp-id="' + lamp.id + '">';

            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 2.5) + '" fill="' + box.fill + '" stroke="' + box.stroke + '" stroke-width="1.5" class="lamp-outer-ring" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + palette.off + '" stroke="#141926" stroke-width="2" class="lamp-glass-off" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.72).toFixed(1) + '" class="fresnel-ring" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.44).toFixed(1) + '" class="fresnel-ring" />';

            svg += '<g class="lamp-lit-layer" style="' + displayStyle + '">';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + box.fill + '" stroke="' + box.stroke + '" stroke-width="1.8" class="lamp-lit-outer-ring" />';
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