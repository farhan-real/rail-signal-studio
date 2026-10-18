(function(window) {
    'use strict';

    var MastRenderer = {
        render: function(mast) {
            var type = mast.type || 'tubular', h = mast.height || 360;
            var cx = mast.x || 0, baseCy = (mast.y || 0) + h;
            var svg = '<g class="mast-structure" data-type="' + type + '">';

            if (type === 'dwarf') {
                svg += '<rect x="' + (cx - 24) + '" y="' + (baseCy - 30) + '" width="48" height="30" rx="3" fill="#141720" stroke="#32384a" stroke-width="2" />';
                svg += '<line x1="' + (cx - 32) + '" y1="' + baseCy + '" x2="' + (cx + 32) + '" y2="' + baseCy + '" stroke="#050608" stroke-width="6" />';
                svg += '</g>';
                return svg;
            }

            if (type === 'tubular') {
                svg += '<line x1="' + cx + '" y1="' + (mast.y || 0) + '" x2="' + cx + '" y2="' + baseCy + '" stroke="#252a38" stroke-width="18" stroke-linecap="square" />';
                svg += '<line x1="' + cx + '" y1="' + (mast.y || 0) + '" x2="' + cx + '" y2="' + baseCy + '" stroke="#363c4e" stroke-width="4" stroke-linecap="square" />';
            } else if (type === 'lattice') {
                var w = 32, halfW = w / 2, leftX = cx - halfW, rightX = cx + halfW;
                svg += '<line x1="' + leftX + '" y1="' + (mast.y || 0) + '" x2="' + leftX + '" y2="' + baseCy + '" stroke="#252a38" stroke-width="5" />';
                svg += '<line x1="' + rightX + '" y1="' + (mast.y || 0) + '" x2="' + rightX + '" y2="' + baseCy + '" stroke="#252a38" stroke-width="5" />';
                for (var y = (mast.y || 0) + 20; y < baseCy; y += 30) {
                    svg += '<line x1="' + leftX + '" y1="' + y + '" x2="' + rightX + '" y2="' + (y + 25) + '" stroke="#1d212c" stroke-width="3" />';
                    svg += '<line x1="' + rightX + '" y1="' + y + '" x2="' + leftX + '" y2="' + (y + 25) + '" stroke="#1d212c" stroke-width="3" />';
                }
            } else if (type === 'gantry') {
                svg += '<line x1="' + (cx - 120) + '" y1="' + (mast.y || 0) + '" x2="' + (cx + 80) + '" y2="' + (mast.y || 0) + '" stroke="#2a3040" stroke-width="16" />';
                svg += '<line x1="' + (cx - 120) + '" y1="' + (mast.y || 0) + '" x2="' + (cx - 120) + '" y2="' + baseCy + '" stroke="#2a3040" stroke-width="16" />';
            }

            if (mast.platform) {
                var py = (mast.y || 0) + 60;
                if (type === 'tubular') {
                    svg += '<rect x="' + (cx - 24) + '" y="' + py + '" width="48" height="6" rx="2" fill="#141720" stroke="#394154" stroke-width="1.5" />';
                } else {
                    svg += '<rect x="' + (cx - 55) + '" y="' + py + '" width="110" height="8" rx="2" fill="#141720" stroke="#394154" stroke-width="1.5" />';
                    svg += '<line x1="' + (cx - 55) + '" y1="' + (py - 22) + '" x2="' + (cx + 55) + '" y2="' + (py - 22) + '" stroke="#2a3040" stroke-width="2.5" />';
                    svg += '<line x1="' + (cx - 55) + '" y1="' + (py - 22) + '" x2="' + (cx - 55) + '" y2="' + py + '" stroke="#2a3040" stroke-width="2" />';
                    svg += '<line x1="' + (cx + 55) + '" y1="' + (py - 22) + '" x2="' + (cx + 55) + '" y2="' + py + '" stroke="#2a3040" stroke-width="2" />';
                }
            }

            if (mast.ladder) {
                var lx = cx + 18;
                svg += '<line x1="' + lx + '" y1="' + ((mast.y || 0) + 70) + '" x2="' + lx + '" y2="' + baseCy + '" stroke="#232733" stroke-width="2" />';
                svg += '<line x1="' + (lx + 10) + '" y1="' + ((mast.y || 0) + 70) + '" x2="' + (lx + 10) + '" y2="' + baseCy + '" stroke="#232733" stroke-width="2" />';
                for (var rungY = (mast.y || 0) + 80; rungY < baseCy; rungY += 18) {
                    svg += '<line x1="' + lx + '" y1="' + rungY + '" x2="' + (lx + 10) + '" y2="' + rungY + '" stroke="#232733" stroke-width="1.5" />';
                }
            }

            svg += '<rect x="' + (cx - 30) + '" y="' + (baseCy - 12) + '" width="60" height="12" rx="2" fill="#0f1117" stroke="#252a38" stroke-width="2" />';
            svg += '</g>';
            return svg;
        }
    };

    window.MastRenderer = MastRenderer;
})(window);