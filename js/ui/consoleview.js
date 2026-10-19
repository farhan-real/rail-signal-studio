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
                SignalState.controls.push({
                    id: id, type: 'lever', label: id, color: '#d92525', positions: 3, defaultValue: 0,
                    x: 20 + (SignalState.controls.length * 85), y: 15
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddKnob').addEventListener('click', function() {
                var id = 'Knob' + (SignalState.controls.length + 1);
                SignalState.controls.push({
                    id: id, type: 'knob', label: id, states: ['0', '1', '2'], defaultValue: 0,
                    x: 20 + (SignalState.controls.length * 85), y: 15
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddButton').addEventListener('click', function() {
                var id = 'Btn' + (SignalState.controls.length + 1);
                SignalState.controls.push({
                    id: id, type: 'button', label: id, color: '#2e68f8', isToggle: false, defaultValue: 0,
                    x: 20 + (SignalState.controls.length * 85), y: 15
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddSwitch').addEventListener('click', function() {
                var id = 'Switch' + (SignalState.controls.length + 1);
                SignalState.controls.push({
                    id: id, type: 'switch', label: id, defaultValue: 0,
                    x: 20 + (SignalState.controls.length * 85), y: 15
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddLed').addEventListener('click', function() {
                var id = 'LED' + (SignalState.controls.length + 1);
                SignalState.controls.push({
                    id: id, type: 'led', label: id, colorKey: 'red',
                    x: 20 + (SignalState.controls.length * 85), y: 15
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
            var isDragging = false;
            var startY = 0;
            var startH = 0;
            var lastExpandedHeight = 210;

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
                html += '<button class="btn-remove-control" data-del-ctrl="' + ctrl.id + '">&times;</button>';
                html += '</div>';
            }

            for (var t = 0; t < SignalState.texts.length; t++) {
                var txt = SignalState.texts[t];
                var tStyle = 'left:' + (txt.x || 20) + 'px; top:' + (txt.y || 140) + 'px;';
                html += '<div class="console-item text-item draggable-wrapper" style="' + tStyle + '" data-text-id="' + txt.id + '">';
                html += '<input type="text" class="text-content" value="' + txt.text + '" data-input-text="' + txt.id + '"/>';
                html += '<button class="btn-remove-control" data-del-text="' + txt.id + '">&times;</button>';
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

                    var isDragging = false, startX = 0, startY = 0, initLeft = 0, initTop = 0;
                    var curDeltaX = 0, curDeltaY = 0;

                    var onPointerDown = function(e) {
                        if (e.target.tagName === 'INPUT' || e.target.classList.contains('btn-remove-control')) return;
                        isDragging = true;
                        wrap.classList.add('dragging');
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
                        if (!isDragging) return;
                        curDeltaX = e.clientX - startX;
                        curDeltaY = e.clientY - startY;
                        wrap.style.transform = 'translate3d(' + curDeltaX + 'px, ' + curDeltaY + 'px, 0)';
                    };

                    var onPointerUp = function() {
                        if (!isDragging) return;
                        isDragging = false;
                        wrap.classList.remove('dragging');
                        window.removeEventListener('pointermove', onPointerMove);
                        window.removeEventListener('pointerup', onPointerUp);
                        wrap.style.transform = '';
                        var fX = Math.max(0, initLeft + curDeltaX);
                        var fY = Math.max(0, initTop + curDeltaY);
                        wrap.style.left = fX + 'px';
                        wrap.style.top = fY + 'px';
                        if (isCtrl) SignalState.updateControlPos(targetId, fX, fY);
                        else SignalState.updateTextPos(targetId, fX, fY);
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
                    var vEl = el.querySelector('.lever-val, .knob-state, .switch-state');
                    if (vEl) {
                        if (c.type === 'lever') {
                            vEl.textContent = 'POS ' + curVal;
                            var handle = el.querySelector('.lever-handle');
                            if (handle) {
                                var numPos = c.positions || 2;
                                var step = 50 / Math.max(1, numPos - 1);
                                var angle = -25 + curVal * step;
                                handle.style.transform = 'rotate(' + angle.toFixed(1) + 'deg)';
                            }
                        } else if (c.type === 'knob') {
                            var states = KnobControl.getStates(c);
                            vEl.textContent = states[curVal] !== undefined ? states[curVal] : curVal;
                            var indicator = el.querySelector('.knob-indicator-dot');
                            if (indicator) {
                                var stepAngle = 270 / Math.max(1, states.length - 1);
                                var kAngle = -135 + curVal * stepAngle;
                                indicator.style.transform = 'rotate(' + kAngle + 'deg)';
                            }
                        } else if (c.type === 'switch') {
                            vEl.textContent = curVal === 1 ? 'ON' : 'OFF';
                        }
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