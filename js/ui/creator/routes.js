(function(window) {
    'use strict';

    var FeatherPositions = [
        { key: 'left1', label: 'Left 1 (-135° High Left)' },
        { key: 'left2', label: 'Left 2 (-180° Med Left)' },
        { key: 'left3', label: 'Left 3 (+135° Low Left)' },
        { key: 'right1', label: 'Right 1 (-45° High Right)' },
        { key: 'right2', label: 'Right 2 (0° Med Right)' },
        { key: 'right3', label: 'Right 3 (+45° Low Right)' }
    ];

    var CreatorRoutes = {
        render: function(container) {
            var fb = SignalState.featherBase || { enabled: false, x: 0, y: -196, collarWidth: 32, collarHeight: null, autoConnect: true };
            var html = '';

            html += '<div class="builder-card">';
            html += '  <div class="builder-card-header">';
            html += '    <span class="card-badge">Feather Base (Hub & Trunnion Mount)</span>';
            html += '    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chkFeatherBaseEnabled" ' + (fb.enabled ? 'checked' : '') + '/><span style="font-size:11px; font-weight:700;">Show Base</span></label>';
            html += '  </div>';

            if (fb.enabled) {
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Hub X</label><input type="number" id="fbX" class="form-input" value="' + (fb.x !== undefined ? fb.x : 0) + '"/></div>';
                html += '    <div><label class="form-label">Hub Y</label><input type="number" id="fbY" class="form-input" value="' + (fb.y !== undefined ? fb.y : -196) + '"/></div>';
                html += '  </div>';
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Collar Width</label><input type="number" id="fbCollarWidth" class="form-input" value="' + (fb.collarWidth || 32) + '"/></div>';
                html += '    <div><label class="form-label">Collar Height</label><input type="number" id="fbCollarHeight" class="form-input" placeholder="Auto" value="' + (fb.collarHeight !== null && fb.collarHeight !== undefined ? fb.collarHeight : '') + '"/></div>';
                html += '  </div>';
                html += '  <div style="margin-top:2px;"><label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="chkFbAutoConnect" ' + (fb.autoConnect !== false ? 'checked' : '') + '/><span>Auto-connect collar to underlying shape boundary</span></label></div>';
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
                    html += '    <div><label class="form-label">Position / Angle</label><select class="form-select ft-prop" data-prop="position">';
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

            var mat = SignalState.matrix || { enabled: false, id: 'ROUTE_BOX', x: 0, y: -192, text: '', lit: false };
            html += '<div class="builder-card">';
            html += '  <div class="builder-card-header">';
            html += '    <span class="card-badge">5x7 Theatre Route Matrix Box</span>';
            html += '    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chkMatrixEnabled" ' + (mat.enabled ? 'checked' : '') + '/><span style="font-size:11px; font-weight:700;">Enabled</span></label>';
            html += '  </div>';

            if (mat.enabled) {
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Box ID</label><input type="text" id="matId" class="form-input" value="' + (mat.id || 'ROUTE_BOX') + '"/></div>';
                html += '    <div><label class="form-label">Stencil Text (e.g. M, 1, 2)</label><input type="text" id="matText" class="form-input" maxlength="2" value="' + (mat.text || '') + '"/></div>';
                html += '  </div>';
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">X Offset</label><input type="number" id="matX" class="form-input" value="' + (mat.x !== undefined ? mat.x : 0) + '"/></div>';
                html += '    <div><label class="form-label">Y Offset</label><input type="number" id="matY" class="form-input" value="' + (mat.y !== undefined ? mat.y : -192) + '"/></div>';
                html += '  </div>';
                html += '  <div style="display:flex; justify-content:flex-end; margin-top:4px;">';
                html += '    <button class="btn-preview-lit ' + (mat.lit ? 'active' : '') + '" id="btnPreviewMatrix">Toggle Matrix Lit</button>';
                html += '  </div>';
            }
            html += '</div>';

            container.innerHTML = html;
            this.bindEvents(container);
        },

        bindEvents: function(container) {
            var chkFb = document.getElementById('chkFeatherBaseEnabled');
            if (chkFb) {
                chkFb.addEventListener('change', function() {
                    if (!SignalState.featherBase) SignalState.featherBase = { enabled: false, x: 0, y: -196, collarWidth: 32, collarHeight: null, autoConnect: true };
                    SignalState.featherBase.enabled = this.checked;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }

            var fbX = document.getElementById('fbX');
            if (fbX) fbX.addEventListener('change', function() { SignalState.featherBase.x = parseFloat(this.value) || 0; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });

            var fbY = document.getElementById('fbY');
            if (fbY) fbY.addEventListener('change', function() { SignalState.featherBase.y = parseFloat(this.value) || 0; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });

            var fbCW = document.getElementById('fbCollarWidth');
            if (fbCW) fbCW.addEventListener('change', function() { SignalState.featherBase.collarWidth = Math.max(10, parseFloat(this.value) || 32); SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });

            var fbCH = document.getElementById('fbCollarHeight');
            if (fbCH) fbCH.addEventListener('change', function() {
                var v = this.value.trim();
                SignalState.featherBase.collarHeight = (v === '' ? null : parseFloat(v));
                SignalEvents.emit('state:changed');
                SignalEvents.emit('state:persist');
            });

            var chkAuto = document.getElementById('chkFbAutoConnect');
            if (chkAuto) chkAuto.addEventListener('change', function() { SignalState.featherBase.autoConnect = this.checked; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });

            var btnAdd = document.getElementById('btnAddFeather');
            if (btnAdd) {
                btnAdd.addEventListener('click', function() {
                    if (!SignalState.feathers) SignalState.feathers = [];
                    if (!SignalState.featherBase) SignalState.featherBase = { enabled: true, x: 0, y: -196, collarWidth: 32, collarHeight: null, autoConnect: true };
                    SignalState.featherBase.enabled = true;
                    var num = SignalState.feathers.length + 1;
                    var pos = (num % 2 === 1) ? 'left1' : 'right1';
                    var id = 'FEATHER_' + (num % 2 === 1 ? 'L' : 'R') + Math.ceil(num / 2);
                    SignalState.feathers.push({ id: id, position: pos, lamps: 5 });
                    SignalState.lampStates[id] = false;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }

            var cards = container.querySelectorAll('.builder-card[data-feather-index]');
            for (var c = 0; c < cards.length; c++) {
                (function(card) {
                    var idx = parseInt(card.getAttribute('data-feather-index'), 10);
                    var fth = SignalState.feathers[idx];
                    if (!fth) return;

                    var props = card.querySelectorAll('.ft-prop');
                    for (var p = 0; p < props.length; p++) {
                        props[p].addEventListener('change', function() {
                            fth[this.getAttribute('data-prop')] = this.value;
                            SignalEvents.emit('state:changed');
                            SignalEvents.emit('state:persist');
                        });
                    }

                    var btnLit = card.querySelector('.btn-preview-lit');
                    if (btnLit) {
                        btnLit.addEventListener('click', function() {
                            var cur = SignalState.getLamp(fth.id);
                            SignalState.setLamp(fth.id, !cur);
                            this.classList.toggle('active', !cur);
                        });
                    }
                })(cards[c]);
            }

            var dels = container.querySelectorAll('.btn-del-feather');
            for (var d = 0; d < dels.length; d++) {
                dels[d].addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    var id = SignalState.feathers[idx] ? SignalState.feathers[idx].id : null;
                    if (id) delete SignalState.lampStates[id];
                    SignalState.feathers.splice(idx, 1);
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }

            var chkMat = document.getElementById('chkMatrixEnabled');
            if (chkMat) {
                chkMat.addEventListener('change', function() {
                    if (!SignalState.matrix) SignalState.matrix = { id: 'ROUTE_BOX', x: 0, y: -192, text: '', lit: false };
                    SignalState.matrix.enabled = this.checked;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }

            var mText = document.getElementById('matText');
            if (mText) {
                mText.addEventListener('input', function() {
                    SignalState.matrix.text = this.value.toUpperCase();
                    SignalEvents.emit('matrix:updated', SignalState.matrix.lit ? SignalState.matrix.text : '');
                    SignalEvents.emit('state:persist');
                });
            }

            var mId = document.getElementById('matId');
            if (mId) mId.addEventListener('change', function() { SignalState.matrix.id = this.value; SignalEvents.emit('state:persist'); });

            var mX = document.getElementById('matX');
            if (mX) mX.addEventListener('change', function() { SignalState.matrix.x = parseFloat(this.value) || 0; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });

            var mY = document.getElementById('matY');
            if (mY) mY.addEventListener('change', function() { SignalState.matrix.y = parseFloat(this.value) || 0; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });

            var btnMatLit = document.getElementById('btnPreviewMatrix');
            if (btnMatLit) {
                btnMatLit.addEventListener('click', function() {
                    SignalState.matrix.lit = !SignalState.matrix.lit;
                    SignalEvents.emit('matrix:updated', SignalState.matrix.lit ? SignalState.matrix.text : '');
                    this.classList.toggle('active', !!SignalState.matrix.lit);
                    SignalEvents.emit('state:persist');
                });
            }
        }
    };

    window.CreatorRoutes = CreatorRoutes;
})(window);