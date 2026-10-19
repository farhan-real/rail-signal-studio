(function(window) {
    'use strict';

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
        },

        attachDot: function(wrap, targetId, isCtrl) {
            var self = this;
            var dot = document.createElement('div');
            dot.className = 'control-dot';
            dot.title = 'Options';
            wrap.appendChild(dot);

            dot.addEventListener('click', function(e) {
                e.stopPropagation();
                if (self.activeMenu && self.activeWrap === wrap) {
                    self.closeMenu();
                    return;
                }
                self.openMenu(wrap, targetId, isCtrl);
            });
        },

        openMenu: function(wrap, targetId, isCtrl) {
            this.closeMenu();
            this.activeWrap = wrap;

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
            btnMove.addEventListener('click', function(e) {
                e.stopPropagation();
                self.enterMoveMode(wrap);
                self.closeMenu();
            });

            var btnResize = document.createElement('button');
            btnResize.className = 'cmenu-btn';
            btnResize.textContent = 'Resize';
            btnResize.addEventListener('click', function(e) {
                e.stopPropagation();
                self.togglePanel(menu, 'resize', ctrl || textObj);
            });

            var btnModify = document.createElement('button');
            btnModify.className = 'cmenu-btn';
            btnModify.textContent = 'Modify';
            btnModify.addEventListener('click', function(e) {
                e.stopPropagation();
                self.togglePanel(menu, 'modify', ctrl || textObj, isCtrl);
            });

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
        },

        closeMenu: function() {
            if (this.activeMenu && this.activeMenu.parentNode) {
                this.activeMenu.parentNode.removeChild(this.activeMenu);
            }
            this.activeMenu = null;
            this.activeWrap = null;
            SignalEvents.emit('state:persist');
        },

        togglePanel: function(menu, type, target, isCtrl) {
            var existing = menu.querySelector('.cmenu-panel');
            if (existing) {
                var curType = existing.getAttribute('data-panel-type');
                existing.parentNode.removeChild(existing);
                if (curType === type) return;
            }

            var panel = document.createElement('div');
            panel.className = 'cmenu-panel';
            panel.setAttribute('data-panel-type', type);

            if (type === 'resize') {
                this.buildResizePanel(panel, target);
            } else if (type === 'modify') {
                this.buildModifyPanel(panel, target, isCtrl);
            }
            menu.appendChild(panel);
        },

        buildResizePanel: function(panel, target) {
            var label = document.createElement('span');
            label.className = 'cmenu-label';
            label.textContent = 'Scale Size';
            panel.appendChild(label);

            var row = document.createElement('div');
            row.className = 'cmenu-row';
            var scales = [0.8, 1.0, 1.2, 1.4];
            var curScale = target.scale || 1.0;

            var self = this;
            scales.forEach(function(s) {
                var btn = document.createElement('button');
                btn.className = 'cmenu-btn' + (Math.abs(curScale - s) < 0.05 ? ' active' : '');
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

        buildModifyPanel: function(panel, target, isCtrl) {
            if (!isCtrl) {
                var lbl = document.createElement('span');
                lbl.className = 'cmenu-label';
                lbl.textContent = 'Text Value';
                var inp = document.createElement('input');
                inp.className = 'cmenu-input';
                inp.value = target.text || '';
                inp.addEventListener('change', function() { target.text = this.value; SignalEvents.emit('state:persist'); });
                panel.appendChild(lbl);
                panel.appendChild(inp);
                return;
            }

            var nameLbl = document.createElement('span');
            nameLbl.className = 'cmenu-label';
            nameLbl.textContent = 'Label';
            var nameInp = document.createElement('input');
            nameInp.className = 'cmenu-input';
            nameInp.value = target.label || target.id;
            nameInp.addEventListener('change', function() { target.label = this.value; SignalEvents.emit('state:persist'); });
            panel.appendChild(nameLbl);
            panel.appendChild(nameInp);

            if (target.type === 'knob') {
                var modeLbl = document.createElement('span');
                modeLbl.className = 'cmenu-label';
                modeLbl.textContent = 'Dial Arc Mode';
                var mRow = document.createElement('div');
                mRow.className = 'cmenu-row';

                var btnHalf = document.createElement('button');
                btnHalf.className = 'cmenu-btn' + (target.mode === 'half' ? ' active' : '');
                btnHalf.textContent = 'Top Half';
                btnHalf.addEventListener('click', function(e) {
                    e.stopPropagation();
                    target.mode = 'half';
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });

                var btnFull = document.createElement('button');
                btnFull.className = 'cmenu-btn' + (target.mode !== 'half' ? ' active' : '');
                btnFull.textContent = 'Full 270°';
                btnFull.addEventListener('click', function(e) {
                    e.stopPropagation();
                    target.mode = 'full';
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });

                mRow.appendChild(btnHalf);
                mRow.appendChild(btnFull);
                panel.appendChild(modeLbl);
                panel.appendChild(mRow);

                var stLbl = document.createElement('span');
                stLbl.className = 'cmenu-label';
                stLbl.textContent = 'Positions (comma separated)';
                var stInp = document.createElement('input');
                stInp.className = 'cmenu-input';
                var states = target.states || ['0', '1', '2'];
                stInp.value = states.join(', ');
                stInp.addEventListener('change', function() {
                    target.states = this.value.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });
                panel.appendChild(stLbl);
                panel.appendChild(stInp);
            } else if (target.type === 'lever') {
                var posLbl = document.createElement('span');
                posLbl.className = 'cmenu-label';
                posLbl.textContent = 'Positions (2-5)';
                var posInp = document.createElement('input');
                posInp.type = 'number';
                posInp.min = '2';
                posInp.max = '5';
                posInp.className = 'cmenu-input';
                posInp.value = target.positions || 2;
                posInp.addEventListener('change', function() {
                    target.positions = Math.max(2, Math.min(5, parseInt(this.value, 10) || 2));
                    SignalEvents.emit('state:persist');
                    if (window.ConsoleUI) window.ConsoleUI.render();
                });
                panel.appendChild(posLbl);
                panel.appendChild(posInp);
            }
        },

        enterMoveMode: function(wrap) {
            this.exitMoveMode();
            wrap.classList.add('move-active');
            this.activeModeWrap = wrap;

            var targetId = wrap.getAttribute('data-id') || wrap.getAttribute('data-text-id');
            var isCtrl = wrap.hasAttribute('data-id');

            var isPointerDown = false, startX = 0, startY = 0, initLeft = 0, initTop = 0;
            var curDeltaX = 0, curDeltaY = 0;

            var onPointerDown = function(e) {
                if (e.target.closest('.control-dot') || e.target.closest('.control-dot-menu')) return;
                isPointerDown = true;
                wrap.classList.add('dragging');
                wrap.setPointerCapture(e.pointerId);
                startX = e.clientX;
                startY = e.clientY;
                initLeft = parseInt(wrap.style.left, 10) || 0;
                initTop = parseInt(wrap.style.top, 10) || 0;
                curDeltaX = 0;
                curDeltaY = 0;
            };

            var onPointerMove = function(e) {
                if (!isPointerDown) return;
                curDeltaX = e.clientX - startX;
                curDeltaY = e.clientY - startY;
                wrap.style.transform = 'translate3d(' + curDeltaX + 'px, ' + curDeltaY + 'px, 0)';
            };

            var onPointerUp = function(e) {
                if (!isPointerDown) return;
                isPointerDown = false;
                wrap.classList.remove('dragging');
                try { wrap.releasePointerCapture(e.pointerId); } catch (err) {}
                wrap.style.transform = '';
                var snap = 10;
                var fX = Math.max(10, Math.round((initLeft + curDeltaX) / snap) * snap);
                var fY = Math.max(10, Math.round((initTop + curDeltaY) / snap) * snap);
                wrap.style.left = fX + 'px';
                wrap.style.top = fY + 'px';
                if (isCtrl) SignalState.updateControlPos(targetId, fX, fY);
                else SignalState.updateTextPos(targetId, fX, fY);
            };

            wrap._moveDown = onPointerDown;
            wrap._moveMove = onPointerMove;
            wrap._moveUp = onPointerUp;

            wrap.addEventListener('pointerdown', onPointerDown);
            wrap.addEventListener('pointermove', onPointerMove);
            wrap.addEventListener('pointerup', onPointerUp);
            wrap.addEventListener('pointercancel', onPointerUp);
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
                this.activeModeWrap = null;
                SignalEvents.emit('state:persist');
            }
        }
    };

    window.ConsoleMenu = ConsoleMenu;
})(window);