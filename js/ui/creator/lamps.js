(function(window) {
    'use strict';

    var LampColors = ['red', 'yellow', 'green', 'white', 'violet', 'blue'];

    var CreatorLamps = {
        render: function(container) {
            var html = '';
            html += '<div style="display:flex; gap:6px; margin-bottom:10px;">';
            html += '  <button id="btnAddLampStandard" class="tool-btn" style="flex:1;">+ Add Lamp</button>';
            html += '  <button id="btnQuickRed" class="tool-btn" style="color:#ff4d4d;">+ Red</button>';
            html += '  <button id="btnQuickYellow" class="tool-btn" style="color:#ffcc00;">+ Yellow</button>';
            html += '  <button id="btnQuickGreen" class="tool-btn" style="color:#33ff77;">+ Green</button>';
            html += '</div>';

            if (!SignalState.lamps || SignalState.lamps.length === 0) {
                html += '<div style="color:var(--text-secondary); font-size:11px; text-align:center; padding:18px;">No optical lamps configured yet.</div>';
                container.innerHTML = html;
                this.bindAddButtons(container);
                return;
            }

            for (var i = 0; i < SignalState.lamps.length; i++) {
                var l = SignalState.lamps[i];
                var isLit = SignalState.getLamp(l.id);
                var activeLitClass = isLit ? 'active' : '';

                html += '<div class="builder-card" data-lamp-index="' + i + '">';
                html += '  <div class="builder-card-header">';
                html += '    <span class="card-badge"><span style="width:10px; height:10px; border-radius:50%; background:' + l.color + '; display:inline-block;"></span>' + l.id + '</span>';
                html += '    <div class="card-actions">';
                html += '      <button class="btn-preview-lit ' + activeLitClass + '" data-id="' + l.id + '">Preview Lit</button>';
                html += '      <button class="tool-btn btn-dup-lamp" data-index="' + i + '" title="Duplicate Lamp">&#x2398;</button>';
                html += '      <button class="tool-btn btn-del-lamp" data-index="' + i + '" title="Delete Lamp">&times;</button>';
                html += '    </div>';
                html += '  </div>';

                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Lamp ID</label><input type="text" class="form-input lp-prop" data-prop="id" value="' + l.id + '"/></div>';
                html += '    <div><label class="form-label">Color</label><select class="form-select lp-prop" data-prop="color">';
                for (var c = 0; c < LampColors.length; c++) {
                    var sel = (l.color || 'red').toLowerCase() === LampColors[c] ? 'selected' : '';
                    html += '<option value="' + LampColors[c] + '" ' + sel + '>' + LampColors[c].toUpperCase() + '</option>';
                }
                html += '    </select></div>';
                html += '  </div>';

                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">X Offset</label><input type="number" class="form-input lp-prop" data-prop="x" value="' + (l.x !== undefined ? l.x : 0) + '"/></div>';
                html += '    <div><label class="form-label">Y Offset</label><input type="number" class="form-input lp-prop" data-prop="y" value="' + (l.y !== undefined ? l.y : 0) + '"/></div>';
                html += '  </div>';

                html += '  <div class="form-row-2">';
                html += '    <div><label class="form-label">Diameter (px)</label><input type="number" min="10" max="60" class="form-input lp-prop" data-prop="diameter" value="' + (l.diameter || 34) + '"/></div>';
                html += '    <div><label class="form-label">Hood Visor</label><select class="form-select lp-prop" data-prop="hood">';
                html += '      <option value="round" ' + ((l.hood || 'round') === 'round' ? 'selected' : '') + '>Round Cowl</option>';
                html += '      <option value="none" ' + (l.hood === 'none' ? 'selected' : '') + '>No Hood</option>';
                html += '    </select></div>';
                html += '  </div>';

                html += '  <div><label class="form-label">Brightness Factor (' + Math.round((l.brightness || 1.0) * 100) + '%)</label><input type="range" min="0.2" max="1.0" step="0.05" class="form-input lp-prop" data-prop="brightness" value="' + (l.brightness !== undefined ? l.brightness : 1.0) + '"/></div>';
                html += '</div>';
            }

            container.innerHTML = html;
            this.bindAddButtons(container);
            this.bindCardEvents(container);
        },

        bindAddButtons: function(container) {
            var createLamp = function(color) {
                var count = SignalState.lamps.length + 1;
                var id = color.toUpperCase() + (count > 1 ? count : '');
                var lastY = -120;
                if (SignalState.lamps.length > 0) {
                    var last = SignalState.lamps[SignalState.lamps.length - 1];
                    lastY = (last.y || 0) + 48;
                }
                SignalState.lamps.push({
                    id: id, color: color, diameter: 34, x: 0, y: lastY, hood: 'round', brightness: 1.0
                });
                SignalState.lampStates[id] = false;
                SignalEvents.emit('state:changed');
                SignalEvents.emit('state:persist');
            };

            document.getElementById('btnAddLampStandard').addEventListener('click', function() { createLamp('red'); });
            document.getElementById('btnQuickRed').addEventListener('click', function() { createLamp('red'); });
            document.getElementById('btnQuickYellow').addEventListener('click', function() { createLamp('yellow'); });
            document.getElementById('btnQuickGreen').addEventListener('click', function() { createLamp('green'); });
        },

        bindCardEvents: function(container) {
            var cards = container.querySelectorAll('.builder-card');
            for (var c = 0; c < cards.length; c++) {
                (function(card) {
                    var lIdx = parseInt(card.getAttribute('data-lamp-index'), 10);
                    var lamp = SignalState.lamps[lIdx];
                    if (!lamp) return;

                    var props = card.querySelectorAll('.lp-prop');
                    for (var p = 0; p < props.length; p++) {
                        props[p].addEventListener('change', function() {
                            var pr = this.getAttribute('data-prop');
                            var val = (this.type === 'number' || this.type === 'range') ? parseFloat(this.value) : this.value;
                            lamp[pr] = val;
                            SignalEvents.emit('state:changed');
                            SignalEvents.emit('state:persist');
                        });
                    }

                    var btnLit = card.querySelector('.btn-preview-lit');
                    if (btnLit) {
                        btnLit.addEventListener('click', function() {
                            var id = this.getAttribute('data-id');
                            var cur = SignalState.getLamp(id);
                            SignalState.setLamp(id, !cur);
                            this.classList.toggle('active', !cur);
                        });
                    }
                })(cards[c]);
            }

            var delBtns = container.querySelectorAll('.btn-del-lamp');
            for (var d = 0; d < delBtns.length; d++) {
                delBtns[d].addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    var id = SignalState.lamps[idx] ? SignalState.lamps[idx].id : null;
                    if (id) delete SignalState.lampStates[id];
                    SignalState.lamps.splice(idx, 1);
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }

            var dupBtns = container.querySelectorAll('.btn-dup-lamp');
            for (var u = 0; u < dupBtns.length; u++) {
                dupBtns[u].addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    var src = SignalState.lamps[idx];
                    if (!src) return;
                    var copy = JSON.parse(JSON.stringify(src));
                    copy.id = src.id + '_COPY';
                    copy.y = (src.y || 0) + (src.diameter || 34) + 12;
                    SignalState.lamps.splice(idx + 1, 0, copy);
                    SignalState.lampStates[copy.id] = false;
                    SignalEvents.emit('state:changed');
                    SignalEvents.emit('state:persist');
                });
            }
        }
    };

    window.CreatorLamps = CreatorLamps;
    window.InspectorLamps = CreatorLamps;
})(window);