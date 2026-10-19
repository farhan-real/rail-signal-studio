(function(window) {
    'use strict';

    var GRID = 20;

    var ConsoleUI = {
        desk: null,

        init: function() {
            this.desk = document.getElementById('consoleDesk');
            this.bindButtons();
            this.bindResizer();
            if (window.ConsoleMenu) ConsoleMenu.init();

            SignalEvents.on('state:loaded', this.render.bind(this));
            SignalEvents.on('control:changed', this.updateControlStates.bind(this));
            SignalEvents.on('lamp:updated', this.updateLeds.bind(this));
            SignalEvents.on('lamp:blink', this.updateLedBlink.bind(this));
            SignalEvents.on('state:changed', this.render.bind(this));
        },

        getNextPos: function(type) {
            var w = (type === 'knob') ? 160 : ((type === 'led') ? 80 : 100);
            var rightmost = 20;
            var rowY = 20;
            for (var i = 0; i < SignalState.controls.length; i++) {
                var c = SignalState.controls[i];
                var cy = c.y !== undefined ? c.y : 20;
                if (Math.abs(cy - rowY) < 60) {
                    var cw = (c.type === 'knob') ? 160 : ((c.type === 'led') ? 80 : 100);
                    var cr = (c.x !== undefined ? c.x : 20) + cw;
                    if (cr > rightmost) rightmost = cr;
                }
            }
            var nextX = Math.ceil(rightmost / GRID) * GRID;
            if (nextX + w > 860) {
                return { x: 20, y: rowY + 140 };
            }
            return { x: nextX, y: rowY };
        },

        bindButtons: function() {
            var self = this;
            document.getElementById('btnAddLever').addEventListener('click', function() {
                var id = 'Lever' + (SignalState.controls.length + 1);
                var pos = self.getNextPos('lever');
                SignalState.controls.push({
                    id: id, type: 'lever', label: id, color: '#d92525', positions: 3, defaultValue: 0,
                    x: pos.x, y: pos.y, scale: 1.0
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddKnob').addEventListener('click', function() {
                var id = 'Knob' + (SignalState.controls.length + 1);
                var pos = self.getNextPos('knob');
                SignalState.controls.push({
                    id: id, type: 'knob', label: id, states: ['0', '1', '2'], mode: 'half', defaultValue: 0,
                    x: pos.x, y: pos.y, scale: 1.0
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddButton').addEventListener('click', function() {
                var id = 'Btn' + (SignalState.controls.length + 1);
                var pos = self.getNextPos('button');
                SignalState.controls.push({
                    id: id, type: 'button', label: id, color: '#2e68f8', isToggle: false, defaultValue: 0,
                    x: pos.x, y: pos.y, scale: 1.0
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddSwitch').addEventListener('click', function() {
                var id = 'Switch' + (SignalState.controls.length + 1);
                var pos = self.getNextPos('switch');
                SignalState.controls.push({
                    id: id, type: 'switch', label: id, defaultValue: 0,
                    x: pos.x, y: pos.y, scale: 1.0
                });
                SignalState.setControlValue(id, 0);
                self.render();
            });

            document.getElementById('btnAddLed').addEventListener('click', function() {
                var id = 'LED' + (SignalState.controls.length + 1);
                var pos = self.getNextPos('led');
                SignalState.controls.push({
                    id: id, type: 'led', label: id, colorKey: 'red',
                    x: pos.x, y: pos.y, scale: 1.0
                });
                SignalState.setLamp(id, false);
                self.render();
            });

            document.getElementById('btnAddText').addEventListener('click', function() {
                var id = 'text_' + Date.now();
                var pos = self.getNextPos('text');
                SignalState.texts.push({
                    id: id, text: 'Track Marker', x: pos.x, y: 140, scale: 1.0
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
            this.desk.innerHTML = '';
            for (var i = 0; i < SignalState.controls.length; i++) {
                var ctrl = SignalState.controls[i];
                var body = '';
                if (ctrl.type === 'lever') body = LeverControl.render(ctrl);
                else if (ctrl.type === 'knob') body = KnobControl.render(ctrl);
                else if (ctrl.type === 'button') body = ButtonControl.renderButton(ctrl);
                else if (ctrl.type === 'switch') body = ButtonControl.renderSwitch(ctrl);
                else if (ctrl.type === 'led') body = LedControl.render(ctrl);

                var wrap = document.createElement('div');
                wrap.className = 'draggable-wrapper';
                wrap.setAttribute('data-id', ctrl.id);
                var scale = ctrl.scale || 1.0;
                var scaleTransform = scale !== 1.0 ? ' scale(' + scale + ')' : '';
                var posX = Math.round((ctrl.x !== undefined ? ctrl.x : 20) / GRID) * GRID;
                var posY = Math.round((ctrl.y !== undefined ? ctrl.y : 20) / GRID) * GRID;
                wrap.style.cssText = 'left:' + posX + 'px; top:' + posY + 'px; transform-origin: top left;' + (scaleTransform ? ' transform:' + scaleTransform + ';' : '');
                wrap.innerHTML = body;

                if (window.ConsoleMenu) ConsoleMenu.attachDot(wrap, ctrl.id, true);
                this.desk.appendChild(wrap);
            }

            for (var t = 0; t < SignalState.texts.length; t++) {
                var txt = SignalState.texts[t];
                var tWrap = document.createElement('div');
                tWrap.className = 'draggable-wrapper';
                tWrap.setAttribute('data-text-id', txt.id);
                var tScale = txt.scale || 1.0;
                var tScaleTransform = tScale !== 1.0 ? ' scale(' + tScale + ')' : '';
                var tX = Math.round((txt.x !== undefined ? txt.x : 20) / GRID) * GRID;
                var tY = Math.round((txt.y !== undefined ? txt.y : 140) / GRID) * GRID;
                tWrap.style.cssText = 'left:' + tX + 'px; top:' + tY + 'px; transform-origin: top left;' + (tScaleTransform ? ' transform:' + tScaleTransform + ';' : '');
                tWrap.innerHTML = '<div class="console-item text-item"><input type="text" class="text-content" value="' + txt.text + '" data-input-text="' + txt.id + '"/></div>';

                if (window.ConsoleMenu) ConsoleMenu.attachDot(tWrap, txt.id, false);
                this.desk.appendChild(tWrap);
            }

            LeverControl.bindEvents(this.desk);
            KnobControl.bindEvents(this.desk);
            ButtonControl.bindEvents(this.desk);
            LedControl.bindEvents(this.desk);
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
                        var cfg = KnobControl.getAngles(c, states);
                        var knobBody = el.querySelector('.knob-body');
                        if (knobBody) {
                            var baseAngle = cfg.minAngle + curVal * cfg.stepAngle;
                            var kAngle = KnobControl.getShortestAngle(c._currentAngle, baseAngle);
                            c._currentAngle = kAngle;
                            knobBody.style.transform = 'rotate(' + kAngle.toFixed(1) + 'deg)';
                        }
                        var dialLabels = el.querySelectorAll('.knob-dial-label');
                        for (var d = 0; d < dialLabels.length; d++) {
                            dialLabels[d].classList.toggle('active', d === curVal);
                        }
                        var ticks = el.querySelectorAll('.knob-tick');
                        for (var tk = 0; tk < ticks.length; tk++) {
                            ticks[tk].classList.toggle('active', tk === curVal);
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
            var item = this.desk.querySelector('[data-control-id="' + payload.id + '"]');
            if (item) {
                var lens = item.querySelector('.led-lens');
                if (lens) {
                    lens.classList.toggle('is-lit', !!payload.lit);
                    lens.classList.toggle('is-off', !payload.lit);
                }
                var txt = item.querySelector('.led-state-text');
                if (txt) {
                    var isBlinking = window.SignalRuntime && window.SignalRuntime.activeBlinks && !!window.SignalRuntime.activeBlinks[payload.id];
                    txt.textContent = isBlinking ? 'BLINK' : (payload.lit ? 'ON' : 'OFF');
                }
            }
        },

        updateLedBlink: function(payload) {
            var item = this.desk.querySelector('[data-control-id="' + payload.id + '"]');
            if (item) {
                var lens = item.querySelector('.led-lens');
                if (lens) {
                    lens.classList.toggle('is-lit', !!payload.visible);
                    lens.classList.toggle('is-off', !payload.visible);
                }
                var txt = item.querySelector('.led-state-text');
                if (txt) {
                    var isBlinking = window.SignalRuntime && window.SignalRuntime.activeBlinks && !!window.SignalRuntime.activeBlinks[payload.id];
                    txt.textContent = isBlinking ? 'BLINK' : (payload.visible ? 'ON' : 'OFF');
                }
            }
        }
    };

    window.ConsoleUI = ConsoleUI;
})(window);