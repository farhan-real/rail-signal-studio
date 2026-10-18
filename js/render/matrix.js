(function(window) {
    'use strict';

    var MatrixFont = {
        '': [], ' ': [],
        'A': [0x1C, 0x22, 0x22, 0x3E, 0x22, 0x22, 0x22],
        'B': [0x3C, 0x22, 0x22, 0x3C, 0x22, 0x22, 0x3C],
        'C': [0x1E, 0x20, 0x20, 0x20, 0x20, 0x20, 0x1E],
        'D': [0x3C, 0x22, 0x22, 0x22, 0x22, 0x22, 0x3C],
        'E': [0x3E, 0x20, 0x20, 0x3C, 0x20, 0x20, 0x3E],
        'F': [0x3E, 0x20, 0x20, 0x3C, 0x20, 0x20, 0x20],
        'G': [0x1E, 0x20, 0x20, 0x2E, 0x22, 0x22, 0x1E],
        'H': [0x22, 0x22, 0x22, 0x3E, 0x22, 0x22, 0x22],
        'L': [0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x3E],
        'M': [0x22, 0x36, 0x2A, 0x22, 0x22, 0x22, 0x22],
        'P': [0x3C, 0x22, 0x22, 0x3C, 0x20, 0x20, 0x20],
        'R': [0x3C, 0x22, 0x22, 0x3C, 0x28, 0x24, 0x22],
        'S': [0x1E, 0x20, 0x20, 0x1E, 0x02, 0x02, 0x3C],
        '1': [0x08, 0x18, 0x28, 0x08, 0x08, 0x08, 0x3E],
        '2': [0x1C, 0x22, 0x02, 0x0C, 0x10, 0x20, 0x3E],
        '3': [0x3C, 0x02, 0x02, 0x1C, 0x02, 0x02, 0x3C],
        '4': [0x04, 0x0C, 0x14, 0x24, 0x3F, 0x04, 0x04],
        '5': [0x3E, 0x20, 0x20, 0x3C, 0x02, 0x02, 0x3C]
    };

    var MatrixRenderer = {
        render: function(matrixConf, text) {
            var cx = matrixConf.x || 0, cy = matrixConf.y || 0;
            var txt = (text || matrixConf.text || '').toUpperCase();
            var boxWidth = 54, boxHeight = 70;
            var bx = cx - boxWidth / 2, by = cy - boxHeight / 2;

            var svg = '<g class="theatre-matrix-unit" data-matrix-id="' + matrixConf.id + '">';
            svg += '<rect x="' + bx + '" y="' + by + '" width="' + boxWidth + '" height="' + boxHeight + '" rx="4" class="theatre-box" />';

            var charKey = txt.length > 0 ? txt.charAt(0) : '';
            var pattern = MatrixFont[charKey] || [];
            var startX = bx + 9, startY = by + 9, spacing = 7.2;

            for (var row = 0; row < 7; row++) {
                var rowMask = pattern[row] || 0;
                for (var col = 0; col < 5; col++) {
                    var bit = (rowMask >> (5 - col)) & 1;
                    var px = startX + col * spacing;
                    var py = startY + row * spacing;

                    if (bit === 1) {
                        svg += '<circle cx="' + px + '" cy="' + py + '" r="2.8" class="theatre-pixel-on" />';
                    } else {
                        svg += '<circle cx="' + px + '" cy="' + py + '" r="2.2" class="theatre-pixel-off" />';
                    }
                }
            }

            svg += '</g>';
            return svg;
        }
    };

    window.MatrixRenderer = MatrixRenderer;
})(window);
