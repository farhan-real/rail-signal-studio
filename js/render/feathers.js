(function(window) {
    'use strict';

    var FeatherRenderer = {
        angles: {
            left1: -135,
            left2: -160,
            left3: -180,
            right1: -45,
            right2: -20,
            right3: 0
        },

        render: function(feather, isLit) {
            var originX = feather.x !== undefined ? feather.x : 0;
            var originY = feather.y !== undefined ? feather.y : -160;
            var deg = this.angles[feather.position || 'left1'];
            if (deg === undefined) deg = -135;

            var lampCount = feather.lamps || 5;
            var spacing = 20;
            var rad = deg * Math.PI / 180;
            var displayStyle = isLit ? 'display: inline;' : 'display: none;';

            var armLength = lampCount * spacing + 14;
            var endX = originX + armLength * Math.cos(rad);
            var endY = originY + armLength * Math.sin(rad);

            var svg = '<g class="feather-unit ' + (isLit ? 'lit' : '') + '" data-feather-id="' + feather.id + '">';

            svg += '<line x1="' + originX + '" y1="' + originY + '" x2="' + endX + '" y2="' + endY + '" stroke="#0a0c10" stroke-width="28" stroke-linecap="round" class="feather-arm" />';
            svg += '<line x1="' + originX + '" y1="' + originY + '" x2="' + endX + '" y2="' + endY + '" stroke="#2a3244" stroke-width="2" stroke-linecap="round" fill="none" />';

            var offLamps = '<g class="feather-off-layer">';
            var litLamps = '<g class="feather-lit-layer" style="' + displayStyle + '">';

            for (var i = 1; i <= lampCount; i++) {
                var dist = i * spacing + 4;
                var lx = originX + dist * Math.cos(rad);
                var ly = originY + dist * Math.sin(rad);
                var lr = 6.5;

                offLamps += '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr + 2) + '" fill="#08090d" stroke="#1d2330" stroke-width="1.5" />';
                offLamps += '<circle cx="' + lx + '" cy="' + ly + '" r="' + lr + '" fill="#181c24" stroke="#0a0d12" stroke-width="1.2" />';

                litLamps += '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 2.3) + '" fill="rgba(235, 245, 255, 0.75)" filter="url(#glowFilter)" />';
                litLamps += '<circle cx="' + lx + '" cy="' + ly + '" r="' + lr + '" fill="#ffffff" stroke="#e0f0ff" stroke-width="1.2" />';
            }

            offLamps += '</g>';
            litLamps += '</g>';
            svg += offLamps + litLamps + '</g>';
            return svg;
        }
    };

    window.FeatherRenderer = FeatherRenderer;
})(window);