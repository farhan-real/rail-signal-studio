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
            html += '    <span class="card-badge">Service Platform / Footplate (Circled on Mast)</span>';
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

            container.innerHTML = html;

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
                pxInp.addEventListener('input', onPx);
                pxInp.addEventListener('change', onPx);
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
                gapInp.addEventListener('input', onGap);
                gapInp.addEventListener('change', onGap);
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
                pwInp.addEventListener('input', onPw);
                pwInp.addEventListener('change', onPw);
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
                phInp.addEventListener('input', onPh);
                phInp.addEventListener('change', onPh);
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
        }
    };

    window.CreatorStructure = CreatorStructure;
})(window);