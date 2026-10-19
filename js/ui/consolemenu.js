(function(window) {
    'use strict';

    var GRID_SNAP = 20;

    var ConsoleMenu = {
        activeMenu: null,
        activeWrap: null,
        activeModeWrap: null,

        init: function() {
            var self = this;
            window.addEventListener('pointerdown', function(e) {
                if (self.activeMenu && !self.activeMenu.contains(e.target) && !e.target.classList.contains('control-dot')) {
                    self.closeMenu();
                }
                if (self.activeModeWrap && !self.activeModeWrap.contains(e.target) && !e.target.closest('.control-dot-menu')) {
                    self.exitMoveMode();
                }
            });
            window.addEventListener('resize', function() {
                if (self.activeMenu && self.activeWrap) self.adjustMenuPosition(self.activeMenu, self.activeWrap);
            });
        },

        adjustMenuPosition: function(menu, wrap) {
            if (!menu || !wrap) return;
            menu.classList.remove('align-left');
            menu.style.transform = '';
            menu.style.maxHeight = '';
            menu.style.overflowY = '';

            var desk = document.getElementById('consoleDesk') || document.body;
            var deskRect = desk.getBoundingClientRect();
            var maxH = Math.max(120, Math.round(deskRect.height - 16));
            menu.style.maxHeight = maxH + 'px';
            menu.style.overflowY = 'auto';

            var menuRect = menu.getBoundingClientRect();
            var shiftX = 0, shiftY = 0;

            if (menuRect.left < deskRect.left + 8) {
                menu.classList.add('align-left');
                menuRect = menu.getBoundingClientRect();
                if (menuRect.left < deskRect.left + 8) shiftX = Math.round((deskRect.left + 8) - menuRect.left);
            } else if (menuRect.right > deskRect.right - 8) {
                shiftX = Math.round((deskRect.right - 8) - menuRect.right);
            }

            if (menuRect.bottom > deskRect.bottom - 8) shiftY = Math.round((deskRect.bottom - 8) - menuRect.bottom);
            if (menuRect.top + shiftY < deskRect.top + 8) shiftY = Math.round((deskRect.top + 8) - menuRect.top);

            var t = [];
            if (shiftX !== 0) t.push('translateX(' + shiftX + 'px)');
            if (shiftY !== 0) t.push('translateY(' + shiftY + 'px)');
            menu.style.transform = t.join(' ');
        },

        attachDot: function(wrap, targetId, isCtrl) {
            var self = this;
            var dot = document.createElement('div');
            dot.className = 'control-dot';
            dot.title = 'Options';
            wrap.appendChild(dot);

            var startX = 0, startY = 0, moved = false;
            dot.addEventListener('pointerdown', function(e) {
                e.stopPropagation();
                startX = e.clientX; startY = e.clientY; moved = false;

                var onMoveCheck = function(ev) {
                    if (Math.abs(ev.clientX - startX) > 4 || Math.abs(ev.clientY - startY) > 4) {
                        moved = true;
                        window.removeEventListener('pointermove', onMoveCheck);
                        self.closeMenu();
                        self.enterMoveMode(wrap, ev);
                    }
                };
                var onUpCheck = function() {
                    window.removeEventListener('pointermove', onMoveCheck);
                    window.removeEventListener('pointerup', onUpCheck);
                    if (!moved) {
                        if (self.activeMenu && self.activeWrap === wrap) self.closeMenu();
                        else self.openMenu(wrap, targetId, isCtrl);
                    }
                };
                window.addEventListener('pointermove', onMoveCheck);
                window.addEventListener('pointerup', onUpCheck);
            });
        },

        openMenu: function(wrap, targetId, isCtrl) {
            this.closeMenu();
            this.activeWrap = wrap;
            wrap.classList.add('menu-open');

            var ctrl = isCtrl ? SignalState.controls.filter(function(c) { return c.id === targetId; })[0] : null;
            var textObj = !isCtrl ? SignalState.texts.filter(function(t) { return t.id === targetId; })[0] : null;
            var menu = document.createElement('div');
            menu.className = 'control-dot-menu';

            var self = this, row = document.createElement('div');
            row.className = 'cmenu-row';

            var addBtn = function(txt, cls, onClick) {
                var b = document.createElement('button');
                b.className = 'cmenu-btn' + (cls ? (' ' + cls) : '');
                b.textContent = txt;
                b.addEventListener('click', onClick);
                row.appendChild(b);
            };

            addBtn('Move', '', function(e) { e.stopPropagation(); self.enterMoveMode(wrap); self.closeMenu(); });
            addBtn('Resize', '', function(e) { e.stopPropagation(); self.togglePanel(menu, 'resize', ctrl || textObj, isCtrl, wrap); });
            addBtn('Modify', '', function(e) { e.stopPropagation(); self.togglePanel(menu, 'modify', ctrl || textObj, isCtrl, wrap); });
            addBtn('Delete', 'btn-danger', function(e) {
                e.stopPropagation(); self.closeMenu();
                if (isCtrl) SignalState.removeControl(targetId);
                else SignalState.removeText(targetId);
            });

            menu.appendChild(row);
            wrap.appendChild(menu);
            this.activeMenu = menu;
            this.adjustMenuPosition(menu, wrap);
        },

        closeMenu: function() {
            if (this.activeMenu && this.activeMenu.parentNode) this.activeMenu.parentNode.removeChild(this.activeMenu);
            if (this.activeWrap) this.activeWrap.classList.remove('menu-open');
            this.activeMenu = null;
            this.activeWrap = null;
            SignalEvents.emit('state:persist');
        },

        togglePanel: function(menu, type, target, isCtrl, wrap) {
            var existing = menu.querySelector('.cmenu-panel');
            if (existing) {
                var cur = existing.getAttribute('data-panel-type');
                existing.parentNode.removeChild(existing);
                if (cur === type) { this.adjustMenuPosition(menu, wrap); return; }
            }
            var panel = document.createElement('div');
            panel.className = 'cmenu-panel';
            panel.setAttribute('data-panel-type', type);
            if (type === 'resize') this.buildResizePanel(panel, target);
            else if (type === 'modify') this.buildModifyPanel(panel, target, isCtrl, wrap);
            menu.appendChild(panel);
            this.adjustMenuPosition(menu, wrap);
        },

        buildResizePanel: function(panel, target) {
            var label = document.createElement('span');
            label.className = 'cmenu-label'; label.textContent = 'Scale Size';
            panel.appendChild(label);
            var row = document.createElement('div'); row.className = 'cmenu-row';
            var self = this;
            [0.8, 1.0, 1.2, 1.4].forEach(function(s) {
                var b = document.createElement('button');
                b.className = 'cmenu-btn' + (Math.abs((target.scale || 1.0) - s) < 0.05 ? ' active' : '');
                b.textContent = Math.round(s * 100) + '%';
                b.addEventListener('click', function(e) {
                    e.stopPropagation(); target.scale = s;
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                    self.closeMenu();
                });
                row.appendChild(b);
            });
            panel.appendChild(row);
        },

        buildModifyPanel: function(panel, target, isCtrl, wrap) {
            if (!isCtrl) {
                var lbl = document.createElement('span'); lbl.className = 'cmenu-label'; lbl.textContent = 'Text Value';
                var inp = document.createElement('input'); inp.className = 'cmenu-input'; inp.value = target.text || '';
                inp.addEventListener('input', function() {
                    target.text = this.value;
                    var tEl = wrap ? wrap.querySelector('.text-content') : null;
                    if (tEl) tEl.value = target.text;
                    SignalEvents.emit('state:persist');
                });
                panel.appendChild(lbl); panel.appendChild(inp);
                return;
            }

            var addField = function(title, val, onChg) {
                var l = document.createElement('span'); l.className = 'cmenu-label'; l.textContent = title;
                var i = document.createElement('input'); i.className = 'cmenu-input'; i.value = val;
                i.addEventListener('change', function() { onChg(this.value); });
                panel.appendChild(l); panel.appendChild(i);
            };

            addField('Display Label', target.label || target.id, function(v) {
                target.label = v.trim() || target.id;
                SignalEvents.emit('state:persist');
                if (window.ConsoleUI) window.ConsoleUI.render();
            });

            addField('Script Identifier (ID)', target.id, function(v) {
                var nId = v.replace(/[^a-zA-Z0-9_]/g, '');
                if (nId && nId !== target.id) {
                    var old = target.id;
                    SignalState.controlValues[nId] = SignalState.controlValues[old];
                    delete SignalState.controlValues[old];
                    target.id = nId;
                    if (wrap) wrap.setAttribute('data-id', nId);
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                }
            });

            if (target.type === 'knob' || target.type === 'lever') {
                var defStates = ['0', '1', '2'];
                var curStates = (target.states && target.states.length) ? target.states : defStates;
                addField('States / Positions (comma separated)', curStates.join(', '), function(v) {
                    var parsed = v.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
                    if (parsed.length >= 2) {
                        target.states = parsed;
                        if (target.type === 'lever') target.positions = Math.min(5, Math.max(2, parsed.length));
                    }
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });
            } else if (target.type === 'button') {
                var bColorLbl = document.createElement('span'); bColorLbl.className = 'cmenu-label'; bColorLbl.textContent = 'Button Color';
                var bColorRow = document.createElement('div'); bColorRow.className = 'cmenu-row';
                var swatches = [
                    { name: 'Red', hex: '#ff3333' },
                    { name: 'Yellow', hex: '#f0a316' },
                    { name: 'Green', hex: '#00cc44' },
                    { name: 'Blue', hex: '#2e68f8' },
                    { name: 'White', hex: '#e2e8f0' },
                    { name: 'Dark', hex: '#22252c' }
                ];
                swatches.forEach(function(item) {
                    var b = document.createElement('button');
                    b.className = 'cmenu-btn' + ((target.color || '#2e68f8').toLowerCase() === item.hex.toLowerCase() ? ' active' : '');
                    b.textContent = item.name;
                    b.style.borderBottom = '3px solid ' + item.hex;
                    b.addEventListener('click', function(e) {
                        e.stopPropagation(); target.color = item.hex;
                        if (colorPick) colorPick.value = item.hex;
                        if (colorInp) colorInp.value = item.hex;
                        SignalEvents.emit('state:persist');
                        if (window.ConsoleUI) window.ConsoleUI.render();
                    });
                    bColorRow.appendChild(b);
                });
                panel.appendChild(bColorLbl); panel.appendChild(bColorRow);

                var pickRow = document.createElement('div'); pickRow.className = 'cmenu-row'; pickRow.style.marginTop = '4px';
                var colorPick = document.createElement('input'); colorPick.type = 'color'; colorPick.value = target.color || '#2e68f8';
                colorPick.style.cssText = 'width:32px; height:24px; border:none; background:transparent; cursor:pointer; padding:0;';
                var colorInp = document.createElement('input'); colorInp.type = 'text'; colorInp.className = 'cmenu-input';
                colorInp.style.flex = '1'; colorInp.value = target.color || '#2e68f8';

                colorPick.addEventListener('input', function() {
                    colorInp.value = this.value; target.color = this.value;
                    var cap = wrap ? wrap.querySelector('.button-cap') : null;
                    if (cap) cap.style.backgroundColor = this.value;
                    SignalEvents.emit('state:persist');
                });
                colorInp.addEventListener('change', function() {
                    colorPick.value = this.value; target.color = this.value;
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });
                pickRow.appendChild(colorPick); pickRow.appendChild(colorInp);
                panel.appendChild(pickRow);

                var modeRow = document.createElement('div'); modeRow.className = 'cmenu-row'; modeRow.style.marginTop = '6px';
                var btnMom = document.createElement('button');
                btnMom.className = 'cmenu-btn' + (!target.isToggle ? ' active' : '');
                btnMom.textContent = 'Momentary';
                btnMom.addEventListener('click', function(e) {
                    e.stopPropagation(); target.isToggle = false;
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });
                var btnTog = document.createElement('button');
                btnTog.className = 'cmenu-btn' + (target.isToggle ? ' active' : '');
                btnTog.textContent = 'Latching';
                btnTog.addEventListener('click', function(e) {
                    e.stopPropagation(); target.isToggle = true;
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });
                modeRow.appendChild(btnMom); modeRow.appendChild(btnTog);
                panel.appendChild(modeRow);
            } else if (target.type === 'switch') {
                var sStates = (target.states && target.states.length === 2) ? target.states : ['OFF', 'ON'];
                addField('Switch States (Off, On)', sStates.join(', '), function(v) {
                    var parsed = v.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
                    if (parsed.length >= 2) target.states = [parsed[0], parsed[1]];
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });
            } else if (target.type === 'led') {
                var cLbl = document.createElement('span'); cLbl.className = 'cmenu-label'; cLbl.textContent = 'LED Color';
                var cRow = document.createElement('div'); cRow.className = 'cmenu-row';
                ['red', 'yellow', 'green', 'white', 'blue'].forEach(function(ck) {
                    var b = document.createElement('button');
                    b.className = 'cmenu-btn' + ((target.colorKey || 'red').toLowerCase() === ck ? ' active' : '');
                    b.textContent = ck.charAt(0).toUpperCase() + ck.slice(1);
                    b.addEventListener('click', function(e) {
                        e.stopPropagation(); target.colorKey = ck;
                        SignalEvents.emit('state:persist');
                        if (window.ConsoleUI) window.ConsoleUI.render();
                    });
                    cRow.appendChild(b);
                });
                panel.appendChild(cLbl); panel.appendChild(cRow);
            }
        },

        enterMoveMode: function(wrap, initialEvent) {
            this.exitMoveMode();
            wrap.classList.add('move-active');
            this.activeModeWrap = wrap;

            var targetId = wrap.getAttribute('data-id') || wrap.getAttribute('data-text-id');
            var isCtrl = wrap.hasAttribute('data-id');
            var isDragging = false, startX = 0, startY = 0, initLeft = 0, initTop = 0, targetX = 0, targetY = 0;
            var badge = null;

            var onPointerDown = function(e) {
                if (e.target.closest('.control-dot-menu')) return;
                isDragging = true;
                wrap.classList.add('dragging');
                try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
                startX = e.clientX; startY = e.clientY;
                initLeft = parseInt(wrap.style.left, 10) || 0;
                initTop = parseInt(wrap.style.top, 10) || 0;
                targetX = initLeft; targetY = initTop;

                badge = document.createElement('div');
                badge.className = 'snap-coord-badge';
                badge.textContent = 'X: ' + targetX + '  Y: ' + targetY;
                wrap.appendChild(badge);
            };

            var onPointerMove = function(e) {
                if (!isDragging) return;
                var rawX = initLeft + (e.clientX - startX);
                var rawY = initTop + (e.clientY - startY);
                targetX = Math.max(GRID_SNAP, Math.round(rawX / GRID_SNAP) * GRID_SNAP);
                targetY = Math.max(GRID_SNAP, Math.round(rawY / GRID_SNAP) * GRID_SNAP);
                wrap.style.transform = 'translate3d(' + (targetX - initLeft) + 'px, ' + (targetY - initTop) + 'px, 0)';
                if (badge) badge.textContent = 'X: ' + targetX + '  Y: ' + targetY;
            };

            var onPointerUp = function(e) {
                if (!isDragging) return;
                isDragging = false;
                wrap.classList.remove('dragging');
                try { wrap.releasePointerCapture(e.pointerId); } catch (err) {}
                wrap.style.transform = '';
                wrap.style.left = targetX + 'px';
                wrap.style.top = targetY + 'px';
                if (badge && badge.parentNode) badge.parentNode.removeChild(badge);

                if (isCtrl) SignalState.updateControlPos(targetId, targetX, targetY);
                else SignalState.updateTextPos(targetId, targetX, targetY);
            };

            wrap._moveDown = onPointerDown; wrap._moveMove = onPointerMove; wrap._moveUp = onPointerUp;
            wrap.addEventListener('pointerdown', onPointerDown);
            wrap.addEventListener('pointermove', onPointerMove);
            wrap.addEventListener('pointerup', onPointerUp);
            wrap.addEventListener('pointercancel', onPointerUp);
            if (initialEvent) onPointerDown(initialEvent);
        },

        exitMoveMode: function() {
            if (this.activeModeWrap) {
                var wrap = this.activeModeWrap;
                wrap.classList.remove('move-active');
                if (wrap._moveDown) {
                    wrap.removeEventListener('pointerdown', wrap._moveDown);
                    wrap.removeEventListener('pointermove', wrap._moveMove);
                    wrap.removeEventListener('pointerup', wrap._moveUp);
                    wrap.removeEventListener('pointercancel', wrap._moveUp);
                }
                var badge = wrap.querySelector('.snap-coord-badge');
                if (badge && badge.parentNode) badge.parentNode.removeChild(badge);
                this.activeModeWrap = null;
                SignalEvents.emit('state:persist');
            }
        }
    };

    window.ConsoleMenu = ConsoleMenu;
})(window);