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

            var topY = window.FeatherRenderer ? window.FeatherRenderer.detectShapeTopSurface(0, -100) : -160;

            for (var i = 0; i < SignalState.lamps.length; i++) {
                var l = SignalState.lamps[i];
                var isLit = SignalState.getLamp(l.id);
                var activeLitClass = isLit ? 'active' : '';
                var userY = Math.round(topY - (l.y !== undefined ? l.y : topY));

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
                html += '    <div><label class="form-label">X Pos (0 = Center)</label><input type="number" class="form-input lp-prop" data-prop="x" value="' + (l.x !== undefined ? l.x : 0) + '"/></div>';
                html += '    <div><label class="form-label">Y Pos (0 = Top, -ve Down)</label><input type="number" class="form-input lp-y-user" data-lamp-index="' + i + '" value="' + userY + '"/></div>';
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
                if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
            };

            document.getElementById('btnAddLampStandard').addEventListener('click', function() { createLamp('red'); });
            document.getElementById('btnQuickRed').addEventListener('click', function() { createLamp('red'); });
            document.getElementById('btnQuickYellow').addEventListener('click', function() { createLamp('yellow'); });
            document.getElementById('btnQuickGreen').addEventListener('click', function() { createLamp('green'); });
        },

        bindCardEvents: function(container) {
            var cards = container.querySelectorAll('.builder-card');
            var topY = window.FeatherRenderer ? window.FeatherRenderer.detectShapeTopSurface(0, -100) : -160;

            for (var c = 0; c < cards.length; c++) {
                (function(card) {
                    var lIdx = parseInt(card.getAttribute('data-lamp-index'), 10);
                    var lamp = SignalState.lamps[lIdx];
                    if (!lamp) return;

                    var props = card.querySelectorAll('.lp-prop');
                    for (var p = 0; p < props.length; p++) {
                        (function(inp) {
                            var updateVal = function() {
                                var pr = inp.getAttribute('data-prop');
                                var raw = inp.value.trim();
                                if (inp.type === 'number' || inp.type === 'range') {
                                    if (raw === '' || raw === '-') return;
                                    var num = parseFloat(raw);
                                    if (!isNaN(num)) lamp[pr] = num;
                                } else {
                                    lamp[pr] = inp.value;
                                }
                                SignalEvents.emit('state:changed');
                                SignalEvents.emit('state:persist');
                            };
                            inp.addEventListener('input', updateVal);
                            inp.addEventListener('change', updateVal);
                        })(props[p]);
                    }

                    var yUserInp = card.querySelector('.lp-y-user');
                    if (yUserInp) {
                        var updateY = function() {
                            var raw = yUserInp.value.trim();
                            if (raw === '' || raw === '-') return;
                            var uVal = parseFloat(raw);
                            if (!isNaN(uVal)) {
                                lamp.y = topY - uVal;
                                SignalEvents.emit('state:changed');
                                SignalEvents.emit('state:persist');
                            }
                        };
                        yUserInp.addEventListener('input', updateY);
                        yUserInp.addEventListener('change', updateY);
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
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
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
                    if (window.CreatorUI) window.CreatorUI.renderCurrentTab();
                });
            }
        }
    };

    window.CreatorLamps = CreatorLamps;
})(window);