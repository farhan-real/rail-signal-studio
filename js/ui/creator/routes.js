(function(window) {
    'use strict';

    var FeatherPositions = [
        { key: 'left1', label: 'Left 1 (High Left, 45° Up)' },
        { key: 'left2', label: 'Left 2 (Med Left, Horizontal)' },
        { key: 'left3', label: 'Left 3 (Low Left, 45° Down)' },
        { key: 'right1', label: 'Right 1 (High Right, 45° Up)' },
        { key: 'right2', label: 'Right 2 (Med Right, Horizontal)' },
        { key: 'right3', label: 'Right 3 (Low Right, 45° Down)' }
    ];

    var CreatorRoutes = {
        render: function(container) {
            var fb = SignalState.featherBase || {
                enabled: false, x: 0, y: undefined, yOffset: 0, posMode: 'relative', anchorShapeId: null,
                sides: 8, baseAngle: 0, radius: 35.5, showConnector: true, collarWidth: 32, collarHeight: null, autoConnect: true
            };
            var isDirect = (fb.posMode === 'direct');
            var hubYVal = isDirect ? Math.round(-(fb.y !== undefined ? fb.y : -190)) : (fb.yOffset !== undefined ? fb.yOffset : 0);
            var showConn = (fb.showConnector !== false);
            var html = '';

            html += '<div class="builder-card">';
            html += '  <div class="builder-card-header">';
            html += '    <span class="card-badge">Feather Base (Hub & Mount)</span>';
            html += '    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chkFeatherBaseEnabled" ' + (fb.enabled ? 'checked' : '') + '/><span style="font-size:11px; font-weight:700;">Show Base</span></label>';
            html += '  </div>';

            if (fb.enabled) {
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Anchor Reference Box</label><select id="fbAnchorShape" class="form-select">';
                html += '      <option value="">Auto (Main Signal Box)</option>';
                for (var sIdx = 0; sIdx < SignalState.shapes.length; sIdx++) {
                    var shp = SignalState.shapes[sIdx];
                    var sName = shp.name || ('Plate ' + (sIdx + 1));
                    html += '<option value="' + (shp.id || '') + '"' + (fb.anchorShapeId === shp.id ? ' selected' : '') + '>' + sName + (shp.isMain ? ' [Main]' : '') + '</option>';
                }
                html += '    </select></div>';
                html += '    <div><label class="form-label">Placement Mode</label><select id="fbPosMode" class="form-select">';
                html += '      <option value="relative"' + (!isDirect ? ' selected' : '') + '>1: Offset Above Signal Box</option>';
                html += '      <option value="direct"' + (isDirect ? ' selected' : '') + '>2: Direct Coordinates (+Y Up)</option>';
                html += '    </select></div>';
                html += '  </div>';

                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Hub X (0 = Center)</label><input type="number" id="fbX" class="form-input" value="' + (fb.x !== undefined ? fb.x : 0) + '"/></div>';
                html += '    <div><label class="form-label">' + (isDirect ? 'Direct Y (px, +Y Up)' : 'Y Offset (px above box)') + '</label><input type="number" id="fbYInput" class="form-input" value="' + hubYVal + '"/></div>';
                html += '  </div>';

                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Base Sides (Facets)</label><select id="fbSides" class="form-select">';
                [6, 8, 10, 12, 16].forEach(function(s) {
                    html += '<option value="' + s + '"' + ((fb.sides || 8) === s ? ' selected' : '') + '>' + s + ' Sides' + (s === 8 ? ' (Octagon)' : (s === 6 ? ' (Hexagon)' : '')) + '</option>';
                });
                html += '    </select></div>';
                html += '    <div><label class="form-label">Base Angle Rotation (°)</label><input type="number" min="-180" max="180" id="fbAngle" class="form-input" value="' + (fb.baseAngle || 0) + '"/></div>';
                html += '  </div>';

                html += '  <div><label class="form-label">Hub Radius (px)</label><input type="number" min="16" max="70" id="fbRadius" class="form-input" value="' + (fb.radius || 35.5) + '"/></div>';
                html += '  <div style="margin-top:2px;"><label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="chkFbShowConnector" ' + (showConn ? 'checked' : '') + '/><span>Show bottom mount connector (collar & bolts)</span></label></div>';

                if (showConn) {
                    html += '  <div class="form-row-2" style="margin-top:4px;">';
                    html += '    <div><label class="form-label">Collar Width</label><input type="number" id="fbCollarWidth" class="form-input" value="' + (fb.collarWidth || 32) + '"/></div>';
                    html += '    <div><label class="form-label">Connector Height</label><input type="number" id="fbCollarHeight" class="form-input" placeholder="Auto" value="' + (fb.collarHeight !== null && fb.collarHeight !== undefined ? fb.collarHeight : '') + '"/></div>';
                    html += '  </div>';
                    html += '  <div style="margin-top:2px;"><label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="chkFbAutoConnect" ' + (fb.autoConnect !== false ? 'checked' : '') + '/><span>Auto-connect collar to shape boundary</span></label></div>';
                }
            }
            html += '</div>';

            html += '<div style="margin-top:14px; margin-bottom:14px;"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">';
            html += '  <h4 style="font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">Feather Arms (' + (SignalState.feathers ? SignalState.feathers.length : 0) + ')</h4>';
            html += '  <button id="btnAddFeather" class="tool-btn">+ Add Feather</button>';
            html += '</div>';

            if (SignalState.feathers && SignalState.feathers.length > 0) {
                for (var f = 0; f < SignalState.feathers.length; f++) {
                    var fth = SignalState.feathers[f];
                    var isLit = SignalState.getLamp(fth.id);
                    html += '<div class="builder-card" data-feather-index="' + f + '">';
                    html += '  <div class="builder-card-header">';
                    html += '    <span class="card-badge">' + fth.id + '</span>';
                    html += '    <div class="card-actions">';
                    html += '      <button class="btn-preview-lit ' + (isLit ? 'active' : '') + '" data-feather-id="' + fth.id + '">Preview Lit</button>';
                    html += '      <button class="tool-btn btn-del-feather" data-index="' + f + '">&times;</button>';
                    html += '    </div>';
                    html += '  </div>';
                    html += '  <div class="form-row-2">';
                    html += '    <div><label class="form-label">Feather ID</label><input type="text" class="form-input ft-prop" data-prop="id" value="' + fth.id + '"/></div>';
                    html += '    <div><label class="form-label">Position / Direction</label><select class="form-select ft-prop" data-prop="position">';
                    for (var p = 0; p < FeatherPositions.length; p++) {
                        var sel = (fth.position || 'left1') === FeatherPositions[p].key ? 'selected' : '';
                        html += '<option value="' + FeatherPositions[p].key + '" ' + sel + '>' + FeatherPositions[p].label + '</option>';
                    }
                    html += '    </select></div>';
                    html += '  </div>';
                    html += '</div>';
                }
            } else {
                html += '<div style="color:var(--text-secondary); font-size:11px; text-align:center; padding:10px 0;">No directional feather arms added yet.</div>';
            }
            html += '</div>';

            var mat = SignalState.matrix || { enabled: false, id: 'ROUTE_BOX', size: '1x', x: 0, y: undefined, yOffset: 0, posMode: 'relative', showBase: true, connectorHeight: null, text: '', lit: false };
            var matIsDirect = (mat.posMode === 'direct');
            var matYVal = matIsDirect ? Math.round(-(mat.y !== undefined ? mat.y : -240)) : (mat.yOffset !== undefined ? mat.yOffset : 0);
            var isMat2x = (mat.size === '2x');

            html += '<div class="builder-card">';
            html += '  <div class="builder-card-header">';
            html += '    <span class="card-badge">5x7 Theatre Route Matrix Box</span>';
            html += '    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chkMatrixEnabled" ' + (mat.enabled ? 'checked' : '') + '/><span style="font-size:11px; font-weight:700;">Enabled</span></label>';
            html += '  </div>';

            if (mat.enabled) {
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Box ID</label><input type="text" id="matId" class="form-input" value="' + (mat.id || 'ROUTE_BOX') + '"/></div>';
                html += '    <div><label class="form-label">Matrix Size</label><select id="matSize" class="form-select">';
                html += '      <option value="1x"' + (!isMat2x ? ' selected' : '') + '>1x Matrix (Single Character)</option>';
                html += '      <option value="2x"' + (isMat2x ? ' selected' : '') + '>2x Matrix (Dual Character - e.g. L2)</option>';
                html += '    </select></div>';
                html += '  </div>';
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Stencil Text (e.g. M, L2)</label><input type="text" id="matText" class="form-input" maxlength="2" placeholder="e.g. M or L2" value="' + (mat.text || '') + '"/></div>';
                html += '    <div><label class="form-label">Placement Mode</label><select id="matPosMode" class="form-select">';
                html += '      <option value="relative"' + (!matIsDirect ? ' selected' : '') + '>1: Offset Above Assembly</option>';
                html += '      <option value="direct"' + (matIsDirect ? ' selected' : '') + '>2: Direct Coordinates (+Y Up)</option>';
                html += '    </select></div>';
                html += '  </div>';
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Matrix X (0 = Center)</label><input type="number" id="matX" class="form-input" value="' + (mat.x !== undefined ? mat.x : 0) + '"/></div>';
                html += '    <div><label class="form-label">' + (matIsDirect ? 'Direct Y (px, +Y Up)' : 'Y Offset (px above top)') + '</label><input type="number" id="matYInput" class="form-input" value="' + matYVal + '"/></div>';
                html += '  </div>';
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Connector Height</label><input type="number" id="matConnHeight" class="form-input" placeholder="Auto" value="' + (mat.connectorHeight !== null && mat.connectorHeight !== undefined ? mat.connectorHeight : '') + '"/></div>';
                html += '    <div style="display:flex; align-items:flex-end; padding-bottom:1px;"><button class="btn-preview-lit ' + (mat.lit ? 'active' : '') + '" id="btnPreviewMatrix" style="width:100%; height:26px;">Preview Lit</button></div>';
                html += '  </div>';
                html += '  <div style="margin-top:4px;"><label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="chkMatrixShowBase" ' + (mat.showBase !== false ? 'checked' : '') + '/><span>Show base mount bracket</span></label></div>';
            }
            html += '</div>';

            container.innerHTML = html;
            this.bindEvents(container);
        },

        bindEvents: function(container) {
            var bindInp = function(id, onVal) {
                var el = document.getElementById(id);
                if (el) {
                    var h = function() { var r = el.value.trim(); if (r !== '' && r !== '-') onVal(parseFloat(r) || 0); };
                    el.addEventListener('input', h); el.addEventListener('change', h);
                }
            };

            var chkFb = document.getElementById('chkFeatherBaseEnabled');
            if (chkFb) {
                chkFb.addEventListener('change', function() {
                    SignalState.featherBase.enabled = this.checked;
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }

            var anchorSel = document.getElementById('fbAnchorShape');
            if (anchorSel) {
                anchorSel.addEventListener('change', function() {
                    SignalState.featherBase.anchorShapeId = this.value || null;
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                });
            }

            var posModeSel = document.getElementById('fbPosMode');
            if (posModeSel) {
                posModeSel.addEventListener('change', function() {
                    SignalState.featherBase.posMode = this.value;
                    if (this.value === 'direct' && SignalState.featherBase.y === undefined) {
                        SignalState.featherBase.y = Math.round(window.FeatherRenderer ? window.FeatherRenderer.getHubCenter(SignalState.featherBase).y : -190);
                    }
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }

            bindInp('fbX', function(v) { SignalState.featherBase.x = v; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            bindInp('fbYInput', function(v) {
                if (SignalState.featherBase.posMode === 'direct') SignalState.featherBase.y = -v;
                else { SignalState.featherBase.yOffset = v; delete SignalState.featherBase.y; }
                SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
            });

            var fbSides = document.getElementById('fbSides');
            if (fbSides) fbSides.addEventListener('change', function() { SignalState.featherBase.sides = parseInt(this.value, 10) || 8; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            bindInp('fbAngle', function(v) { SignalState.featherBase.baseAngle = v; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            bindInp('fbRadius', function(v) { SignalState.featherBase.radius = Math.max(16, Math.min(80, v)); SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });

            var chkConn = document.getElementById('chkFbShowConnector');
            if (chkConn) {
                chkConn.addEventListener('change', function() {
                    SignalState.featherBase.showConnector = this.checked;
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }

            bindInp('fbCollarWidth', function(v) { SignalState.featherBase.collarWidth = Math.max(10, v); SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            var fbCH = document.getElementById('fbCollarHeight');
            if (fbCH) {
                fbCH.addEventListener('input', function() {
                    var v = this.value.trim();
                    SignalState.featherBase.collarHeight = (v === '' ? null : parseFloat(v));
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                });
            }

            var chkAuto = document.getElementById('chkFbAutoConnect');
            if (chkAuto) chkAuto.addEventListener('change', function() { SignalState.featherBase.autoConnect = this.checked; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });

            var btnAdd = document.getElementById('btnAddFeather');
            if (btnAdd) {
                btnAdd.addEventListener('click', function() {
                    if (!SignalState.feathers) SignalState.feathers = [];
                    SignalState.featherBase.enabled = true;
                    var num = SignalState.feathers.length + 1;
                    var id = 'FEATHER_' + (num % 2 === 1 ? 'L' : 'R') + Math.ceil(num / 2);
                    SignalState.feathers.push({ id: id, position: (num % 2 === 1 ? 'left1' : 'right1'), lamps: 5 });
                    SignalState.lampStates[id] = false;
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }

            var cards = container.querySelectorAll('.builder-card[data-feather-index]');
            for (var c = 0; c < cards.length; c++) {
                (function(card) {
                    var idx = parseInt(card.getAttribute('data-feather-index'), 10), fth = SignalState.feathers[idx];
                    if (!fth) return;
                    var props = card.querySelectorAll('.ft-prop');
                    for (var p = 0; p < props.length; p++) {
                        props[p].addEventListener('change', function() { fth[this.getAttribute('data-prop')] = this.value; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
                    }
                    var btnLit = card.querySelector('.btn-preview-lit');
                    if (btnLit) {
                        btnLit.addEventListener('click', function() { var cur = SignalState.getLamp(fth.id); SignalState.setLamp(fth.id, !cur); this.classList.toggle('active', !cur); });
                    }
                })(cards[c]);
            }

            var dels = container.querySelectorAll('.btn-del-feather');
            for (var d = 0; d < dels.length; d++) {
                dels[d].addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    if (SignalState.feathers[idx]) delete SignalState.lampStates[SignalState.feathers[idx].id];
                    SignalState.feathers.splice(idx, 1);
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }

            var chkMat = document.getElementById('chkMatrixEnabled');
            if (chkMat) {
                chkMat.addEventListener('change', function() {
                    SignalState.matrix.enabled = this.checked;
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }

            var matSizeSel = document.getElementById('matSize');
            if (matSizeSel) {
                matSizeSel.addEventListener('change', function() {
                    SignalState.matrix.size = this.value;
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                });
            }

            var mText = document.getElementById('matText');
            if (mText) {
                mText.addEventListener('input', function() {
                    SignalState.matrix.enabled = true; SignalState.matrix.text = this.value.toUpperCase(); SignalState.matrix.lit = true;
                    if (this.value.trim().length > 1 && SignalState.matrix.size !== '2x') {
                        SignalState.matrix.size = '2x';
                        if (matSizeSel) matSizeSel.value = '2x';
                    }
                    var btn = document.getElementById('btnPreviewMatrix'); if (btn) btn.classList.add('active');
                    SignalEvents.emit('matrix:updated', SignalState.matrix.text); SignalEvents.emit('state:persist');
                });
            }

            var mId = document.getElementById('matId');
            if (mId) mId.addEventListener('change', function() { SignalState.matrix.id = this.value; SignalEvents.emit('state:persist'); });

            var matPosMode = document.getElementById('matPosMode');
            if (matPosMode) {
                matPosMode.addEventListener('change', function() {
                    SignalState.matrix.posMode = this.value;
                    if (this.value === 'direct' && SignalState.matrix.y === undefined) SignalState.matrix.y = -240;
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }

            bindInp('matX', function(v) { SignalState.matrix.x = v; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            bindInp('matYInput', function(v) {
                if (SignalState.matrix.posMode === 'direct') SignalState.matrix.y = -v;
                else { SignalState.matrix.yOffset = v; delete SignalState.matrix.y; }
                SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
            });

            var matCH = document.getElementById('matConnHeight');
            if (matCH) {
                matCH.addEventListener('input', function() {
                    var v = this.value.trim();
                    SignalState.matrix.connectorHeight = (v === '' ? null : parseFloat(v));
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                });
            }

            var chkMatBase = document.getElementById('chkMatrixShowBase');
            if (chkMatBase) {
                chkMatBase.addEventListener('change', function() {
                    SignalState.matrix.showBase = this.checked;
                    SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist');
                });
            }

            var btnMatLit = document.getElementById('btnPreviewMatrix');
            if (btnMatLit) {
                btnMatLit.addEventListener('click', function() {
                    SignalState.matrix.lit = !SignalState.matrix.lit;
                    if (SignalState.matrix.lit && !SignalState.matrix.text) {
                        SignalState.matrix.text = 'M';
                        var txtInp = document.getElementById('matText'); if (txtInp) txtInp.value = 'M';
                    }
                    SignalEvents.emit('matrix:updated', SignalState.matrix.lit ? SignalState.matrix.text : '');
                    this.classList.toggle('active', !!SignalState.matrix.lit); SignalEvents.emit('state:persist');
                });
            }
        }
    };

    window.CreatorRoutes = CreatorRoutes;
})(window);