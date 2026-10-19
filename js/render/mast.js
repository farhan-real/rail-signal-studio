(function(window) {
    'use strict';

    var MastRenderer = {
        getHeadBottomY: function() {
            var shapes = (window.SignalState && window.SignalState.shapes) || [];
            var maxY = null;
            for (var i = 0; i < shapes.length; i++) {
                var s = shapes[i];
                var sy = s.y || 0;
                var sh = s.height || (s.radius ? s.radius * 2 : 40);
                var bottomY = sy + sh;
                if (maxY === null || bottomY > maxY) maxY = bottomY;
            }
            var lamps = (window.SignalState && window.SignalState.lamps) || [];
            for (var j = 0; j < lamps.length; j++) {
                var l = lamps[j];
                var lBottom = (l.y || 0) + (l.diameter || 34) / 2;
                if (maxY === null || lBottom > maxY) maxY = lBottom;
            }
            return maxY !== null ? maxY : 45;
        },

        renderFooting: function(cx, baseCy, mast) {
            if (mast.showFoot === false) return '';

            var footW = mast.footWidth || (mast.type === 'tubular' ? 64 : 110);
            var footH = mast.footHeight || 14;
            var footYOff = mast.footYOffset || 0;
            var footStyle = mast.footType || 'plate';
            var footTopY = baseCy - footH - footYOff;
            var footLeftX = cx - footW / 2;
            var svg = '<g class="mast-footing-group">';

            if (footStyle === 'concrete') {
                var chamfer = 6;
                var pts = [
                    (footLeftX + chamfer) + ',' + footTopY,
                    (footLeftX + footW - chamfer) + ',' + footTopY,
                    (footLeftX + footW) + ',' + (footTopY + footH),
                    footLeftX + ',' + (footTopY + footH)
                ].join(' ');
                svg += '<polygon points="' + pts + '" fill="#252a36" stroke="#485368" stroke-width="1.8" />';
                svg += '<line x1="' + (footLeftX - 6) + '" y1="' + (footTopY + footH) + '" x2="' + (footLeftX + footW + 6) + '" y2="' + (footTopY + footH) + '" stroke="#151821" stroke-width="3" />';
            } else if (footStyle === 'clamp') {
                svg += '<rect x="' + footLeftX + '" y="' + footTopY + '" width="' + footW + '" height="' + footH + '" rx="4" fill="#181c26" stroke="#3d475c" stroke-width="2" />';
                svg += '<circle cx="' + (cx - footW / 3) + '" cy="' + (footTopY + footH / 2) + '" r="2.2" fill="#5a6885" />';
                svg += '<circle cx="' + (cx + footW / 3) + '" cy="' + (footTopY + footH / 2) + '" r="2.2" fill="#5a6885" />';
            } else {
                svg += '<rect x="' + footLeftX + '" y="' + footTopY + '" width="' + footW + '" height="' + footH + '" rx="2" fill="#141722" stroke="#323b4e" stroke-width="2" />';
                var ribH = Math.min(18, Math.max(8, footH * 1.4));
                var ribTopY = footTopY - ribH;
                if (mast.type === 'tubular') {
                    svg += '<polygon points="' + (cx - 9) + ',' + footTopY + ' ' + (cx - 9) + ',' + ribTopY + ' ' + (cx - footW / 2 + 4) + ',' + footTopY + '" fill="#1c212f" stroke="#323b4e" stroke-width="1.2" />';
                    svg += '<polygon points="' + (cx + 9) + ',' + footTopY + ' ' + (cx + 9) + ',' + ribTopY + ' ' + (cx + footW / 2 - 4) + ',' + footTopY + '" fill="#1c212f" stroke="#323b4e" stroke-width="1.2" />';
                }
                svg += '<circle cx="' + (footLeftX + 6) + '" cy="' + (footTopY + footH / 2) + '" r="2" fill="#687899" />';
                svg += '<circle cx="' + (footLeftX + footW - 6) + '" cy="' + (footTopY + footH / 2) + '" r="2" fill="#687899" />';
            }

            svg += '</g>';
            return svg;
        },

        render: function(mast) {
            var type = mast.type || 'tubular', h = mast.height || 360;
            var cx = mast.x || 0, baseCy = (mast.y || 0) + h;
            var svg = '<g class="mast-structure" data-type="' + type + '">';

            if (type === 'dwarf') {
                var dwarfTopY = (mast.y !== undefined) ? mast.y : -14;
                var baseBoxH = 26;
                var boxTopY = baseCy - baseBoxH;
                var neckH = Math.max(4, boxTopY - dwarfTopY);

                svg += '<rect x="' + (cx - 12) + '" y="' + dwarfTopY + '" width="24" height="' + neckH + '" rx="1" fill="#181c26" stroke="#2c3345" stroke-width="1.8" />';
                svg += '<line x1="' + (cx - 16) + '" y1="' + dwarfTopY + '" x2="' + (cx + 16) + '" y2="' + dwarfTopY + '" stroke="#384256" stroke-width="2.2" />';
                svg += '<rect x="' + (cx - 26) + '" y="' + boxTopY + '" width="52" height="' + baseBoxH + '" rx="3" fill="#141720" stroke="#32384a" stroke-width="2" />';
                svg += '<rect x="' + (cx - 20) + '" y="' + (boxTopY + 4) + '" width="40" height="' + (baseBoxH - 8) + '" rx="1" fill="#0f1118" stroke="#252a38" stroke-width="1" />';
                svg += '<line x1="' + (cx - 34) + '" y1="' + baseCy + '" x2="' + (cx + 34) + '" y2="' + baseCy + '" stroke="#050608" stroke-width="6" stroke-linecap="round" />';
                svg += '</g>';
                return svg;
            }

            if (type === 'tubular') {
                svg += '<line x1="' + cx + '" y1="' + (mast.y || 0) + '" x2="' + cx + '" y2="' + baseCy + '" stroke="#252a38" stroke-width="18" stroke-linecap="butt" />';
                svg += '<line x1="' + cx + '" y1="' + (mast.y || 0) + '" x2="' + cx + '" y2="' + baseCy + '" stroke="#363c4e" stroke-width="4" stroke-linecap="butt" />';
            } else if (type === 'lattice') {
                var w = 32, halfW = w / 2, leftX = cx - halfW, rightX = cx + halfW;
                svg += '<line x1="' + leftX + '" y1="' + (mast.y || 0) + '" x2="' + leftX + '" y2="' + baseCy + '" stroke="#252a38" stroke-width="5" stroke-linecap="butt" />';
                svg += '<line x1="' + rightX + '" y1="' + (mast.y || 0) + '" x2="' + rightX + '" y2="' + baseCy + '" stroke="#252a38" stroke-width="5" stroke-linecap="butt" />';
                for (var y = (mast.y || 0) + 20; y < baseCy; y += 30) {
                    svg += '<line x1="' + leftX + '" y1="' + y + '" x2="' + rightX + '" y2="' + (y + 25) + '" stroke="#1d212c" stroke-width="3" />';
                    svg += '<line x1="' + rightX + '" y1="' + y + '" x2="' + leftX + '" y2="' + (y + 25) + '" stroke="#1d212c" stroke-width="3" />';
                }
            } else if (type === 'gantry') {
                svg += '<line x1="' + (cx - 120) + '" y1="' + (mast.y || 0) + '" x2="' + (cx + 80) + '" y2="' + (mast.y || 0) + '" stroke="#2a3040" stroke-width="16" />';
                svg += '<line x1="' + (cx - 120) + '" y1="' + (mast.y || 0) + '" x2="' + (cx - 120) + '" y2="' + baseCy + '" stroke="#2a3040" stroke-width="16" stroke-linecap="butt" />';
            }

            if (mast.platform) {
                var headBottom = this.getHeadBottomY();
                var py = mast.platformY !== undefined ? mast.platformY : (headBottom + 4);
                var pw = mast.platformWidth !== undefined ? mast.platformWidth : (type === 'tubular' ? 52 : 110);
                var ph = mast.platformHeight !== undefined ? mast.platformHeight : 6;
                var px = (mast.platformX !== null && mast.platformX !== undefined) ? mast.platformX : (cx - pw / 2);

                svg += '<rect x="' + px.toFixed(1) + '" y="' + py.toFixed(1) + '" width="' + pw + '" height="' + ph + '" rx="2" fill="#141720" stroke="#394154" stroke-width="1.5" class="mast-platform" />';
                if (type !== 'tubular') {
                    svg += '<line x1="' + px.toFixed(1) + '" y1="' + (py - 22) + '" x2="' + (px + pw).toFixed(1) + '" y2="' + (py - 22) + '" stroke="#2a3040" stroke-width="2.5" />';
                    svg += '<line x1="' + px.toFixed(1) + '" y1="' + (py - 22) + '" x2="' + px.toFixed(1) + '" y2="' + py + '" stroke="#2a3040" stroke-width="2" />';
                    svg += '<line x1="' + (px + pw).toFixed(1) + '" y1="' + (py - 22) + '" x2="' + (px + pw).toFixed(1) + '" y2="' + py + '" stroke="#2a3040" stroke-width="2" />';
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

            svg += this.renderFooting(cx, baseCy, mast);
            svg += '</g>';
            return svg;
        }
    };

    window.MastRenderer = MastRenderer;
})(window);