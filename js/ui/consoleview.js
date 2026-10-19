(function(window) {
    'use strict';

    var ConsoleUI = {
        desk: null,

        init: function() {
            this.desk = document.getElementById('consoleDesk');
            this.bindButtons();
            this.bindResizer();

            SignalEvents.on('state:loaded', this.render.bind(this));
            SignalEvents.on('control:changed', this.updateControlStates.bind(this));
            SignalEvents.on('lamp:updated', this.updateLeds.bind(this));
            SignalEvents.on('lamp:blink', this.updateLedBlink.bind(this));
            SignalEvents.on('state:changed', this.render.bind(this));
        },

        bindButtons: function() {
            var self = this;
            document.getElementById('btnAddLever').addEventListener('click', function() {
                var id = 'Lever' + (SignalState.controls.length + 1);
                var snapCol = (SignalState.controls.length % 8) * 100 + 20;
                var snapRow = Math.floor(SignalState.controls.length / 8) * 130 + 20;
                SignalState.controls.push({
                    id: id, type: 'lever', label: id, color: '#d92525', positions: 3, defaultValue: 0,
                    x: snapCol, y: snapRow
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddKnob').addEventListener('click', function() {
                var id = 'Knob' + (SignalState.controls.length + 1);
                var snapCol = (SignalState.controls.length % 8) * 110 + 20;
                var snapRow = Math.floor(SignalState.controls.length / 8) * 130 + 20;
                SignalState.controls.push({
                    id: id, type: 'knob', label: id, states: ['0', '1', '2'], defaultValue: 0,
                    x: snapCol, y: snapRow
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddButton').addEventListener('click', function() {
                var id = 'Btn' + (SignalState.controls.length + 1);
                var snapCol = (SignalState.controls.length % 8) * 90 + 20;
                var snapRow = Math.floor(SignalState.controls.length / 8) * 130 + 20;
                SignalState.controls.push({
                    id: id, type: 'button', label: id, color: '#2e68f8', isToggle: false, defaultValue: 0,
                    x: snapCol, y: snapRow
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddSwitch').addEventListener('click', function() {
                var id = 'Switch' + (SignalState.controls.length + 1);
                var snapCol = (SignalState.controls.length % 8) * 90 + 20;
                var snapRow = Math.floor(SignalState.controls.length / 8) * 130 + 20;
                SignalState.controls.push({
                    id: id, type: 'switch', label: id, defaultValue: 0,
                    x: snapCol, y: snapRow
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddLed').addEventListener('click', function() {
                var id = 'LED' + (SignalState.controls.length + 1);
                var snapCol = (SignalState.controls.length % 8) * 80 + 20;
                var snapRow = Math.floor(SignalState.controls.length / 8) * 130 + 20;
                SignalState.controls.push({
                    id: id, type: 'led', label: id, colorKey: 'red',
                    x: snapCol, y: snapRow
                });
                SignalState.setLamp(id, false);
                self.render();
            });

            document.getElementById('btnAddText').addEventListener('click', function() {
                var id = 'text_' + Date.now();
                SignalState.texts.push({
                    id: id, text: 'Track Marker', x: 20 + (SignalState.texts.length * 100), y: 140
                });
                self.render();
            });
        },

        bindResizer: function() {
            var container = document.getElementById('controlConsole');
            var handle = document.getElementById('consoleResizeHandle');
            var toggleBtn = document.getElementById('btnToggleCollapseConsole');
            var isDragging = false, startY = 0, startH = 0, lastExpandedHeight = 210;

            var doToggle = function() {
                var isCollapsed = container.classList.contains('is-collapsed');
                if (isCollapsed) {
                    container.classList.remove('is-collapsed');
                    container.style.height = lastExpandedHeight + 'px';
                } else {
                    lastExpandedHeight = Math.max(100, container.getBoundingClientRect().height);
                    container.classList.add('is-collapsed');
                }
            };

            if (toggleBtn) toggleBtn.addEventListener('click', doToggle);
            if (handle) {
                handle.addEventListener('dblclick', doToggle);
                handle.addEventListener('pointerdown', function(e) {
                    if (e.pointerType === 'touch' && !e.isPrimary) return;
                    isDragging = true;
                    startY = e.clientY;
                    startH = container.getBoundingClientRect().height;
                    container.classList.add('is-resizing');
                    try { handle.setPointerCapture(e.pointerId); } catch (err) {}
                });

                handle.addEventListener('pointermove', function(e) {
                    if (!isDragging) return;
                    var deltaY = startY - e.clientY;
                    var maxH = Math.max(200, window.innerHeight * 0.75);
                    var newH = Math.max(80, Math.min(maxH, startH + deltaY));
                    container.classList.remove('is-collapsed');
                    container.style.height = newH + 'px';
                    lastExpandedHeight = newH;
                });

                var endDrag = function(e) {
                    if (!isDragging) return;
                    isDragging = false;
                    container.classList.remove('is-resizing');
                    try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
                };

                handle.addEventListener('pointerup', endDrag);
                handle.addEventListener('pointercancel', endDrag);
            }
        },

        render: function() {
            var html = '';
            for (var i = 0; i < SignalState.controls.length; i++) {
                var ctrl = SignalState.controls[i];
                var body = '';
                if (ctrl.type === 'lever') body = LeverControl.render(ctrl);
                else if (ctrl.type === 'knob') body = KnobControl.render(ctrl);
                else if (ctrl.type === 'button') body = ButtonControl.renderButton(ctrl);
                else if (ctrl.type === 'switch') body = ButtonControl.renderSwitch(ctrl);
                else if (ctrl.type === 'led') body = LedControl.render(ctrl);

                var posStyle = 'left:' + (ctrl.x || 20) + 'px; top:' + (ctrl.y || 15) + 'px;';
                html += '<div class="draggable-wrapper" style="' + posStyle + '" data-id="' + ctrl.id + '">';
                html += body;
                html += '<button class="btn-remove-control" data-del-ctrl="' + ctrl.id + '" title="Remove control">&times;</button>';
                html += '</div>';
            }

            for (var t = 0; t < SignalState.texts.length; t++) {
                var txt = SignalState.texts[t];
                var tStyle = 'left:' + (txt.x || 20) + 'px; top:' + (txt.y || 140) + 'px;';
                html += '<div class="draggable-wrapper" style="' + tStyle + '" data-text-id="' + txt.id + '">';
                html += '<div class="console-item text-item">';
                html += '  <input type="text" class="text-content" value="' + txt.text + '" data-input-text="' + txt.id + '"/>';
                html += '</div>';
                html += '<button class="btn-remove-control" data-del-text="' + txt.id + '" title="Remove text">&times;</button>';
                html += '</div>';
            }

            this.desk.innerHTML = html;
            LeverControl.bindEvents(this.desk);
            KnobControl.bindEvents(this.desk);
            ButtonControl.bindEvents(this.desk);
            LedControl.bindEvents(this.desk);
            this.setupDraggables();
        },

        setupDraggables: function() {
            var wrappers = this.desk.querySelectorAll('.draggable-wrapper');
            var self = this;
            for (var i = 0; i < wrappers.length; i++) {
                (function(wrap) {
                    var isCtrl = wrap.hasAttribute('data-id');
                    var targetId = isCtrl ? wrap.getAttribute('data-id') : wrap.getAttribute('data-text-id');

                    var delBtn = wrap.querySelector('.btn-remove-control');
                    if (delBtn) {
                        delBtn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            if (isCtrl) SignalState.removeControl(targetId);
                            else SignalState.removeText(targetId);
                        });
                    }

                    var textInput = wrap.querySelector('[data-input-text]');
                    if (textInput) {
                        textInput.addEventListener('change', function() {
                            SignalState.updateTextContent(targetId, this.value);
                        });
                    }

                    var labelEl = wrap.querySelector('[data-edit-label]');
                    if (labelEl && isCtrl) {
                        labelEl.addEventListener('dblclick', function(e) {
                            e.stopPropagation();
                            var ctrl = SignalState.controls.filter(function(c) { return c.id === targetId; })[0];
                            if (!ctrl) return;
                            var newLabel = prompt('Rename control:', ctrl.label || ctrl.id);
                            if (newLabel !== null && newLabel.trim()) {
                                ctrl.label = newLabel.trim();
                                SignalEvents.emit('state:persist');
                                self.render();
                            }
                        });
                    }

                    var isPointerDown = false, isDragging = false, startX = 0, startY = 0, initLeft = 0, initTop = 0;
                    var curDeltaX = 0, curDeltaY = 0;

                    var onPointerDown = function(e) {
                        if (e.target.tagName === 'INPUT' || e.target.classList.contains('btn-remove-control')) return;
                        isPointerDown = true;
                        isDragging = false;
                        startX = e.clientX;
                        startY = e.clientY;
                        initLeft = parseInt(wrap.style.left, 10) || 0;
                        initTop = parseInt(wrap.style.top, 10) || 0;
                        curDeltaX = 0;
                        curDeltaY = 0;
                        window.addEventListener('pointermove', onPointerMove);
                        window.addEventListener('pointerup', onPointerUp);
                    };

                    var onPointerMove = function(e) {
                        if (!isPointerDown) return;
                        var dx = e.clientX - startX;
                        var dy = e.clientY - startY;
                        if (!isDragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
                            isDragging = true;
                            wrap.classList.add('dragging');
                        }
                        if (isDragging) {
                            curDeltaX = dx;
                            curDeltaY = dy;
                            wrap.style.transform = 'translate3d(' + curDeltaX + 'px, ' + curDeltaY + 'px, 0)';
                        }
                    };

                    var onPointerUp = function() {
                        if (!isPointerDown) return;
                        isPointerDown = false;
                        window.removeEventListener('pointermove', onPointerMove);
                        window.removeEventListener('pointerup', onPointerUp);
                        if (isDragging) {
                            isDragging = false;
                            wrap.classList.remove('dragging');
                            wrap.style.transform = '';
                            var snap = 10;
                            var fX = Math.max(10, Math.round((initLeft + curDeltaX) / snap) * snap);
                            var fY = Math.max(10, Math.round((initTop + curDeltaY) / snap) * snap);
                            wrap.style.left = fX + 'px';
                            wrap.style.top = fY + 'px';
                            if (isCtrl) SignalState.updateControlPos(targetId, fX, fY);
                            else SignalState.updateTextPos(targetId, fX, fY);
                        }
                    };

                    wrap.addEventListener('pointerdown', onPointerDown);
                })(wrappers[i]);
            }
        },

        updateControlStates: function() {
            var curControls = SignalState.controls;
            for (var i = 0; i < curControls.length; i++) {
                var c = curControls[i];
                var el = this.desk.querySelector('[data-id="' + c.id + '"]');
                if (el) {
                    var curVal = SignalState.getControlValue(c.id);
                    if (c.type === 'lever') {
                        var vEl = el.querySelector('.lever-val');
                        if (vEl) vEl.textContent = 'POS ' + curVal;
                        var handle = el.querySelector('.lever-handle');
                        if (handle) {
                            var numPos = Math.max(2, c.positions || 2);
                            var step = 44 / (numPos - 1);
                            var angle = -22 + curVal * step;
                            handle.style.transform = 'rotate(' + angle.toFixed(1) + 'deg)';
                        }
                        var notches = el.querySelectorAll('.lever-notch');
                        for (var n = 0; n < notches.length; n++) {
                            notches[n].classList.toggle('active', n === curVal);
                        }
                    } else if (c.type === 'knob') {
                        var states = KnobControl.getStates(c);
                        var knobBody = el.querySelector('.knob-body');
                        if (knobBody) {
                            var numStates = Math.max(1, states.length);
                            var stepAngle = numStates > 1 ? 270 / (numStates - 1) : 0;
                            var kAngle = -135 + curVal * stepAngle;
                            knobBody.style.transform = 'rotate(' + kAngle.toFixed(1) + 'deg)';
                        }
                        var dialLabels = el.querySelectorAll('.knob-dial-label');
                        for (var d = 0; d < dialLabels.length; d++) {
                            dialLabels[d].classList.toggle('active', d === curVal);
                        }
                    } else if (c.type === 'button') {
                        var btnEl = el.querySelector('.button-item');
                        if (btnEl) btnEl.classList.toggle('button-pressed', curVal === 1);
                        var btnState = el.querySelector('.button-state');
                        if (btnState && c.isToggle) btnState.textContent = curVal === 1 ? 'ON' : 'OFF';
                    } else if (c.type === 'switch') {
                        var swEl = el.querySelector('.switch-item');
                        if (swEl) {
                            swEl.classList.toggle('switch-on', curVal === 1);
                            swEl.classList.toggle('switch-off', curVal !== 1);
                        }
                        var swState = el.querySelector('.switch-state');
                        if (swState) swState.textContent = curVal === 1 ? 'ON' : 'OFF';
                    }
                }
            }
        },

        updateLeds: function(payload) {
            var el = this.desk.querySelector('[data-control-id="' + payload.id + '"] .led-lens');
            if (el) {
                el.classList.toggle('is-lit', !!payload.lit);
                el.classList.toggle('is-off', !payload.lit);
            }
        },

        updateLedBlink: function(payload) {
            var el = this.desk.querySelector('[data-control-id="' + payload.id + '"] .led-lens');
            if (el) {
                el.classList.toggle('is-lit', !!payload.visible);
                el.classList.toggle('is-off', !payload.visible);
            }
        }
    };

    window.ConsoleUI = ConsoleUI;
})(window);