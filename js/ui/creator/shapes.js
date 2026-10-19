(function(window) {
    'use strict';

    var CreatorShapes = {
        render: function(container) {
            var html = '';
            html += '<div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">';
            html += '  <button id="btnAddRectPlate" class="tool-btn" style="flex:1;">+ Rectangle / Plate</button>';
            html += '  <button id="btnAddRoundedRect" class="tool-btn" style="flex:1;">+ Rounded Box</button>';
            html += '  <button id="btnAddCircleSector" class="tool-btn" style="flex:1;">+ Sector / Cap</button>';
            html += '  <button id="btnAddTriangle" class="tool-btn" style="flex:1;">+ Triangle</button>';
            html += '</div>';

            if (!SignalState.shapes || SignalState.shapes.length === 0) {
                html += '<div style="color:var(--text-secondary); font-size:11px; text-align:center; padding:18px;">No target plates or sub-rectangles yet. Add one above.</div>';
                container.innerHTML = html;
                this.bindAddButtons(container);
                return;
            }

            for (var i = 0; i < SignalState.shapes.length; i++) {
                var s = SignalState.shapes[i];
                var sFill = s.fill || '#0a0d16';
                var sStroke = s.stroke || '#262d3e';
                var sSw = s.strokeWidth !== undefined ? s.strokeWidth : 2;
                var displayName = s.name || (s.text ? ('Label: ' + s.text.replace(/\n/g, ' ')) : ('Plate ' + (i + 1)));

                html += '<div class="builder-card" data-shape-index="' + i + '">';
                html += '  <div class="builder-card-header">';
                html += '    <span class="card-badge">' + displayName + ' <small style="color:var(--text-secondary)">(' + (s.type || 'rect') + ')</small></span>';
                html += '    <div class="card-actions">';
                if (i > 0) html += '      <button class="tool-btn btn-move-shape" data-dir="-1" data-index="' + i + '" title="Send Backward">&uarr;</button>';
                if (i < SignalState.shapes.length - 1) html += '      <button class="tool-btn btn-move-shape" data-dir="1" data-index="' + i + '" title="Bring Forward">&darr;</button>';
                html += '      <button class="tool-btn btn-del-shape" data-index="' + i + '" title="Delete Plate">&times;</button>';
                html += '    </div>';
                html += '  </div>';

                html += '  <div><label class="form-label">Plate Name / Description</label><input type="text" class="form-input sh-prop" data-prop="name" placeholder="e.g. ID Plate, Spacer Box" value="' + (s.name || '') + '"/></div>';

                if (s.type === 'rounded-rect' || s.type === 'rect' || !s.type) {
                    var corners = s.corners || (s.type === 'rect' ? [0, 0, 0, 0] : [8, 8, 8, 8]);
                    html += '  <div class="form-row-2">';
                    html += '    <div><label class="form-label">X Pos</label><input type="number" class="form-input sh-prop" data-prop="x" value="' + (s.x || 0) + '"/></div>';
                    html += '    <div><label class="form-label">Y Pos</label><input type="number" class="form-input sh-prop" data-prop="y" value="' + (s.y || 0) + '"/></div>';
                    html += '  </div>';
                    html += '  <div class="form-row-2">';
                    html += '    <div><label class="form-label">Width</label><input type="number" class="form-input sh-prop" data-prop="width" value="' + (s.width || 60) + '"/></div>';
                    html += '    <div><label class="form-label">Height</label><input type="number" class="form-input sh-prop" data-prop="height" value="' + (s.height || 100) + '"/></div>';
                    html += '  </div>';
                    html += '  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">';
                    html += '    <label class="form-label">Corner Radii</label>';
                    html += '    <div style="display:flex; gap:4px;"><button class="tool-btn btn-center-x" data-index="' + i + '" style="font-size:9px; padding:1px 5px;">Center X: 0</button><button class="tool-btn btn-sync-corners" data-index="' + i + '" style="font-size:9px; padding:1px 5px;">Set All Same</button></div>';
                    html += '  </div>';
                    html += '  <div class="corner-matrix">';
                    html += '    <div class="corner-cell"><span style="font-size:9px; color:var(--text-secondary);">Top Left</span><input type="number" min="0" class="form-input corner-input" data-c-idx="0" value="' + (corners[0] || 0) + '"/></div>';
                    html += '    <div class="corner-cell"><span style="font-size:9px; color:var(--text-secondary);">Top Right</span><input type="number" min="0" class="form-input corner-input" data-c-idx="1" value="' + (corners[1] || 0) + '"/></div>';
                    html += '    <div class="corner-cell"><span style="font-size:9px; color:var(--text-secondary);">Bottom Left</span><input type="number" min="0" class="form-input corner-input" data-c-idx="3" value="' + (corners[3] || 0) + '"/></div>';
                    html += '    <div class="corner-cell"><span style="font-size:9px; color:var(--text-secondary);">Bottom Right</span><input type="number" min="0" class="form-input corner-input" data-c-idx="2" value="' + (corners[2] || 0) + '"/></div>';
                    html += '  </div>';
                    html += '  <div><label class="form-label">Text Stencil (e.g. PWS S-8)</label><input type="text" class="form-input sh-prop" data-prop="text" placeholder="e.g. S-12" value="' + (s.text || '') + '"/></div>';
                } else if (s.type === 'circle-sector') {
                    html += '  <div class="form-row-2">';
                    html += '    <div><label class="form-label">Center X</label><input type="number" class="form-input sh-prop" data-prop="x" value="' + (s.x || 0) + '"/></div>';
                    html += '    <div><label class="form-label">Center Y</label><input type="number" class="form-input sh-prop" data-prop="y" value="' + (s.y || 0) + '"/></div>';
                    html += '  </div>';
                    html += '  <div class="form-row-2">';
                    html += '    <div><label class="form-label">Radius (px)</label><input type="number" class="form-input sh-prop" data-prop="radius" value="' + (s.radius || 30) + '"/></div>';
                    html += '    <div><label class="form-label">Arc Sweep (%)</label><input type="number" min="1" max="100" class="form-input sh-prop" data-prop="percent" value="' + (s.percent !== undefined ? s.percent : 100) + '"/></div>';
                    html += '  </div>';
                    html += '  <div><label class="form-label">Start Angle (0=Top, 90=Right, 180=Bottom)</label><input type="number" class="form-input sh-prop" data-prop="startAngle" value="' + (s.startAngle || 0) + '"/></div>';
                } else if (s.type === 'triangle') {
                    html += '  <div class="form-row-2">';
                    html += '    <div><label class="form-label">X Pos</label><input type="number" class="form-input sh-prop" data-prop="x" value="' + (s.x !== undefined ? s.x : -20) + '"/></div>';
                    html += '    <div><label class="form-label">Y Pos</label><input type="number" class="form-input sh-prop" data-prop="y" value="' + (s.y !== undefined ? s.y : -20) + '"/></div>';
                    html += '  </div>';
                    html += '  <div class="form-row-2">';
                    html += '    <div><label class="form-label">Width</label><input type="number" class="form-input sh-prop" data-prop="width" value="' + (s.width || 40) + '"/></div>';
                    html += '    <div><label class="form-label">Height</label><input type="number" class="form-input sh-prop" data-prop="height" value="' + (s.height || 40) + '"/></div>';
                    html += '  </div>';
                    html += '  <div><label class="form-label">Facing Direction</label><select class="form-select sh-prop" data-prop="direction">';
                    ['up', 'down', 'left', 'right'].forEach(function(d) {
                        html += '<option value="' + d + '" ' + ((s.direction || 'up') === d ? 'selected' : '') + '>' + d.toUpperCase() + '</option>';
                    });
                    html += '  </select></div>';
                }

                html += '  <div class="form-row-2" style="margin-top:2px;">';
                html += '    <div class="color-field"><input type="color" class="color-picker sh-fill-pick" value="' + sFill + '"/><div><label class="form-label">Fill</label><input type="text" class="form-input sh-fill-txt" value="' + sFill + '"/></div></div>';
                html += '    <div class="color-field"><input type="color" class="color-picker sh-stroke-pick" value="' + sStroke + '"/><div><label class="form-label">Border</label><input type="text" class="form-input sh-stroke-txt" value="' + sStroke + '"/></div></div>';
                html += '  </div>';
                html += '  <div><label class="form-label">Border Width (px)</label><input type="number" min="0" step="0.5" class="form-input sh-prop" data-prop="strokeWidth" value="' + sSw + '"/></div>';
                html += '</div>';
            }

            container.innerHTML = html;
            this.bindAddButtons(container);
            this.bindCardEvents(container);
        },

        bindAddButtons: function(container) {
            document.getElementById('btnAddRectPlate').addEventListener('click', function() {
                SignalState.shapes.push({
                    name: 'Spacer Rectangle', type: 'rect', x: -16, y: 45, width: 32, height: 24,
                    corners: [0, 0, 0, 0], fill: '#121622', stroke: '#262d3e', strokeWidth: 1.8
                });
                SignalEvents.emit('state:changed');
                SignalEvents.emit('state:persist');
            });

            document.getElementById('btnAddRoundedRect').addEventListener('click', function() {
                SignalState.shapes.push({
                    name: 'Rounded Target Plate', type: 'rounded-rect', x: -28, y: -160, width: 56, height: 160,
                    corners: [28, 28, 28, 28], fill: '#0a0d16', stroke: '#262d3e', strokeWidth: 2.5
                });
                SignalEvents.emit('state:changed');
                SignalEvents.emit('state:persist');
            });

            document.getElementById('btnAddCircleSector').addEventListener('click', function() {
                SignalState.shapes.push({
                    name: 'Semicircle Cap', type: 'circle-sector', x: 0, y: -50, radius: 36, percent: 50,
                    startAngle: 180, fill: '#0a0d16', stroke: '#262d3e', strokeWidth: 2.5
                });
                SignalEvents.emit('state:changed');
                SignalEvents.emit('state:persist');
            });

            document.getElementById('btnAddTriangle').addEventListener('click', function() {
                SignalState.shapes.push({
                    name: 'Triangle Bracket', type: 'triangle', x: -25, y: -180, width: 50, height: 35,
                    direction: 'up', fill: '#0a0d16', stroke: '#262d3e', strokeWidth: 2.5
                });
                SignalEvents.emit('state:changed');
                SignalEvents.emit('state:persist');
            });
        },

        bindCardEvents: function(container) {
            var cards = container.querySelectorAll('.builder-card');
            for (var c = 0; c < cards.length; c++) {
                (function(card) {
                    var sIdx = parseInt(card.getAttribute('data-shape-index'), 10);
                    var shape = SignalState.shapes[sIdx];
                    if (!shape) return;

                    var props = card.querySelectorAll('.sh-prop');
                    for (var p = 0; p < props.length; p++) {
                        (function(inp) {
                            var updateVal = function() {
                                var pr = inp.getAttribute('data-prop');
                                var val = (inp.type === 'number') ? parseFloat(inp.value) : inp.value;
                                shape[pr] = val;
                                SignalEvents.emit('state:changed');
                                SignalEvents.emit('state:persist');
                            };
                            inp.addEventListener('input', updateVal);
                            inp.addEventListener('change', updateVal);
                        })(props[p]);
                    }

                    var corners = card.querySelectorAll('.corner-input');
                    for (var ci = 0; ci < corners.length; ci++) {
                        (function(cinp) {
                            var updateCorner = function() {
                                var cPos = parseInt(cinp.getAttribute('data-c-idx'), 10);
                                if (!shape.corners) shape.corners = [0, 0, 0, 0];
                                shape.corners[cPos] = Math.max(0, parseFloat(cinp.value) || 0);
                                SignalEvents.emit('state:changed');
                                SignalEvents.emit('state:persist');
                            };
                            cinp.addEventListener('input', updateCorner);
                            cinp.addEventListener('change', updateCorner);
                        })(corners[ci]);
                    }

                    var btnCenter = card.querySelector('.btn-center-x');
                    if (btnCenter) {
                        btnCenter.addEventListener('click', function() {
                            var w = shape.width || 60;
                            shape.x = -Math.round(w / 2);
                            SignalEvents.emit('state:changed');
                            SignalEvents.emit('state:persist');
                        });
                    }

                    var btnSync = card.querySelector('.btn-sync-corners');
                    if (btnSync) {
                        btnSync.addEventListener('click', function() {
                            var first = (shape.corners && shape.corners[0] !== undefined) ? shape.corners[0] : 0;
                            var promptVal = prompt('Enter radius for all 4 corners (px):', first);
                            if (promptVal !== null) {
                                var parsed = Math.max(0, parseFloat(promptVal) || 0);
                                shape.corners = [parsed, parsed, parsed, parsed];
                                SignalEvents.emit('state:changed');
                                SignalEvents.emit('state:persist');
                            }
                        });
                    }

                    var fPick = card.querySelector('.sh-fill-pick'), fTxt = card.querySelector('.sh-fill-txt');
                    if (fPick && fTxt) {
                        fPick.addEventListener('input', function() { fTxt.value = this.value; shape.fill = this.value; SignalEvents.emit('state:changed'); });
                        fTxt.addEventListener('change', function() { fPick.value = this.value; shape.fill = this.value; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
                    }

                    var sPick = card.querySelector('.sh-stroke-pick'), sTxt = card.querySelector('.sh-stroke-txt');
                    if (sPick && sTxt) {
                        sPick.addEventListener('input', function() { sTxt.value = this.value; shape.stroke = this.value; SignalEvents.emit('state:changed'); });
                        sTxt.addEventListener('change', function() { sPick.value = this.value; shape.stroke = this.value; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
                    }
                })(cards[c]);
            }

            var delBtns = container.querySelectorAll('.btn-del-shape');
            for (var d = 0; d < delBtns.length; d++) {
                delBtns[d].addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    SignalState.shapes.splice(idx, 1);
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }

            var moveBtns = container.querySelectorAll('.btn-move-shape');
            for (var m = 0; m < moveBtns.length; m++) {
                moveBtns[m].addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    var dir = parseInt(this.getAttribute('data-dir'), 10);
                    var target = idx + dir;
                    if (target >= 0 && target < SignalState.shapes.length) {
                        var temp = SignalState.shapes[idx];
                        SignalState.shapes[idx] = SignalState.shapes[target];
                        SignalState.shapes[target] = temp;
                        SignalEvents.emit('state:changed');
                        SignalEvents.emit('state:persist');
                    }
                });
            }
        }
    };

    window.CreatorShapes = CreatorShapes;
})(window);