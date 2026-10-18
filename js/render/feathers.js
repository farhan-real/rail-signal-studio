(function(window) {
    'use strict';

    var FeatherRenderer = {
        angles: { left1: -45, left2: -60, left3: -75, right1: 45, right2: 60, right3: 75 },

        render: function(feather, isLit) {
            var originX = feather.x || 0, originY = feather.y || 0;
            var deg = this.angles[feather.position || 'left1'] || -45;
            var lampCount = feather.lamps || 5;
            var spacing = 18;
            var rad = deg * Math.PI / 180;
            var litClass = isLit ? 'lit' : '';

            var armLength = lampCount * spacing + 14;
            var endX = originX + armLength * Math.cos(rad);
            var endY = originY + armLength * Math.sin(rad);

            var svg = '<g class="feather-unit ' + litClass + '" data-feather-id="' + feather.id + '">';
            svg += '<line x1="' + originX + '" y1="' + originY + '" x2="' + endX + '" y2="' + endY + '" stroke="#0a0c10" stroke-width="18" stroke-linecap="round" class="feather-arm" />';

            var offLamps = '<g class="feather-off-layer">';
            var litLamps = '<g class="feather-lit-layer">';

            for (var i = 1; i <= lampCount; i++) {
                var dist = i * spacing;
                var lx = originX + dist * Math.cos(rad);
                var ly = originY + dist * Math.sin(rad);
                var lr = 4.5;

                offLamps += '<circle cx="' + lx + '" cy="' + ly + '" r="' + lr + '" fill="#181c24" stroke="#0b0d12" stroke-width="1.2" />';
                litLamps += '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 2.2) + '" fill="rgba(235, 245, 255, 0.5)" filter="url(#glowFilter)" />';
                litLamps += '<circle cx="' + lx + '" cy="' + ly + '" r="' + lr + '" fill="#ffffff" stroke="#e0f0ff" stroke-width="1" />';
            }

            offLamps += '</g>';
            litLamps += '</g>';
            svg += offLamps + litLamps + '</g>';
            return svg;
        }
    };

    window.FeatherRenderer = FeatherRenderer;
})(window);
