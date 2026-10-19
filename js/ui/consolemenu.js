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

            var desk = document.getElementById('consoleDesk') || document.body;
            var deskRect = desk.getBoundingClientRect();
            var menuRect = menu.getBoundingClientRect();

            if (menuRect.left < deskRect.left + 8) {
                menu.classList.add('align-left');
                menuRect = menu.getBoundingClientRect();
                if (menuRect.left < deskRect.left + 8) {
                    var shift = Math.round((deskRect.left + 8) - menuRect.left);
                    menu.style.transform = 'translateX(' + shift + 'px)';
                }
            } else if (menuRect.right > deskRect.right - 8) {
                var shiftR = Math.round((deskRect.right - 8) - menuRect.right);
                menu.style.transform = 'translateX(' + shiftR + 'px)';
            }
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
                startX = e.clientX;
                startY = e.clientY;
                moved = false;

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

            var self = this;
            var row = document.createElement('div');
            row.className = 'cmenu-row';

            var btnMove = document.createElement('button');
            btnMove.className = 'cmenu-btn';
            btnMove.textContent = 'Move';
            btnMove.addEventListener('click', function(e) { e.stopPropagation(); self.enterMoveMode(wrap); self.closeMenu(); });

            var btnResize = document.createElement('button');
            btnResize.className = 'cmenu-btn';
            btnResize.textContent = 'Resize';
            btnResize.addEventListener('click', function(e) { e.stopPropagation(); self.togglePanel(menu, 'resize', ctrl || textObj, isCtrl, wrap); });

            var btnModify = document.createElement('button');
            btnModify.className = 'cmenu-btn';
            btnModify.textContent = 'Modify';
            btnModify.addEventListener('click', function(e) { e.stopPropagation(); self.togglePanel(menu, 'modify', ctrl || textObj, isCtrl, wrap); });

            var btnDel = document.createElement('button');
            btnDel.className = 'cmenu-btn btn-danger';
            btnDel.textContent = 'Delete';
            btnDel.addEventListener('click', function(e) {
                e.stopPropagation();
                self.closeMenu();
                if (isCtrl) SignalState.removeControl(targetId);
                else SignalState.removeText(targetId);
            });

            row.appendChild(btnMove);
            row.appendChild(btnResize);
            row.appendChild(btnModify);
            row.appendChild(btnDel);
            menu.appendChild(row);

            wrap.appendChild(menu);
            this.activeMenu = menu;
            this.adjustMenuPosition(menu, wrap);
        },

        closeMenu: function() {
            if (this.activeMenu && this.activeMenu.parentNode) {
                this.activeMenu.parentNode.removeChild(this.activeMenu);
            }
            if (this.activeWrap) {
                this.activeWrap.classList.remove('menu-open');
            }
            this.activeMenu = null;
            this.activeWrap = null;
            SignalEvents.emit('state:persist');
        },

        togglePanel: function(menu, type, target, isCtrl, wrap) {
            var existing = menu.querySelector('.cmenu-panel');
            if (existing) {
                var curType = existing.getAttribute('data-panel-type');
                existing.parentNode.removeChild(existing);
                if (curType === type) {
                    this.adjustMenuPosition(menu, wrap);
                    return;
                }
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
            label.className = 'cmenu-label';
            label.textContent = 'Scale Size';
            panel.appendChild(label);

            var row = document.createElement('div');
            row.className = 'cmenu-row';
            var self = this;
            [0.8, 1.0, 1.2, 1.4].forEach(function(s) {
                var btn = document.createElement('button');
                btn.className = 'cmenu-btn' + (Math.abs((target.scale || 1.0) - s) < 0.05 ? ' active' : '');
                btn.textContent = Math.round(s * 100) + '%';
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    target.scale = s;
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                    self.closeMenu();
                });
                row.appendChild(btn);
            });
            panel.appendChild(row);
        },

        buildModifyPanel: function(panel, target, isCtrl, wrap) {
            if (!isCtrl) {
                var lbl = document.createElement('span');
                lbl.className = 'cmenu-label';
                lbl.textContent = 'Text Value';
                var inp = document.createElement('input');
                inp.className = 'cmenu-input';
                inp.value = target.text || '';
                inp.addEventListener('input', function() {
                    target.text = this.value;
                    var txtInp = wrap ? wrap.querySelector('.text-content') : null;
                    if (txtInp) txtInp.value = target.text;
                    SignalEvents.emit('state:persist');
                });
                panel.appendChild(lbl);
                panel.appendChild(inp);
                return;
            }

            var lblLabel = document.createElement('span');
            lblLabel.className = 'cmenu-label';
            lblLabel.textContent = 'Display Label';
            var inpLabel = document.createElement('input');
            inpLabel.className = 'cmenu-input';
            inpLabel.value = target.label || target.id;
            inpLabel.addEventListener('change', function() {
                target.label = this.value.trim() || target.id;
                SignalEvents.emit('state:persist');
                if (window.ConsoleUI) window.ConsoleUI.render();
            });
            panel.appendChild(lblLabel);
            panel.appendChild(inpLabel);

            var lblId = document.createElement('span');
            lblId.className = 'cmenu-label';
            lblId.textContent = 'Script Identifier (ID)';
            var inpId = document.createElement('input');
            inpId.className = 'cmenu-input';
            inpId.value = target.id;
            inpId.addEventListener('change', function() {
                var newId = this.value.replace(/[^a-zA-Z0-9_]/g, '');
                if (newId && newId !== target.id) {
                    var oldId = target.id;
                    SignalState.controlValues[newId] = SignalState.controlValues[oldId];
                    delete SignalState.controlValues[oldId];
                    target.id = newId;
                    if (wrap) wrap.setAttribute('data-id', newId);
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                }
            });
            panel.appendChild(lblId);
            panel.appendChild(inpId);

            if (target.type === 'led') {
                var cLbl = document.createElement('span');
                cLbl.className = 'cmenu-label';
                cLbl.textContent = 'LED Color';
                var cRow = document.createElement('div');
                cRow.className = 'cmenu-row';
                ['red', 'yellow', 'green', 'white', 'blue'].forEach(function(ck) {
                    var btn = document.createElement('button');
                    btn.className = 'cmenu-btn' + ((target.colorKey || 'red').toLowerCase() === ck ? ' active' : '');
                    btn.textContent = ck.charAt(0).toUpperCase() + ck.slice(1);
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        target.colorKey = ck;
                        SignalEvents.emit('state:persist');
                        if (window.ConsoleUI) window.ConsoleUI.render();
                    });
                    cRow.appendChild(btn);
                });
                panel.appendChild(cLbl);
                panel.appendChild(cRow);
            } else if (target.type === 'knob') {
                var stLbl = document.createElement('span');
                stLbl.className = 'cmenu-label';
                stLbl.textContent = 'Dial Positions (comma separated)';
                var stInp = document.createElement('input');
                stInp.className = 'cmenu-input';
                stInp.value = (target.states || ['0', '1', '2']).join(', ');
                stInp.addEventListener('change', function() {
                    target.states = this.value.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });
                panel.appendChild(stLbl);
                panel.appendChild(stInp);
            }
        },

        enterMoveMode: function(wrap, initialEvent) {
            this.exitMoveMode();
            wrap.classList.add('move-active');
            this.activeModeWrap = wrap;

            var targetId = wrap.getAttribute('data-id') || wrap.getAttribute('data-text-id');
            var isCtrl = wrap.hasAttribute('data-id');
            var isDragging = false, startX = 0, startY = 0, initLeft = 0, initTop = 0;
            var targetX = 0, targetY = 0;
            var badge = null;

            var onPointerDown = function(e) {
                if (e.target.closest('.control-dot-menu')) return;
                isDragging = true;
                wrap.classList.add('dragging');
                try { wrap.setPointerCapture(e.pointerId); } catch (err) {}
                startX = e.clientX;
                startY = e.clientY;
                initLeft = parseInt(wrap.style.left, 10) || 0;
                initTop = parseInt(wrap.style.top, 10) || 0;
                targetX = initLeft;
                targetY = initTop;

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

            wrap._moveDown = onPointerDown;
            wrap._moveMove = onPointerMove;
            wrap._moveUp = onPointerUp;

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