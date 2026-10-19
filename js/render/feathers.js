(function(window) {
    'use strict';

    var FeatherRenderer = {
        positions: {
            left1: { angle: 135, facetIndex: 5 },
            left2: { angle: -180, facetIndex: 6 },
            left3: { angle: -135, facetIndex: 7 },
            right1: { angle: 45, facetIndex: 3 },
            right2: { angle: 0, facetIndex: 2 },
            right3: { angle: -45, facetIndex: 1 },
            pos1: { angle: 135, facetIndex: 5 },
            pos2: { angle: -180, facetIndex: 6 },
            pos3: { angle: -135, facetIndex: 7 },
            pos4: { angle: 45, facetIndex: 3 },
            pos5: { angle: 0, facetIndex: 2 },
            pos6: { angle: -45, facetIndex: 1 }
        },

        getHubCenter: function(fb) {
            if (fb && fb.x !== undefined && fb.y !== undefined) return { x: fb.x, y: fb.y };
            if (window.SignalState && window.SignalState.featherBase) {
                var s = window.SignalState.featherBase;
                return { x: s.x !== undefined ? s.x : 0, y: s.y !== undefined ? s.y : -196 };
            }
            return { x: 0, y: -196 };
        },

        detectShapeTopSurface: function(targetX, minAboveY) {
            var shapes = (window.SignalState && window.SignalState.shapes) || [];
            var closestY = null;

            for (var i = 0; i < shapes.length; i++) {
                var s = shapes[i];
                var yAtX = null;

                if (s.type === 'rect' || s.type === 'rounded-rect' || !s.type) {
                    var sx = s.x || 0, sw = s.width || 60, sy = s.y || 0;
                    if (targetX >= sx - 4 && targetX <= (sx + sw + 4)) {
                        yAtX = sy;
                    }
                } else if (s.type === 'triangle') {
                    var tx = s.x || 0, tw = s.width || 40, ty = s.y || 0, th = s.height || 40;
                    var dir = (s.direction || 'up').toLowerCase();
                    if (targetX >= tx && targetX <= (tx + tw)) {
                        if (dir === 'up') {
                            var apexX = tx + tw / 2;
                            var dist = Math.abs(targetX - apexX);
                            yAtX = ty + (dist / (tw / 2)) * th;
                        } else {
                            yAtX = ty;
                        }
                    }
                } else if (s.type === 'circle-sector') {
                    var cx = s.x || 0, cy = s.y || 0, r = s.radius || 30;
                    if (Math.abs(targetX - cx) <= r) {
                        var dy = Math.sqrt(Math.max(0, r * r - Math.pow(targetX - cx, 2)));
                        yAtX = cy - dy;
                    }
                }

                if (yAtX !== null && yAtX > (minAboveY - 10)) {
                    if (closestY === null || yAtX < closestY) closestY = yAtX;
                }
            }
            return closestY !== null ? closestY : -160;
        },

        getOctagonVertices: function(cx, cy) {
            return [
                { x: cx - 14.5, y: cy - 35.5 },
                { x: cx + 14.5, y: cy - 35.5 },
                { x: cx + 35.5, y: cy - 14.5 },
                { x: cx + 35.5, y: cy + 14.5 },
                { x: cx + 14.5, y: cy + 35.5 },
                { x: cx - 14.5, y: cy + 35.5 },
                { x: cx - 35.5, y: cy + 14.5 },
                { x: cx - 35.5, y: cy - 14.5 }
            ];
        },

        renderTrunnionMount: function(hub, fb) {
            var hx = hub.x;
            var octBottomY = hub.y + 35.5;
            var colW = (fb && fb.collarWidth) ? fb.collarWidth : 32;
            var halfW = colW / 2;

            var headTopY;
            if (fb && fb.collarHeight !== null && fb.collarHeight !== undefined && !fb.autoConnect) {
                headTopY = octBottomY + Math.max(4, fb.collarHeight);
            } else {
                headTopY = this.detectShapeTopSurface(hx, octBottomY);
            }

            var collarHeight = Math.max(4, headTopY - octBottomY);
            var leftContactY = this.detectShapeTopSurface(hx - halfW, octBottomY);
            var rightContactY = this.detectShapeTopSurface(hx + halfW, octBottomY);

            var svg = '<g class="feather-trunnion-group">';
            svg += '<rect x="' + (hx - halfW) + '" y="' + octBottomY.toFixed(1) + '" width="' + colW + '" height="' + collarHeight.toFixed(1) + '" class="feather-trunnion-collar" />';
            svg += '<line x1="' + (hx - halfW - 2) + '" y1="' + octBottomY.toFixed(1) + '" x2="' + (hx + halfW + 2) + '" y2="' + octBottomY.toFixed(1) + '" class="feather-trunnion-flange" />';
            svg += '<line x1="' + (hx - halfW - 3) + '" y1="' + leftContactY.toFixed(1) + '" x2="' + (hx + halfW + 3) + '" y2="' + rightContactY.toFixed(1) + '" class="feather-trunnion-flange" />';
            svg += '<circle cx="' + (hx - 7) + '" cy="' + (octBottomY + 3.0).toFixed(1) + '" r="1.4" class="feather-trunnion-bolt" />';
            svg += '<circle cx="' + (hx + 7) + '" cy="' + (octBottomY + 3.0).toFixed(1) + '" r="1.4" class="feather-trunnion-bolt" />';
            svg += '</g>';
            return svg;
        },

        buildUnifiedHousing: function(hub, feathers) {
            var verts = this.getOctagonVertices(hub.x, hub.y);
            var attached = {};

            if (feathers && feathers.length > 0) {
                for (var i = 0; i < feathers.length; i++) {
                    var pKey = (feathers[i].position || 'left1').toLowerCase();
                    var conf = this.positions[pKey];
                    if (conf) attached[conf.facetIndex] = conf;
                }
            }

            var path = 'M ' + verts[0].x.toFixed(1) + ' ' + verts[0].y.toFixed(1);
            var hw = 14.0, hwBottom = 10.5, tDist = 9.0, straightLen = 98.0;

            for (var f = 0; f < 8; f++) {
                var vStart = verts[f], vEnd = verts[(f + 1) % 8];
                var arm = attached[f];

                if (!arm) {
                    path += ' L ' + vEnd.x.toFixed(1) + ' ' + vEnd.y.toFixed(1);
                } else {
                    var rad = arm.angle * Math.PI / 180;
                    var ux = Math.cos(rad), uy = Math.sin(rad);
                    var tx = -uy, ty = ux;
                    var mx = (vStart.x + vEnd.x) / 2, my = (vStart.y + vEnd.y) / 2;

                    var bLeftX = (mx - tx * hwBottom).toFixed(1), bLeftY = (my - ty * hwBottom).toFixed(1);
                    var bRightX = (mx + tx * hwBottom).toFixed(1), bRightY = (my + ty * hwBottom).toFixed(1);
                    var transLeftX = (mx + ux * tDist - tx * hw).toFixed(1), transLeftY = (my + uy * tDist - ty * hw).toFixed(1);
                    var transRightX = (mx + ux * tDist + tx * hw).toFixed(1), transRightY = (my + uy * tDist + ty * hw).toFixed(1);
                    var tCenterX = hub.x + ux * straightLen, tCenterY = hub.y + uy * straightLen;
                    var tLeftX = (tCenterX - tx * hw).toFixed(1), tLeftY = (tCenterY - ty * hw).toFixed(1);
                    var tRightX = (tCenterX + tx * hw).toFixed(1), tRightY = (tCenterY + ty * hw).toFixed(1);

                    path += ' L ' + bLeftX + ' ' + bLeftY;
                    path += ' L ' + transLeftX + ' ' + transLeftY;
                    path += ' L ' + tLeftX + ' ' + tLeftY;
                    path += ' A ' + hw + ' ' + hw + ' 0 0 1 ' + tRightX + ' ' + tRightY;
                    path += ' L ' + transRightX + ' ' + transRightY;
                    path += ' L ' + bRightX + ' ' + bRightY;
                    path += ' L ' + vEnd.x.toFixed(1) + ' ' + vEnd.y.toFixed(1);
                }
            }
            path += ' Z';
            return '<path d="' + path + '" class="feather-unified-housing" />';
        },

        renderVisor: function(lx, ly, vr) {
            var vx1 = (parseFloat(lx) - vr).toFixed(1), vy1 = (parseFloat(ly) + 0.4).toFixed(1);
            var vx2 = (parseFloat(lx) + vr).toFixed(1), vy2 = (parseFloat(ly) + 0.4).toFixed(1);
            var vPath = 'M ' + vx1 + ' ' + vy1 + ' A ' + vr + ' ' + (vr * 0.9).toFixed(1) + ' 0 0 1 ' + vx2 + ' ' + vy2 +
                ' L ' + (parseFloat(lx) + vr - 1.1).toFixed(1) + ' ' + (parseFloat(ly) - 0.9).toFixed(1) +
                ' A ' + (vr - 1.1).toFixed(1) + ' ' + (vr * 0.72).toFixed(1) + ' 0 0 0 ' + (parseFloat(lx) - vr + 1.1).toFixed(1) + ' ' + (parseFloat(ly) - 0.9).toFixed(1) + ' Z';
            return '<path d="' + vPath + '" class="feather-visor" />';
        },

        renderLampOptic: function(lx, ly, lr) {
            var bezelR = (lr + 1.8).toFixed(1);
            var off = '<circle cx="' + lx + '" cy="' + ly + '" r="' + bezelR + '" fill="#0a0d16" stroke="#262d3e" stroke-width="1.2" class="feather-lamp-bezel" />';
            off += '<circle cx="' + lx + '" cy="' + ly + '" r="' + lr + '" class="lamp-glass-off" fill="#141926" stroke="#0a0d16" stroke-width="1.2" />';
            off += '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 0.7).toFixed(1) + '" class="fresnel-ring" />';
            off += '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 0.35).toFixed(1) + '" class="fresnel-ring" />';

            var lit = '<circle cx="' + lx + '" cy="' + ly + '" r="' + bezelR + '" fill="#0a0d16" stroke="#262d3e" stroke-width="1.2" />';
            lit += '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 0.76).toFixed(1) + '" fill="#fbfcf5" />';
            lit += '<circle cx="' + lx + '" cy="' + ly + '" r="' + (lr * 0.42).toFixed(1) + '" fill="#ffffff" opacity="0.95" />';

            var visor = this.renderVisor(lx, ly, lr + 1.4);
            return { off: off, lit: lit, visor: visor };
        },

        renderArmLamps: function(feather, isLit, hub) {
            var pKey = (feather.position || 'left1').toLowerCase();
            var conf = this.positions[pKey] || this.positions.left1;
            var rad = conf.angle * Math.PI / 180;
            var ux = Math.cos(rad), uy = Math.sin(rad);

            var offGroup = '<g class="feather-off-layer">';
            var litGroup = '<g class="feather-lit-layer" style="' + (isLit ? 'display: inline;' : 'display: none;') + '">';
            var visorGroup = '<g class="feather-visors-layer">';

            var dists = [24.5, 49.0, 73.5, 98.0];
            for (var d = 0; d < dists.length; d++) {
                var lx = (hub.x + ux * dists[d]).toFixed(1);
                var ly = (hub.y + uy * dists[d]).toFixed(1);
                var optic = this.renderLampOptic(lx, ly, 7.4);
                offGroup += optic.off;
                litGroup += optic.lit;
                visorGroup += optic.visor;
            }

            offGroup += '</g>';
            litGroup += '</g>';
            visorGroup += '</g>';

            return '<g class="feather-unit ' + (isLit ? 'lit' : '') + '" data-feather-id="' + feather.id + '">' +
                offGroup + litGroup + visorGroup + '</g>';
        },

        renderCommonLamp: function(hub, isAnyLit) {
            var optic = this.renderLampOptic(hub.x, hub.y, 7.4);
            var svg = '<g class="feather-common-lamp-group">';
            svg += optic.off;
            svg += '<g class="feather-common-lit-layer" style="' + (isAnyLit ? 'display: inline;' : 'display: none;') + '">';
            svg += optic.lit;
            svg += '</g>';
            svg += optic.visor;
            svg += '</g>';
            return svg;
        },

        renderAll: function(feathers, getLampFn) {
            var fb = (window.SignalState && window.SignalState.featherBase) || { enabled: false };
            var hasFeathers = feathers && feathers.length > 0;
            var isBaseActive = fb.enabled || hasFeathers;

            if (!isBaseActive) return '';

            var hub = this.getHubCenter(fb);
            var isAnyLit = false;
            if (hasFeathers && getLampFn) {
                for (var k = 0; k < feathers.length; k++) {
                    if (getLampFn(feathers[k].id)) { isAnyLit = true; break; }
                }
            }

            var svg = '<g class="feather-assembly">';
            svg += this.renderTrunnionMount(hub, fb);
            svg += this.buildUnifiedHousing(hub, feathers || []);

            if (hasFeathers) {
                for (var i = 0; i < feathers.length; i++) {
                    var fth = feathers[i];
                    var isLit = getLampFn ? !!getLampFn(fth.id) : false;
                    svg += this.renderArmLamps(fth, isLit, hub);
                }
            }

            svg += this.renderCommonLamp(hub, isAnyLit);
            svg += '</g>';
            return svg;
        },

        updateCommonLamp: function(container) {
            if (!container) return;
            var commonLitLayer = container.querySelector('.feather-common-lit-layer');
            if (!commonLitLayer) return;

            var anyLit = false;
            if (window.SignalState && window.SignalState.feathers) {
                for (var i = 0; i < window.SignalState.feathers.length; i++) {
                    if (window.SignalState.getLamp(window.SignalState.feathers[i].id)) {
                        anyLit = true;
                        break;
                    }
                }
            }
            commonLitLayer.style.display = anyLit ? 'inline' : 'none';
        }
    };

    window.FeatherRenderer = FeatherRenderer;
})(window);