(function(window) {
    'use strict';

    var MatrixFont5x7 = {
        ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        '1': [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
        '2': [0x0E, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1F],
        '3': [0x1E, 0x01, 0x01, 0x0E, 0x01, 0x01, 0x1E],
        '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
        '5': [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E],
        '6': [0x0E, 0x10, 0x10, 0x1E, 0x11, 0x11, 0x0E],
        '7': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
        '8': [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
        '9': [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x01, 0x0E],
        '0': [0x0E, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0E],
        'A': [0x0E, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
        'B': [0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E],
        'C': [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
        'D': [0x1C, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1C],
        'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
        'F': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
        'G': [0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0E],
        'H': [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
        'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
        'M': [0x11, 0x1B, 0x15, 0x11, 0x11, 0x11, 0x11],
        'P': [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
        'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
        'S': [0x0F, 0x10, 0x10, 0x0E, 0x01, 0x01, 0x1E]
    };

    var MatrixRenderer = {
        render: function(matrixConf, text) {
            var cx = matrixConf.x !== undefined ? matrixConf.x : 0;
            var cy = matrixConf.y !== undefined ? matrixConf.y : -202;

            var hasFeathers = SignalState.feathers && SignalState.feathers.length > 0;
            if (hasFeathers) {
                cy = -202;
            } else if (cy < -220 || cy > -170) {
                cy = -192;
            }

            var txt = (text !== undefined ? text : (matrixConf.text || 'M')).trim().toUpperCase();
            var isMultiChar = txt.length > 1;
            var boxWidth = isMultiChar ? 62 : 44;
            var boxHeight = 52;
            var bx = cx - boxWidth / 2, by = cy - boxHeight / 2;

            var svg = '<g class="theatre-matrix-unit" data-matrix-id="' + (matrixConf.id || 'ROUTE_BOX') + '">';

            svg += '<rect x="' + (cx - 8) + '" y="' + (by + boxHeight) + '" width="16" height="4" rx="1" fill="#121620" stroke="#283042" stroke-width="1.2" />';
            svg += '<rect x="' + bx + '" y="' + by + '" width="' + boxWidth + '" height="' + boxHeight + '" rx="4" class="theatre-box" fill="#090a0e" stroke="#2c3345" stroke-width="2.2" />';
            svg += '<rect x="' + (bx - 1) + '" y="' + (by - 2) + '" width="' + (boxWidth + 2) + '" height="3.5" rx="1" fill="#050608" stroke="#1d222e" stroke-width="0.8" />';

            var spacing = 5.4;

            if (!isMultiChar) {
                var charKey = txt.length > 0 ? txt.charAt(0) : ' ';
                var pattern = MatrixFont5x7[charKey] || MatrixFont5x7[' '];
                var startX = cx - (2 * spacing);
                var startY = cy - (3 * spacing);

                for (var r = 0; r < 7; r++) {
                    var mask = pattern[r] || 0;
                    for (var c = 0; c < 5; c++) {
                        var bit = (mask >> (4 - c)) & 1;
                        var px = startX + c * spacing;
                        var py = startY + r * spacing;

                        if (bit === 1) {
                            svg += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="2.1" fill="#ffffff" stroke="#e0f0ff" stroke-width="0.5" class="theatre-pixel-on" />';
                        } else {
                            svg += '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="1.5" fill="#12151d" stroke="#080a0f" stroke-width="0.4" class="theatre-pixel-off" />';
                        }
                    }
                }
            } else {
                for (var ch = 0; ch < 2; ch++) {
                    var chKey = txt.charAt(ch) || ' ';
                    var ptn = MatrixFont5x7[chKey] || MatrixFont5x7[' '];
                    var chCenterX = cx + (ch === 0 ? -14 : 14);
                    var sX = chCenterX - (2 * (spacing * 0.8));
                    var sY = cy - (3 * (spacing * 0.95));

                    for (var r2 = 0; r2 < 7; r2++) {
                        var msk = ptn[r2] || 0;
                        for (var c2 = 0; c2 < 5; c2++) {
                            var b2 = (msk >> (4 - c2)) & 1;
                            var pX = sX + c2 * (spacing * 0.8);
                            var pY = sY + r2 * (spacing * 0.95);

                            if (b2 === 1) {
                                svg += '<circle cx="' + pX.toFixed(1) + '" cy="' + pY.toFixed(1) + '" r="1.8" fill="#ffffff" stroke="#e0f0ff" stroke-width="0.5" class="theatre-pixel-on" />';
                            } else {
                                svg += '<circle cx="' + pX.toFixed(1) + '" cy="' + pY.toFixed(1) + '" r="1.3" fill="#12151d" stroke="#080a0f" stroke-width="0.4" class="theatre-pixel-off" />';
                            }
                        }
                    }
                }
            }

            svg += '</g>';
            return svg;
        }
    };

    window.MatrixRenderer = MatrixRenderer;
})(window);