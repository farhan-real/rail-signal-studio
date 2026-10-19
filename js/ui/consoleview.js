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
            var rightmost = 20, rowY = 20;
            var maxW = (this.desk && this.desk.clientWidth > 300) ? (this.desk.clientWidth - w - 10) : 700;
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
            if (nextX + w > maxW) return { x: 20, y: rowY + 110 };
            return { x: nextX, y: rowY };
        },

        bindButtons: function() {
            var self = this;
            var addCtrl = function(type, def) {
                var id = def.prefix + (SignalState.controls.length + 1), pos = self.getNextPos(type);
                var item = Object.assign({ id: id, label: id, x: pos.x, y: pos.y, scale: 1.0 }, def.opts);
                SignalState.controls.push(item);
                if (type === 'led') SignalState.setLamp(id, false);
                else SignalState.setControlValue(id, def.opts.defaultValue || 0);
                self.render();
            };

            document.getElementById('btnAddLever').addEventListener('click', function() {
                addCtrl('lever', { prefix: 'Lever', opts: { type: 'lever', color: '#d92525', positions: 3, defaultValue: 0 } });
            });
            document.getElementById('btnAddKnob').addEventListener('click', function() {
                addCtrl('knob', { prefix: 'Knob', opts: { type: 'knob', states: ['0', '1', '2'], mode: 'half', defaultValue: 0 } });
            });
            document.getElementById('btnAddButton').addEventListener('click', function() {
                addCtrl('button', { prefix: 'Btn', opts: { type: 'button', color: '#2e68f8', isToggle: false, defaultValue: 0 } });
            });
            document.getElementById('btnAddSwitch').addEventListener('click', function() {
                addCtrl('switch', { prefix: 'Switch', opts: { type: 'switch', defaultValue: 0 } });
            });
            document.getElementById('btnAddLed').addEventListener('click', function() {
                addCtrl('led', { prefix: 'LED', opts: { type: 'led', colorKey: 'red' } });
            });
            document.getElementById('btnAddText').addEventListener('click', function() {
                var id = 'text_' + Date.now(), pos = self.getNextPos('text');
                SignalState.texts.push({ id: id, text: 'Track Marker', x: pos.x, y: 140, scale: 1.0 });
                self.render();
            });
        },

        bindResizer: function() {
            var container = document.getElementById('controlConsole');
            var handle = document.getElementById('consoleResizeHandle');
            var toggleBtn = document.getElementById('btnToggleCollapseConsole');
            var isDragging = false, startPos = 0, startDim = 0, lastExpanded = 200;

            var isLandscapeSide = function() {
                return window.matchMedia('(max-height: 560px) and (orientation: landscape)').matches;
            };

            var doToggle = function() {
                var isCollapsed = container.classList.contains('is-collapsed');
                if (isCollapsed) {
                    container.classList.remove('is-collapsed');
                    if (isLandscapeSide()) container.style.width = lastExpanded + 'px';
                    else container.style.height = lastExpanded + 'px';
                } else {
                    lastExpanded = Math.max(120, isLandscapeSide() ? container.getBoundingClientRect().width : container.getBoundingClientRect().height);
                    container.classList.add('is-collapsed');
                }
                if (window.ViewportUI) window.ViewportUI.centerView();
            };

            if (toggleBtn) toggleBtn.addEventListener('click', doToggle);
            if (handle) {
                handle.addEventListener('dblclick', doToggle);
                handle.addEventListener('pointerdown', function(e) {
                    if (e.pointerType === 'touch' && !e.isPrimary) return;
                    isDragging = true;
                    var side = isLandscapeSide();
                    startPos = side ? e.clientX : e.clientY;
                    startDim = side ? container.getBoundingClientRect().width : container.getBoundingClientRect().height;
                    container.classList.add('is-resizing');
                    try { handle.setPointerCapture(e.pointerId); } catch (err) {}
                });

                handle.addEventListener('pointermove', function(e) {
                    if (!isDragging) return;
                    var side = isLandscapeSide();
                    if (side) {
                        var deltaX = startPos - e.clientX;
                        var maxW = Math.max(180, window.innerWidth * 0.7);
                        var newW = Math.max(120, Math.min(maxW, startDim + deltaX));
                        container.classList.remove('is-collapsed');
                        container.style.width = newW + 'px';
                        lastExpanded = newW;
                    } else {
                        var deltaY = startPos - e.clientY;
                        var maxH = Math.max(160, window.innerHeight * 0.75);
                        var newH = Math.max(70, Math.min(maxH, startDim + deltaY));
                        container.classList.remove('is-collapsed');
                        container.style.height = newH + 'px';
                        lastExpanded = newH;
                    }
                    if (window.ViewportUI) window.ViewportUI.scheduleTransform();
                });

                var endDrag = function() {
                    if (!isDragging) return;
                    isDragging = false;
                    container.classList.remove('is-resizing');
                    try { handle.releasePointerCapture(e.pointerId); } catch (err) {}
                    if (window.ViewportUI) window.ViewportUI.centerView();
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
                if (!el) continue;
                var curVal = SignalState.getControlValue(c.id);

                if (c.type === 'lever') {
                    var vEl = el.querySelector('.lever-val');
                    if (vEl) vEl.textContent = (c.states && c.states[curVal]) ? c.states[curVal] : ('POS ' + curVal);
                    var handle = el.querySelector('.lever-handle');
                    if (handle) {
                        var numPos = Math.max(2, (c.states && c.states.length) ? c.states.length : (c.positions || 2));
                        handle.style.transform = 'rotate(' + (-22 + curVal * (44 / (numPos - 1))).toFixed(1) + 'deg)';
                    }
                    var notches = el.querySelectorAll('.lever-notch');
                    for (var n = 0; n < notches.length; n++) notches[n].classList.toggle('active', n === curVal);
                } else if (c.type === 'knob') {
                    var states = KnobControl.getStates(c), cfg = KnobControl.getAngles(c, states);
                    var knobBody = el.querySelector('.knob-body');
                    if (knobBody) {
                        var kAngle = KnobControl.getShortestAngle(c._currentAngle, cfg.minAngle + curVal * cfg.stepAngle);
                        c._currentAngle = kAngle;
                        knobBody.style.transform = 'rotate(' + kAngle.toFixed(1) + 'deg)';
                    }
                    var dialLabels = el.querySelectorAll('.knob-dial-label');
                    for (var d = 0; d < dialLabels.length; d++) dialLabels[d].classList.toggle('active', d === curVal);
                    var ticks = el.querySelectorAll('.knob-tick');
                    for (var tk = 0; tk < ticks.length; tk++) ticks[tk].classList.toggle('active', tk === curVal);
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
                    if (swState) swState.textContent = curVal === 1 ? ((c.states && c.states[1]) ? c.states[1] : 'ON') : ((c.states && c.states[0]) ? c.states[0] : 'OFF');
                }
            }
        },

        setLedVisual: function(id, isLit) {
            var uId = String(id).toUpperCase();
            var item = this.desk.querySelector('[data-control-id="' + id + '"]');
            if (!item) {
                var all = this.desk.querySelectorAll('[data-control-id]');
                for (var k = 0; k < all.length; k++) {
                    if (all[k].getAttribute('data-control-id').toUpperCase() === uId) { item = all[k]; break; }
                }
            }
            if (item) {
                var lens = item.querySelector('.led-lens');
                if (lens) {
                    lens.classList.toggle('is-lit', !!isLit);
                    lens.classList.toggle('is-off', !isLit);
                }
                var txt = item.querySelector('.led-state-text');
                if (txt) {
                    var isBlinking = window.SignalRuntime && window.SignalRuntime.activeBlinks && !!(window.SignalRuntime.activeBlinks[id] || window.SignalRuntime.activeBlinks[uId]);
                    txt.textContent = isBlinking ? 'BLINK' : (isLit ? 'ON' : 'OFF');
                }
            }
        },

        updateLeds: function(payload) {
            this.setLedVisual(payload.id, !!payload.lit);
        },

        updateLedBlink: function(payload) {
            this.setLedVisual(payload.id, !!payload.visible);
        }
    };

    window.ConsoleUI = ConsoleUI;
})(window);