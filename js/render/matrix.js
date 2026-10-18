(function(window) {
    'use strict';

    var MatrixFont = {
        '': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        '1': [0x04, 0x0C, 0x14, 0x04, 0x04, 0x04, 0x0E],
        '2': [0x0E, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1F],
        '3': [0x1E, 0x01, 0x01, 0x0E, 0x01, 0x01, 0x1E],
        '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
        '5': [0x1F, 0x10, 0x10, 0x1E, 0x01, 0x01, 0x1E],
        'M': [0x11, 0x1B, 0x15, 0x11, 0x11, 0x11, 0x11],
        'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
        'S': [0x0F, 0x10, 0x10, 0x0E, 0x01, 0x01, 0x1E],
        'A': [0x0E, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
        'B': [0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E],
        'C': [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
        'D': [0x1C, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1C],
        'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
        'F': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
        'G': [0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0E],
        'H': [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
        'P': [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
        'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11]
    };

    var MatrixRenderer = {
        render: function(matrixConf, text) {
            var cx = matrixConf.x !== undefined ? matrixConf.x : 0;
            var cy = matrixConf.y !== undefined ? matrixConf.y : -220;
            var txt = (text || matrixConf.text || '').toUpperCase();
            var boxWidth = 58, boxHeight = 72;
            var bx = cx - boxWidth / 2, by = cy - boxHeight / 2;

            var svg = '<g class="theatre-matrix-unit" data-matrix-id="' + (matrixConf.id || 'ROUTE_BOX') + '">';

            svg += '<rect x="' + (cx - 7) + '" y="' + (by + boxHeight) + '" width="14" height="20" fill="#181c26" stroke="#2a3040" stroke-width="1.5" />';
            svg += '<rect x="' + bx + '" y="' + by + '" width="' + boxWidth + '" height="' + boxHeight + '" rx="5" class="theatre-box" fill="#090b0e" stroke="#2e3547" stroke-width="2.5" />';
            svg += '<rect x="' + (bx - 2) + '" y="' + (by - 3) + '" width="' + (boxWidth + 4) + '" height="5" rx="1.5" fill="#060709" stroke="#1d222e" stroke-width="1" />';

            var charKey = txt.length > 0 ? txt.charAt(0) : '';
            var pattern = MatrixFont[charKey] || MatrixFont[' '];
            var spacing = 8.5;
            var startX = cx - 17;
            var startY = cy - 25.5;

            for (var row = 0; row < 7; row++) {
                var rowMask = pattern[row] || 0;
                for (var col = 0; col < 5; col++) {
                    var bit = (rowMask >> (4 - col)) & 1;
                    var px = startX + col * spacing;
                    var py = startY + row * spacing;

                    if (bit === 1) {
                        svg += '<circle cx="' + px + '" cy="' + py + '" r="2.8" fill="#ffffff" filter="url(#glowFilter)" class="theatre-pixel-on" />';
                        svg += '<circle cx="' + px + '" cy="' + py + '" r="2.4" fill="#ffffff" stroke="#e0f0ff" stroke-width="0.8" />';
                    } else {
                        svg += '<circle cx="' + px + '" cy="' + py + '" r="2.3" fill="#131620" stroke="#090b0f" stroke-width="0.6" class="theatre-pixel-off" />';
                    }
                }
            }

            svg += '</g>';
            return svg;
        }
    };

    window.MatrixRenderer = MatrixRenderer;
})(window);