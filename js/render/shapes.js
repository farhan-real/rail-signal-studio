(function(window) {
    'use strict';

    var ShapeRenderer = {
        render: function(shape) {
            switch (shape.type) {
                case 'rect':
                case 'rounded-rect': return this.renderRoundedRect(shape);
                case 'circle-sector': return this.renderCircleSector(shape);
                case 'triangle': return this.renderTriangle(shape);
                default: return this.renderRoundedRect(shape);
            }
        },

        renderRoundedRect: function(s) {
            var x = s.x || 0, y = s.y || 0, w = s.width || 60, h = s.height || 100;
            var r = s.corners || (s.type === 'rect' ? [0, 0, 0, 0] : [8, 8, 8, 8]);
            var tl = r[0] !== undefined ? r[0] : 0;
            var tr = r[1] !== undefined ? r[1] : 0;
            var br = r[2] !== undefined ? r[2] : 0;
            var bl = r[3] !== undefined ? r[3] : 0;
            var fill = s.fill || '#0a0d16', stroke = s.stroke || '#262d3e', sw = s.strokeWidth || 2;

            var d = [
                'M', x + tl, y,
                'H', x + w - tr,
                'A', tr, tr, 0, 0, 1, x + w, y + tr,
                'V', y + h - br,
                'A', br, br, 0, 0, 1, x + w - br, y + h,
                'H', x + bl,
                'A', bl, bl, 0, 0, 1, x, y + h - bl,
                'V', y + tl,
                'A', tl, tl, 0, 0, 1, x + tl, y,
                'Z'
            ].join(' ');

            var inlineStyle = 'fill: ' + fill + '; stroke: ' + stroke + '; stroke-width: ' + sw + 'px;';
            var svg = '<path d="' + d + '" style="' + inlineStyle + '" class="target-plate" />';

            if (s.text) {
                var tx = x + w / 2;
                var lines = String(s.text).split(/\r?\n/);
                var fSize = s.fontSize || 9;
                var tColor = s.textColor || '#ffffff';
                var startY = y + (h - (lines.length - 1) * (fSize + 2)) / 2 + fSize * 0.35;
                for (var li = 0; li < lines.length; li++) {
                    svg += '<text x="' + tx + '" y="' + (startY + li * (fSize + 2)).toFixed(1) + '" text-anchor="middle" fill="' + tColor + '" font-size="' + fSize + 'px" font-weight="700" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif">' + lines[li] + '</text>';
                }
            }
            return svg;
        },

        renderCircleSector: function(s) {
            var cx = s.x || 0, cy = s.y || 0, radius = s.radius || 30;
            var percent = Math.min(100, Math.max(1, s.percent || 100));
            var fill = s.fill || '#0a0d16', stroke = s.stroke || '#262d3e', sw = s.strokeWidth || 2;

            if (percent >= 100) {
                var fullStyle = 'fill: ' + fill + '; stroke: ' + stroke + '; stroke-width: ' + sw + 'px;';
                return '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" style="' + fullStyle + '" class="target-plate" />';
            }

            var startAngle = s.startAngle || 0;
            var sweep = (percent / 100) * 360;
            var endAngle = startAngle + sweep;
            var startRad = (startAngle - 90) * Math.PI / 180;
            var endRad = (endAngle - 90) * Math.PI / 180;

            var x1 = cx + radius * Math.cos(startRad);
            var y1 = cy + radius * Math.sin(startRad);
            var x2 = cx + radius * Math.cos(endRad);
            var y2 = cy + radius * Math.sin(endRad);
            var largeArc = sweep > 180 ? 1 : 0;

            var d = ['M', cx, cy, 'L', x1, y1, 'A', radius, radius, 0, largeArc, 1, x2, y2, 'Z'].join(' ');
            var sectorStyle = 'fill: ' + fill + '; stroke: ' + stroke + '; stroke-width: ' + sw + 'px;';
            return '<path d="' + d + '" style="' + sectorStyle + '" class="target-plate" />';
        },

        renderTriangle: function(s) {
            var fill = s.fill || '#0a0d16', stroke = s.stroke || '#262d3e', sw = s.strokeWidth || 2;
            var triStyle = 'fill: ' + fill + '; stroke: ' + stroke + '; stroke-width: ' + sw + 'px;';
            var pts = s.points;

            if (!pts || !pts.length) {
                var x = s.x !== undefined ? s.x : -20;
                var y = s.y !== undefined ? s.y : -20;
                var w = s.width || 40, h = s.height || 40;
                var dir = (s.direction || 'up').toLowerCase();

                if (dir === 'up') pts = [[x + w / 2, y], [x + w, y + h], [x, y + h]];
                else if (dir === 'down') pts = [[x, y], [x + w, y], [x + w / 2, y + h]];
                else if (dir === 'left') pts = [[x, y + h / 2], [x + w, y], [x + w, y + h]];
                else pts = [[x, y], [x + w, y + h / 2], [x, y + h]];
            }

            var strPts = pts.map(function(p) { return p[0] + ',' + p[1]; }).join(' ');
            return '<polygon points="' + strPts + '" style="' + triStyle + '" class="target-plate" />';
        }
    };

    window.ShapeRenderer = ShapeRenderer;
})(window);