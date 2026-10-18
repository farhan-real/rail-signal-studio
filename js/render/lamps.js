(function(window) {
    'use strict';

    var LampColors = {
        red: {
            off: '#220707',
            lit: '#ee1212',
            stops: [
                { offset: '0%', color: '#ff6659' },
                { offset: '45%', color: '#ee1212' },
                { offset: '100%', color: '#b50000' }
            ]
        },
        yellow: {
            off: '#261a04',
            lit: '#ffba00',
            stops: [
                { offset: '0%', color: '#fff176' },
                { offset: '42%', color: '#ffba00' },
                { offset: '100%', color: '#db8200' }
            ]
        },
        green: {
            off: '#032113',
            lit: '#00cc66',
            stops: [
                { offset: '0%', color: '#6effb8' },
                { offset: '44%', color: '#00cc66' },
                { offset: '100%', color: '#008a3d' }
            ]
        },
        white: {
            off: '#151a22',
            lit: '#f0f6ff',
            stops: [
                { offset: '0%', color: '#ffffff' },
                { offset: '48%', color: '#f0f6ff' },
                { offset: '100%', color: '#c5d8ed' }
            ]
        },
        violet: {
            off: '#1e0824',
            lit: '#9c27b0',
            stops: [
                { offset: '0%', color: '#da70ff' },
                { offset: '45%', color: '#9c27b0' },
                { offset: '100%', color: '#650080' }
            ]
        },
        blue: {
            off: '#06152a',
            lit: '#1976d2',
            stops: [
                { offset: '0%', color: '#64b5f6' },
                { offset: '45%', color: '#1976d2' },
                { offset: '100%', color: '#0d47a1' }
            ]
        }
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
            var colorR = (r * 0.78).toFixed(1);
            var gradId = 'lampGrad_' + (lamp.id || 'L').replace(/[^a-zA-Z0-9_]/g, '_');
            var stops = palette.stops || [
                { offset: '0%', color: palette.lit },
                { offset: '100%', color: palette.lit }
            ];

            var svg = '<g class="signal-lamp-unit ' + (isLit ? 'lit' : '') + '" data-lamp-id="' + lamp.id + '">';

            svg += '<defs>';
            svg += '<radialGradient id="' + gradId + '" cx="50%" cy="50%" r="50%">';
            for (var s = 0; s < stops.length; s++) {
                svg += '<stop offset="' + stops[s].offset + '" stop-color="' + stops[s].color + '" />';
            }
            svg += '</radialGradient>';
            svg += '</defs>';

            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 2.5) + '" fill="' + box.fill + '" stroke="' + box.stroke + '" stroke-width="1.5" class="lamp-outer-ring" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + palette.off + '" stroke="#141926" stroke-width="2" class="lamp-glass-off" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.72).toFixed(1) + '" class="fresnel-ring" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.44).toFixed(1) + '" class="fresnel-ring" />';

            svg += '<g class="lamp-lit-layer" style="' + displayStyle + '">';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + box.fill + '" stroke="none" class="lamp-lit-outer-ring" />';
            svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + colorR + '" fill="url(#' + gradId + ')" opacity="' + brightness + '" class="lamp-lit-lens" />';
            svg += '</g>';

            svg += this.renderVisor(cx, cy, r, hoodType);
            svg += '</g>';
            return svg;
        },

        renderVisor: function(cx, cy, r, type) {
            if (type === 'none') return '';

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