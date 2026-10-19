(function(window) {
    'use strict';

    var CreatorStructure = {
        render: function(container) {
            var mast = SignalState.mast || { type: 'tubular', height: 380, x: 0, y: 0, platform: true, ladder: true };
            var html = '';

            html += '<div class="builder-card">';
            html += '  <div class="builder-card-header"><span class="card-badge">Mounting Mast Structure</span></div>';
            html += '  <div class="form-row-2">';
            html += '    <div><label class="form-label">Type</label><select id="mastTypeSel" class="form-select">';
            ['tubular', 'lattice', 'gantry', 'dwarf'].forEach(function(t) {
                html += '<option value="' + t + '" ' + (mast.type === t ? 'selected' : '') + '>' + t.toUpperCase() + '</option>';
            });
            html += '    </select></div>';
            html += '    <div><label class="form-label">Height (px)</label><input type="number" id="mastHeightInp" class="form-input" value="' + (mast.height || 380) + '"/></div>';
            html += '  </div>';
            html += '  <div class="form-row-2">';
            html += '    <div><label class="form-label">X Offset</label><input type="number" id="mastXInp" class="form-input" value="' + (mast.x || 0) + '"/></div>';
            html += '    <div><label class="form-label">Y Offset</label><input type="number" id="mastYInp" class="form-input" value="' + (mast.y || 0) + '"/></div>';
            html += '  </div>';
            html += '  <div style="margin-top:6px;">';
            html += '    <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="chkMastLadder" ' + (mast.ladder ? 'checked' : '') + '/><span>Access Ladder with safety cage</span></label>';
            html += '  </div>';
            html += '</div>';

            html += '<div class="builder-card">';
            html += '  <div class="builder-card-header">';
            html += '    <span class="card-badge">Service Platform / Footplate (Below Head)</span>';
            html += '    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chkMastPlatform" ' + (mast.platform ? 'checked' : '') + '/><span style="font-size:11px; font-weight:700;">Show Platform</span></label>';
            html += '  </div>';

            if (mast.platform) {
                var headBottom = window.MastRenderer ? window.MastRenderer.getHeadBottomY() : 45;
                var currentGap = (mast.platformY !== undefined && mast.platformY !== null) ? Math.round(mast.platformY - headBottom) : 4;

                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">X Pos (0 = Center)</label><input type="number" id="platformXInp" class="form-input" placeholder="0 (Centered)" value="' + (mast.platformX !== null && mast.platformX !== undefined ? mast.platformX : '') + '"/></div>';
                html += '    <div><label class="form-label">Gap Below Head (px)</label><input type="number" id="platformGapInp" class="form-input" value="' + currentGap + '"/></div>';
                html += '  </div>';
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Width (px)</label><input type="number" id="platformWidthInp" class="form-input" value="' + (mast.platformWidth || 52) + '"/></div>';
                html += '    <div><label class="form-label">Height (px)</label><input type="number" id="platformHeightInp" class="form-input" value="' + (mast.platformHeight || 6) + '"/></div>';
                html += '  </div>';
                html += '  <div class="form-row-2" style="margin-top:6px;">';
                html += '    <button id="btnCenterPlatformX" class="tool-btn" style="font-size:10px;">Center X</button>';
                html += '    <button id="btnSnapPlatform" class="tool-btn" style="font-size:10px;">Snap Directly Below Head</button>';
                html += '  </div>';
            }
            html += '</div>';

            var showFoot = mast.showFoot !== false;
            var footW = mast.footWidth || (mast.type === 'tubular' ? 64 : 110);
            var footH = mast.footHeight || 14;
            var footYOff = mast.footYOffset || 0;
            var footStyle = mast.footType || 'plate';

            html += '<div class="builder-card">';
            html += '  <div class="builder-card-header">';
            html += '    <span class="card-badge">Mast Footing / Foundation Base</span>';
            html += '    <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="chkShowFoot" ' + (showFoot ? 'checked' : '') + '/><span style="font-size:11px; font-weight:700;">Show Foot</span></label>';
            html += '  </div>';

            if (showFoot) {
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Footing Style</label><select id="footTypeSel" class="form-select">';
                html += '      <option value="plate"' + (footStyle === 'plate' ? ' selected' : '') + '>Steel Base Plate (Bolted)</option>';
                html += '      <option value="concrete"' + (footStyle === 'concrete' ? ' selected' : '') + '>Concrete Foundation Pad</option>';
                html += '      <option value="clamp"' + (footStyle === 'clamp' ? ' selected' : '') + '>Heavy Ground Clamp</option>';
                html += '    </select></div>';
                html += '    <div><label class="form-label">Y Offset (0 = Flush at Pole End)</label><input type="number" id="footYOffInp" class="form-input" value="' + footYOff + '"/></div>';
                html += '  </div>';
                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Width (px)</label><input type="number" id="footWidthInp" class="form-input" value="' + footW + '"/></div>';
                html += '    <div><label class="form-label">Height (px)</label><input type="number" id="footHeightInp" class="form-input" value="' + footH + '"/></div>';
                html += '  </div>';
                html += '  <div style="margin-top:6px;">';
                html += '    <button id="btnFlushFoot" class="tool-btn" style="width:100%; font-size:10px;">Align Flush with Pole End</button>';
                html += '  </div>';
            }
            html += '</div>';

            container.innerHTML = html;
            this.bindEvents(container);
        },

        bindEvents: function(container) {
            document.getElementById('mastTypeSel').addEventListener('change', function() { SignalState.mast.type = this.value; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            document.getElementById('mastHeightInp').addEventListener('input', function() { var r = this.value.trim(); if (r && r !== '-') { SignalState.mast.height = parseFloat(r) || 300; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); } });
            document.getElementById('mastXInp').addEventListener('input', function() { var r = this.value.trim(); if (r && r !== '-') { SignalState.mast.x = parseFloat(r) || 0; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); } });
            document.getElementById('mastYInp').addEventListener('input', function() { var r = this.value.trim(); if (r && r !== '-') { SignalState.mast.y = parseFloat(r) || 0; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); } });
            document.getElementById('chkMastLadder').addEventListener('change', function() { SignalState.mast.ladder = this.checked; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });

            var chkPlat = document.getElementById('chkMastPlatform');
            if (chkPlat) {
                chkPlat.addEventListener('change', function() {
                    SignalState.mast.platform = this.checked;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }

            var pxInp = document.getElementById('platformXInp');
            if (pxInp) {
                var onPx = function() {
                    var v = pxInp.value.trim();
                    SignalState.mast.platformX = (v === '' || v === '-' ? null : parseFloat(v));
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                };
                pxInp.addEventListener('input', onPx); pxInp.addEventListener('change', onPx);
            }

            var gapInp = document.getElementById('platformGapInp');
            if (gapInp) {
                var onGap = function() {
                    var v = gapInp.value.trim();
                    if (v === '' || v === '-') return;
                    var gap = parseFloat(v) || 0;
                    var bottom = window.MastRenderer ? window.MastRenderer.getHeadBottomY() : 45;
                    SignalState.mast.platformY = Math.round(bottom + gap);
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                };
                gapInp.addEventListener('input', onGap); gapInp.addEventListener('change', onGap);
            }

            var pwInp = document.getElementById('platformWidthInp');
            if (pwInp) {
                var onPw = function() {
                    var v = pwInp.value.trim();
                    if (v === '' || v === '-') return;
                    SignalState.mast.platformWidth = Math.max(10, parseFloat(v) || 52);
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                };
                pwInp.addEventListener('input', onPw); pwInp.addEventListener('change', onPw);
            }

            var phInp = document.getElementById('platformHeightInp');
            if (phInp) {
                var onPh = function() {
                    var v = phInp.value.trim();
                    if (v === '' || v === '-') return;
                    SignalState.mast.platformHeight = Math.max(2, parseFloat(v) || 6);
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                };
                phInp.addEventListener('input', onPh); phInp.addEventListener('change', onPh);
            }

            var btnCenter = document.getElementById('btnCenterPlatformX');
            if (btnCenter) {
                btnCenter.addEventListener('click', function() {
                    SignalState.mast.platformX = null;
                    if (pxInp) pxInp.value = '';
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }

            var btnSnap = document.getElementById('btnSnapPlatform');
            if (btnSnap) {
                btnSnap.addEventListener('click', function() {
                    var bottom = window.MastRenderer ? window.MastRenderer.getHeadBottomY() : 45;
                    SignalState.mast.platformY = Math.round(bottom + 4);
                    if (gapInp) gapInp.value = 4;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }

            var chkFoot = document.getElementById('chkShowFoot');
            if (chkFoot) {
                chkFoot.addEventListener('change', function() {
                    SignalState.mast.showFoot = this.checked;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }

            var footTypeSel = document.getElementById('footTypeSel');
            if (footTypeSel) {
                footTypeSel.addEventListener('change', function() {
                    SignalState.mast.footType = this.value;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }

            var footYOffInp = document.getElementById('footYOffInp');
            if (footYOffInp) {
                var onFootY = function() {
                    var v = footYOffInp.value.trim();
                    if (v === '' || v === '-') return;
                    SignalState.mast.footYOffset = parseFloat(v) || 0;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                };
                footYOffInp.addEventListener('input', onFootY); footYOffInp.addEventListener('change', onFootY);
            }

            var footWInp = document.getElementById('footWidthInp');
            if (footWInp) {
                var onFootW = function() {
                    var v = footWInp.value.trim();
                    if (v === '' || v === '-') return;
                    SignalState.mast.footWidth = Math.max(10, parseFloat(v) || 64);
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                };
                footWInp.addEventListener('input', onFootW); footWInp.addEventListener('change', onFootW);
            }

            var footHInp = document.getElementById('footHeightInp');
            if (footHInp) {
                var onFootH = function() {
                    var v = footHInp.value.trim();
                    if (v === '' || v === '-') return;
                    SignalState.mast.footHeight = Math.max(2, parseFloat(v) || 14);
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                };
                footHInp.addEventListener('input', onFootH); footHInp.addEventListener('change', onFootH);
            }

            var btnFlush = document.getElementById('btnFlushFoot');
            if (btnFlush) {
                btnFlush.addEventListener('click', function() {
                    SignalState.mast.footYOffset = 0;
                    if (footYOffInp) footYOffInp.value = 0;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }
        }
    };

    window.CreatorStructure = CreatorStructure;
})(window);