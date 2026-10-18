(function(window) {
    'use strict';

    var ShapeRenderer = {
        render: function(shape) {
            switch (shape.type) {
                case 'rounded-rect': return this.renderRoundedRect(shape);
                case 'circle-sector': return this.renderCircleSector(shape);
                case 'triangle': return this.renderTriangle(shape);
                default: return '';
            }
        },

        renderRoundedRect: function(s) {
            var x = s.x || 0, y = s.y || 0, w = s.width || 60, h = s.height || 100;
            var r = s.corners || [8, 8, 8, 8];
            var tl = r[0] || 0, tr = r[1] || 0, br = r[2] || 0, bl = r[3] || 0;
            var fill = s.fill || '#0d0f14', stroke = s.stroke || '#2c3140', sw = s.strokeWidth || 2;

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

            return '<path d="' + d + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '" class="target-plate" />';
        },

        renderCircleSector: function(s) {
            var cx = s.x || 0, cy = s.y || 0, radius = s.radius || 30;
            var percent = Math.min(100, Math.max(1, s.percent || 100));
            var fill = s.fill || '#0d0f14', stroke = s.stroke || '#2c3140', sw = s.strokeWidth || 2;

            if (percent >= 100) {
                return '<circle cx="' + cx + '" cy="' + cy + '" r="' + radius + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '" class="target-plate" />';
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
            return '<path d="' + d + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '" class="target-plate" />';
        },

        renderTriangle: function(s) {
            var pts = s.points || [[0, 0], [40, 20], [0, 40]];
            var strPts = pts.map(function(p) { return p[0] + ',' + p[1]; }).join(' ');
            var fill = s.fill || '#0d0f14', stroke = s.stroke || '#2c3140', sw = s.strokeWidth || 2;
            return '<polygon points="' + strPts + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '" class="target-plate" />';
        }
    };

    window.ShapeRenderer = ShapeRenderer;
})(window);
