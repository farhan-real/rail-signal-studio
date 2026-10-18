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
            var cx = matrixConf.x !== undefined ? matrixConf.x : 0;
            var cy = matrixConf.y !== undefined ? matrixConf.y : -205;
            var txt = (text || matrixConf.text || '').toUpperCase();
            var boxWidth = 58, boxHeight = 72;
            var bx = cx - boxWidth / 2, by = cy - boxHeight / 2;

            var svg = '<g class="theatre-matrix-unit" data-matrix-id="' + (matrixConf.id || 'ROUTE_BOX') + '">';

            svg += '<rect x="' + (cx - 7) + '" y="' + (by + boxHeight) + '" width="14" height="24" fill="#181c26" stroke="#2a3040" stroke-width="1.5" />';
            svg += '<rect x="' + bx + '" y="' + by + '" width="' + boxWidth + '" height="' + boxHeight + '" rx="5" class="theatre-box" fill="#090b0e" stroke="#2e3547" stroke-width="2.5" />';
            svg += '<rect x="' + (bx - 2) + '" y="' + (by - 3) + '" width="' + (boxWidth + 4) + '" height="5" rx="1.5" fill="#060709" stroke="#1d222e" stroke-width="1" />';

            var charKey = txt.length > 0 ? txt.charAt(0) : '';
            var pattern = MatrixFont[charKey] || [];
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