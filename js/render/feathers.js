(function(window) {
    'use strict';

    var FeatherRenderer = {
        positions: {
            left1: { angle: 135 },
            left2: { angle: 180 },
            left3: { angle: -135 },
            right1: { angle: 45 },
            right2: { angle: 0 },
            right3: { angle: -45 }
        },

        getMainShape: function() {
            var shapes = (window.SignalState && window.SignalState.shapes) || [];
            if (!shapes.length) return null;
            var fb = window.SignalState && window.SignalState.featherBase;
            if (fb && fb.anchorShapeId) {
                var found = shapes.filter(function(s) { return s.id === fb.anchorShapeId; })[0];
                if (found) return found;
            }
            var main = shapes.filter(function(s) { return !!s.isMain; })[0];
            if (main) return main;
            var byId = shapes.filter(function(s) {
                return (s.id && s.id.toLowerCase().indexOf('main') !== -1) || (s.name && s.name.toLowerCase().indexOf('main') !== -1);
            })[0];
            return byId || shapes[0];
        },

        getShapeTopAtX: function(s, targetX) {
            if (!s) return null;
            if (s.type === 'rect' || s.type === 'rounded-rect' || !s.type) {
                return s.y !== undefined ? s.y : 0;
            }
            if (s.type === 'triangle') {
                var tx = s.x || 0, tw = s.width || 40, ty = s.y || 0, th = s.height || 40;
                var dir = (s.direction || 'up').toLowerCase();
                if (targetX >= tx && targetX <= (tx + tw)) {
                    return (dir === 'up') ? ty + (Math.abs(targetX - (tx + tw / 2)) / (tw / 2)) * th : ty;
                }
                return ty;
            }
            if (s.type === 'circle-sector') {
                var cx = s.x || 0, cy = s.y || 0, r = s.radius || 30;
                if (Math.abs(targetX - cx) <= r) {
                    return cy - Math.sqrt(Math.max(0, r * r - Math.pow(targetX - cx, 2)));
                }
                return cy - r;
            }
            return s.y !== undefined ? s.y : null;
        },

        detectHeadTopSurface: function(targetX) {
            var mainShape = this.getMainShape();
            if (mainShape) {
                var y = this.getShapeTopAtX(mainShape, targetX);
                if (y !== null) return y;
                return mainShape.y !== undefined ? mainShape.y : -160;
            }
            return -160;
        },

        detectShapeSurfaceBelow: function(targetX, minY) {
            var mainShape = this.getMainShape();
            if (mainShape) {
                var y = this.getShapeTopAtX(mainShape, targetX);
                if (y !== null && y >= (minY - 2)) return y;
            }
            return this.detectHeadTopSurface(targetX);
        },

        detectShapeTopSurface: function(targetX, minY) {
            return (minY !== undefined && minY > -100) ? this.detectShapeSurfaceBelow(targetX, minY) : this.detectHeadTopSurface(targetX);
        },

        getHubCenter: function(fb) {
            var hx = (fb && fb.x !== undefined) ? fb.x : 0;
            var r = (fb && fb.radius !== undefined) ? fb.radius : 35.5;
            var posMode = (fb && fb.posMode) || (fb && fb.y !== undefined && fb.yOffset === undefined ? 'direct' : 'relative');

            if (posMode === 'direct' && fb && fb.y !== undefined) {
                return { x: hx, y: fb.y };
            }

            var topY = this.detectHeadTopSurface(hx);
            var colH = (fb && fb.showConnector !== false && fb.collarHeight !== null && fb.collarHeight !== undefined && !fb.autoConnect) ? fb.collarHeight : 24;
            var restingHubY = topY - r - (fb && fb.showConnector === false ? 0 : colH);
            var yOff = (fb && fb.yOffset !== undefined) ? fb.yOffset : 0;
            return { x: hx, y: restingHubY - yOff };
        },

        getPolygonVertices: function(cx, cy, sides, baseAngle, apothem) {
            var n = Math.max(3, Math.min(16, sides || 8));
            var rIn = apothem || 35.5;
            var halfAngle = Math.PI / n;
            var rOut = rIn / Math.cos(halfAngle);
            var rotRad = ((baseAngle || 0) - 90) * Math.PI / 180;
            var stepRad = 2 * Math.PI / n;

            var verts = [];
            for (var i = 0; i < n; i++) {
                var vAngle = rotRad + i * stepRad - halfAngle;
                verts.push({
                    x: cx + rOut * Math.cos(vAngle),
                    y: cy + rOut * Math.sin(vAngle)
                });
            }
            return verts;
        },

        renderTrunnionMount: function(hub, fb) {
            if (fb && fb.showConnector === false) return '';
            var hx = hub.x;
            var sides = (fb && fb.sides) ? fb.sides : 8;
            var bAngle = (fb && fb.baseAngle) ? fb.baseAngle : 0;
            var r = (fb && fb.radius) ? fb.radius : 35.5;
            var verts = this.getPolygonVertices(hub.x, hub.y, sides, bAngle, r);

            var maxY = -Infinity;
            for (var v = 0; v < verts.length; v++) {
                if (verts[v].y > maxY) maxY = verts[v].y;
            }
            var hubBottomY = maxY;
            var colW = (fb && fb.collarWidth) ? fb.collarWidth : 32;
            var halfW = colW / 2;

            var headTopY = (fb && fb.collarHeight !== null && fb.collarHeight !== undefined && !fb.autoConnect) ?
                hubBottomY + Math.max(4, fb.collarHeight) : this.detectShapeSurfaceBelow(hx, hubBottomY);

            var collarHeight = Math.max(4, headTopY - hubBottomY);
            var leftContactY = this.detectShapeSurfaceBelow(hx - halfW, hubBottomY);
            var rightContactY = this.detectShapeSurfaceBelow(hx + halfW, hubBottomY);

            var svg = '<g class="feather-trunnion-group">';
            svg += '<rect x="' + (hx - halfW) + '" y="' + hubBottomY.toFixed(1) + '" width="' + colW + '" height="' + collarHeight.toFixed(1) + '" class="feather-trunnion-collar" />';
            svg += '<line x1="' + (hx - halfW - 2) + '" y1="' + hubBottomY.toFixed(1) + '" x2="' + (hx + halfW + 2) + '" y2="' + hubBottomY.toFixed(1) + '" class="feather-trunnion-flange" />';
            svg += '<line x1="' + (hx - halfW - 3) + '" y1="' + leftContactY.toFixed(1) + '" x2="' + (hx + halfW + 3) + '" y2="' + rightContactY.toFixed(1) + '" class="feather-trunnion-flange" />';
            svg += '<circle cx="' + (hx - 7) + '" cy="' + (hubBottomY + 3.0).toFixed(1) + '" r="1.4" class="feather-trunnion-bolt" />';
            svg += '<circle cx="' + (hx + 7) + '" cy="' + (hubBottomY + 3.0).toFixed(1) + '" r="1.4" class="feather-trunnion-bolt" />';
            svg += '</g>';
            return svg;
        },

        buildUnifiedHousing: function(hub, feathers, fb) {
            var sides = (fb && fb.sides) ? fb.sides : 8;
            var bAngle = (fb && fb.baseAngle) ? fb.baseAngle : 0;
            var r = (fb && fb.radius) ? fb.radius : 35.5;
            var verts = this.getPolygonVertices(hub.x, hub.y, sides, bAngle, r);
            var n = verts.length;
            var stepDeg = 360 / n;

            var attached = {};
            if (feathers && feathers.length > 0) {
                for (var i = 0; i < feathers.length; i++) {
                    var fth = feathers[i];
                    var armAngle = (fth.angle !== undefined && fth.angle !== null && !isNaN(fth.angle)) ?
                        parseFloat(fth.angle) : (this.positions[(fth.position || 'left1').toLowerCase()] || this.positions.left1).angle;

                    var bestFacet = 0, bestDiff = Infinity;
                    for (var f = 0; f < n; f++) {
                        var facetAngle = -90 + bAngle + f * stepDeg;
                        var diff = Math.abs(((armAngle - facetAngle + 540) % 360) - 180);
                        if (diff < bestDiff) { bestDiff = diff; bestFacet = f; }
                    }
                    var actualRad = (-90 + bAngle + bestFacet * stepDeg) * Math.PI / 180;
                    attached[bestFacet] = { rad: actualRad, feather: fth };
                    fth._renderedRad = actualRad;
                }
            }

            var path = 'M ' + verts[0].x.toFixed(1) + ' ' + verts[0].y.toFixed(1);
            var hw = 14.0, hwBottom = 10.5, tDist = 9.0, straightLen = 98.0;

            for (var k = 0; k < n; k++) {
                var vStart = verts[k], vEnd = verts[(k + 1) % n];
                var arm = attached[k];

                if (!arm) {
                    path += ' L ' + vEnd.x.toFixed(1) + ' ' + vEnd.y.toFixed(1);
                } else {
                    var rad = arm.rad;
                    var ux = Math.cos(rad), uy = Math.sin(rad);
                    var tx = -uy, ty = ux;
                    var mx = (vStart.x + vEnd.x) / 2, my = (vStart.y + vEnd.y) / 2;

                    path += ' L ' + (mx - tx * hwBottom).toFixed(1) + ' ' + (my - ty * hwBottom).toFixed(1);
                    path += ' L ' + (mx + ux * tDist - tx * hw).toFixed(1) + ' ' + (my + uy * tDist - ty * hw).toFixed(1);
                    path += ' L ' + (hub.x + ux * straightLen - tx * hw).toFixed(1) + ' ' + (hub.y + uy * straightLen - ty * hw).toFixed(1);
                    path += ' A ' + hw + ' ' + hw + ' 0 0 1 ' + (hub.x + ux * straightLen + tx * hw).toFixed(1) + ' ' + (hub.y + uy * straightLen + ty * hw).toFixed(1);
                    path += ' L ' + (mx + ux * tDist + tx * hw).toFixed(1) + ' ' + (my + uy * tDist + ty * hw).toFixed(1);
                    path += ' L ' + (mx + tx * hwBottom).toFixed(1) + ' ' + (my + ty * hwBottom).toFixed(1);
                    path += ' L ' + vEnd.x.toFixed(1) + ' ' + vEnd.y.toFixed(1);
                }
            }
            path += ' Z';
            return '<path d="' + path + '" class="feather-unified-housing" />';
        },

        renderVisor: function(lx, ly, vr) {
            var vx1 = (parseFloat(lx) - vr).toFixed(1), vy1 = (parseFloat(ly) + 0.4).toFixed(1);
            var vx2 = (parseFloat(lx) + vr).toFixed(1), vy2 = (parseFloat(ly) + 0.4).toFixed(1);
            return '<path d="M ' + vx1 + ' ' + vy1 + ' A ' + vr + ' ' + (vr * 0.9).toFixed(1) + ' 0 0 1 ' + vx2 + ' ' + vy2 +
                ' L ' + (parseFloat(lx) + vr - 1.1).toFixed(1) + ' ' + (parseFloat(ly) - 0.9).toFixed(1) +
                ' A ' + (vr - 1.1).toFixed(1) + ' ' + (vr * 0.72).toFixed(1) + ' 0 0 0 ' + (parseFloat(lx) - vr + 1.1).toFixed(1) + ' ' + (parseFloat(ly) - 0.9).toFixed(1) + ' Z" class="feather-visor" />';
        },

        renderLampOptic: function(lx, ly, lr) {
            var bezelR = (lr + 1.8).toFixed(1);
            var off = '<circle cx="' + lx + '" cy="' + ly + '" r="' + bezelR + '" fill="#0a0d16" stroke="#262d3e" stroke-width="1.2" class="feather-lamp-bezel" />' +
                '<circle cx="' + lx + '" cy="' + ly + '" r="' + lr + '" class="lamp-glass-off" fill="#141926" stroke="#0a0d16" stroke-width="1.2" />' +
                '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 0.7).toFixed(1) + '" class="fresnel-ring" />' +
                '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 0.35).toFixed(1) + '" class="fresnel-ring" />';

            var lit = '<circle cx="' + lx + '" cy="' + ly + '" r="' + bezelR + '" fill="#0a0d16" stroke="#262d3e" stroke-width="1.2" />' +
                '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 0.76).toFixed(1) + '" fill="#fbfcf5" />' +
                '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 0.42).toFixed(1) + '" fill="#ffffff" opacity="0.95" />';

            return { off: off, lit: lit, visor: this.renderVisor(lx, ly, lr + 1.4) };
        },

        renderArmLamps: function(feather, isLit, hub) {
            var rad = (feather._renderedRad !== undefined) ? feather._renderedRad : ((this.positions[(feather.position || 'left1').toLowerCase()] || this.positions.left1).angle * Math.PI / 180);
            var ux = Math.cos(rad), uy = Math.sin(rad);

            var offGroup = '<g class="feather-off-layer">', litGroup = '<g class="feather-lit-layer" style="' + (isLit ? 'display: inline;' : 'display: none;') + '">', visorGroup = '<g class="feather-visors-layer">';
            var dists = [24.5, 49.0, 73.5, 98.0];
            for (var d = 0; d < dists.length; d++) {
                var optic = this.renderLampOptic((hub.x + ux * dists[d]).toFixed(1), (hub.y + uy * dists[d]).toFixed(1), 7.4);
                offGroup += optic.off; litGroup += optic.lit; visorGroup += optic.visor;
            }
            return '<g class="feather-unit ' + (isLit ? 'lit' : '') + '" data-feather-id="' + feather.id + '">' + offGroup + '</g>' + litGroup + '</g>' + visorGroup + '</g></g>';
        },

        renderCommonLamp: function(hub, isAnyLit) {
            var optic = this.renderLampOptic(hub.x, hub.y, 7.4);
            return '<g class="feather-common-lamp-group">' + optic.off + '<g class="feather-common-lit-layer" style="' + (isAnyLit ? 'display: inline;' : 'display: none;') + '">' + optic.lit + '</g>' + optic.visor + '</g>';
        },

        renderAll: function(feathers, getLampFn) {
            var fb = (window.SignalState && window.SignalState.featherBase) || { enabled: false };
            var hasFeathers = feathers && feathers.length > 0;
            if (!fb.enabled && !hasFeathers) return '';

            var hub = this.getHubCenter(fb);
            var isAnyLit = false;
            if (hasFeathers && getLampFn) {
                for (var k = 0; k < feathers.length; k++) {
                    if (getLampFn(feathers[k].id)) { isAnyLit = true; break; }
                }
            }

            var svg = '<g class="feather-assembly">' + this.renderTrunnionMount(hub, fb) + this.buildUnifiedHousing(hub, feathers || [], fb);
            if (hasFeathers) {
                for (var i = 0; i < feathers.length; i++) {
                    svg += this.renderArmLamps(feathers[i], getLampFn ? !!getLampFn(feathers[i].id) : false, hub);
                }
            }
            return svg + this.renderCommonLamp(hub, isAnyLit) + '</g>';
        },

        updateCommonLamp: function(container) {
            if (!container) return;
            var layer = container.querySelector('.feather-common-lit-layer');
            if (!layer) return;
            var anyLit = false, list = (window.SignalState && window.SignalState.feathers) || [];
            for (var i = 0; i < list.length; i++) {
                if (window.SignalState.getLamp(list[i].id)) { anyLit = true; break; }
            }
            layer.style.display = anyLit ? 'inline' : 'none';
        }
    };

    window.FeatherRenderer = FeatherRenderer;
})(window);