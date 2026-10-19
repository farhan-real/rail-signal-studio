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
            html += '  <div class="form-row-2" style="margin-top:6px;">';
            html += '    <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="chkMastPlatform" ' + (mast.platform ? 'checked' : '') + '/><span>Service Platform</span></label>';
            html += '    <label style="display:flex; align-items:center; gap:6px; font-size:11px; cursor:pointer;"><input type="checkbox" id="chkMastLadder" ' + (mast.ladder ? 'checked' : '') + '/><span>Access Ladder</span></label>';
            html += '  </div>';
            html += '</div>';

            container.innerHTML = html;

            document.getElementById('mastTypeSel').addEventListener('change', function() { SignalState.mast.type = this.value; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            document.getElementById('mastHeightInp').addEventListener('change', function() { SignalState.mast.height = parseFloat(this.value) || 300; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            document.getElementById('mastXInp').addEventListener('change', function() { SignalState.mast.x = parseFloat(this.value) || 0; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            document.getElementById('mastYInp').addEventListener('change', function() { SignalState.mast.y = parseFloat(this.value) || 0; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            document.getElementById('chkMastPlatform').addEventListener('change', function() { SignalState.mast.platform = this.checked; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
            document.getElementById('chkMastLadder').addEventListener('change', function() { SignalState.mast.ladder = this.checked; SignalEvents.emit('state:changed'); SignalEvents.emit('state:persist'); });
        }
    };

    window.CreatorStructure = CreatorStructure;
})(window);