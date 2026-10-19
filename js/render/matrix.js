(function(window) {
    'use strict';

    var MatrixFont5x7 = {
        ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        '0': [0x0E, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0E],
        '1': [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
        '2': [0x0E, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1F],
        '3': [0x1E, 0x01, 0x01, 0x0E, 0x01, 0x01, 0x1E],
        '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
        '5': [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E],
        '6': [0x0E, 0x10, 0x10, 0x1E, 0x11, 0x11, 0x0E],
        '7': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
        '8': [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
        '9': [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x01, 0x0E],
        'A': [0x0E, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
        'B': [0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E],
        'C': [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
        'D': [0x1C, 0x12, 0x11, 0x11, 0x11, 0x12, 0x1C],
        'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
        'F': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
        'G': [0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0E],
        'H': [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
        'I': [0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E],
        'J': [0x01, 0x01, 0x01, 0x01, 0x11, 0x11, 0x0E],
        'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
        'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
        'M': [0x11, 0x1B, 0x15, 0x11, 0x11, 0x11, 0x11],
        'N': [0x11, 0x19, 0x15, 0x15, 0x13, 0x11, 0x11],
        'O': [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
        'P': [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
        'Q': [0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0D],
        'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
        'S': [0x0F, 0x10, 0x10, 0x0E, 0x01, 0x01, 0x1E],
        'T': [0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
        'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
        'V': [0x11, 0x11, 0x11, 0x11, 0x0A, 0x0A, 0x04],
        'W': [0x11, 0x11, 0x11, 0x11, 0x15, 0x1B, 0x11],
        'X': [0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11],
        'Y': [0x11, 0x11, 0x0A, 0x04, 0x04, 0x04, 0x04],
        'Z': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F],
        '-': [0x00, 0x00, 0x00, 0x1F, 0x00, 0x00, 0x00],
        '/': [0x01, 0x02, 0x04, 0x08, 0x10, 0x00, 0x00],
        '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x06, 0x06]
    };

    var MatrixRenderer = {
        getPattern: function(ch) {
            if (!ch) return MatrixFont5x7[' '];
            return MatrixFont5x7[ch] || MatrixFont5x7[ch.toUpperCase()] || MatrixFont5x7[ch.toLowerCase()] || MatrixFont5x7[' '];
        },

        getSignalAssemblyTopY: function() {
            var fb = window.SignalState && window.SignalState.featherBase;
            var feathers = (window.SignalState && window.SignalState.feathers) || [];
            var hasFeathers = feathers.length > 0;

            if (hasFeathers || (fb && fb.enabled)) {
                var hub = window.FeatherRenderer ? window.FeatherRenderer.getHubCenter(fb) : { x: 0, y: -196 };
                var r = (fb && fb.radius) ? fb.radius : 35.5;
                var topY = hub.y - r;

                if (window.FeatherRenderer && hasFeathers) {
                    for (var i = 0; i < feathers.length; i++) {
                        var rad = feathers[i]._renderedRad;
                        if (rad === undefined) {
                            var conf = window.FeatherRenderer.positions[(feathers[i].position || 'left1').toLowerCase()];
                            if (conf) rad = conf.angle * Math.PI / 180;
                        }
                        if (rad !== undefined) {
                            var armTipY = hub.y + Math.sin(rad) * 98.0 - 14.0;
                            if (armTipY < topY) topY = armTipY;
                        }
                    }
                }
                return topY;
            }

            return (window.FeatherRenderer && window.FeatherRenderer.detectHeadTopSurface) ?
                window.FeatherRenderer.detectHeadTopSurface(0) : -160;
        },

        render: function(matrixConf, text) {
            var cx = matrixConf.x !== undefined ? matrixConf.x : 0;
            var boxHeight = 52;
            var topAssemblyY = this.getSignalAssemblyTopY();
            var restingCenterY = topAssemblyY - (matrixConf.showBase === false ? 2 : 8) - (boxHeight / 2);

            var posMode = (matrixConf && matrixConf.posMode) || (matrixConf && matrixConf.y !== undefined && matrixConf.yOffset === undefined ? 'direct' : 'relative');
            var cy = (posMode === 'direct' && matrixConf.y !== undefined) ? matrixConf.y :
                ((matrixConf.yOffset !== undefined) ? (restingCenterY - matrixConf.yOffset) : restingCenterY);

            var isLit = matrixConf && matrixConf.lit !== undefined ? !!matrixConf.lit : true;
            var rawTxt = (text !== undefined ? text : (matrixConf.text || '')).toString().trim().replace(/["']/g, '').toUpperCase();
            var txt = isLit ? rawTxt : '';
            var isMultiChar = txt.length > 1;
            var boxWidth = isMultiChar ? 62 : 44;
            var bx = cx - boxWidth / 2, by = cy - boxHeight / 2;
            var boxBottomY = by + boxHeight;

            var mountTargetY = topAssemblyY;
            var bracketHeight = Math.max(4, mountTargetY - boxBottomY);
            var svg = '<g class="theatre-matrix-unit" data-matrix-id="' + (matrixConf.id || 'ROUTE_BOX') + '">';

            if (matrixConf && matrixConf.showBase !== false) {
                svg += '<rect x="' + (cx - 10) + '" y="' + boxBottomY.toFixed(1) + '" width="20" height="' + bracketHeight.toFixed(1) + '" rx="1" fill="#121620" stroke="#283042" stroke-width="1.5" />';
                svg += '<line x1="' + (cx - 13) + '" y1="' + (boxBottomY + bracketHeight).toFixed(1) + '" x2="' + (cx + 13) + '" y2="' + (boxBottomY + bracketHeight).toFixed(1) + '" stroke="#384256" stroke-width="2" />';
            }

            svg += '<rect x="' + bx.toFixed(1) + '" y="' + by.toFixed(1) + '" width="' + boxWidth + '" height="' + boxHeight + '" rx="4" class="theatre-box" fill="#090a0e" stroke="#2c3345" stroke-width="2.2" />';
            svg += '<rect x="' + (bx - 1).toFixed(1) + '" y="' + (by - 2).toFixed(1) + '" width="' + (boxWidth + 2) + '" height="3.5" rx="1" fill="#050608" stroke="#1d222e" stroke-width="0.8" />';

            var spacing = 5.4;

            if (!isMultiChar) {
                var charKey = txt.length > 0 ? txt.charAt(0) : ' ';
                var pattern = this.getPattern(charKey);
                var startX = cx - (2 * spacing), startY = cy - (3 * spacing);

                for (var r = 0; r < 7; r++) {
                    var mask = pattern[r] || 0;
                    for (var c = 0; c < 5; c++) {
                        var bit = (mask >> (4 - c)) & 1;
                        var px = startX + c * spacing, py = startY + r * spacing;
                        svg += (bit === 1 && isLit) ?
                            '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="2.1" fill="#ffffff" stroke="#e0f0ff" stroke-width="0.5" class="theatre-pixel-on" />' :
                            '<circle cx="' + px.toFixed(1) + '" cy="' + py.toFixed(1) + '" r="1.5" fill="#12151d" stroke="#080a0f" stroke-width="0.4" class="theatre-pixel-off" />';
                    }
                }
            } else {
                for (var ch = 0; ch < 2; ch++) {
                    var chKey = txt.charAt(ch) || ' ';
                    var ptn = this.getPattern(chKey);
                    var chCenterX = cx + (ch === 0 ? -14 : 14);
                    var sX = chCenterX - (2 * (spacing * 0.8)), sY = cy - (3 * (spacing * 0.95));

                    for (var r2 = 0; r2 < 7; r2++) {
                        var msk = ptn[r2] || 0;
                        for (var c2 = 0; c2 < 5; c2++) {
                            var b2 = (msk >> (4 - c2)) & 1;
                            var pX = sX + c2 * (spacing * 0.8), pY = sY + r2 * (spacing * 0.95);
                            svg += (b2 === 1 && isLit) ?
                                '<circle cx="' + pX.toFixed(1) + '" cy="' + pY.toFixed(1) + '" r="1.8" fill="#ffffff" stroke="#e0f0ff" stroke-width="0.5" class="theatre-pixel-on" />' :
                                '<circle cx="' + pX.toFixed(1) + '" cy="' + pY.toFixed(1) + '" r="1.3" fill="#12151d" stroke="#080a0f" stroke-width="0.4" class="theatre-pixel-off" />';
                        }
                    }
                }
            }

            return svg + '</g>';
        }
    };

    window.MatrixRenderer = MatrixRenderer;
})(window);