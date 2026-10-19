(function(window) {
    'use strict';

    var CreatorUI = {
        container: null,
        drawer: null,
        activeTab: 'plates',

        init: function() {
            this.container = document.getElementById('creatorContent');
            this.drawer = document.getElementById('creatorDrawer');

            document.getElementById('btnToggleCreator').addEventListener('click', this.toggle.bind(this));
            document.getElementById('btnCloseCreator').addEventListener('click', this.close.bind(this));

            SignalEvents.on('state:loaded', this.render.bind(this));
            SignalEvents.on('state:changed', this.renderCurrentTab.bind(this));
        },

        toggle: function() {
            this.drawer.classList.toggle('open');
            if (this.drawer.classList.contains('open')) this.render();
        },

        close: function() {
            this.drawer.classList.remove('open');
        },

        render: function() {
            var html = '';
            html += '<div class="creator-signal-meta">';
            html += '  <div class="meta-action-row">';
            html += '    <input type="text" id="creatorSignalName" class="form-input" style="font-weight:700;" value="' + (SignalState.name || 'New Signal') + '" title="Click to rename signal"/>';
            html += '  </div>';
            html += '  <div class="meta-action-row">';
            html += '    <button id="btnCreatorNew" class="tool-btn btn-primary" style="flex:1;">+ New</button>';
            html += '    <button id="btnCreatorSave" class="tool-btn" style="flex:1;">Save</button>';
            html += '    <button id="btnCreatorLib" class="tool-btn" style="flex:1;">Library</button>';
            html += '  </div>';
            html += '</div>';

            html += '<div class="creator-nav">';
            html += '  <button class="tab-btn ' + (this.activeTab === 'plates' ? 'active' : '') + '" data-tab="plates">Plates</button>';
            html += '  <button class="tab-btn ' + (this.activeTab === 'lamps' ? 'active' : '') + '" data-tab="lamps">Lamps</button>';
            html += '  <button class="tab-btn ' + (this.activeTab === 'routes' ? 'active' : '') + '" data-tab="routes">Routes</button>';
            html += '  <button class="tab-btn ' + (this.activeTab === 'structure' ? 'active' : '') + '" data-tab="structure">Structure</button>';
            html += '</div>';

            html += '<div id="creatorTabBody"></div>';

            this.container.innerHTML = html;
            this.bindMetaEvents();
            this.bindNavTabs();
            this.renderCurrentTab();
        },

        bindMetaEvents: function() {
            var nameInp = document.getElementById('creatorSignalName');
            if (nameInp) {
                nameInp.addEventListener('change', function() {
                    SignalState.name = this.value.trim() || 'Signal';
                    if (window.App && window.App.updateHeaderTitle) window.App.updateHeaderTitle(SignalState.name);
                    SignalEvents.emit('state:persist');
                });
            }

            var btnNew = document.getElementById('btnCreatorNew');
            if (btnNew) {
                btnNew.addEventListener('click', function() {
                    var n = prompt('Enter name for the new signal:', 'New Signal');
                    if (n !== null) {
                        SignalState.newBlankSignal(n.trim() || 'New Signal');
                        if (window.App && window.App.updateHeaderTitle) window.App.updateHeaderTitle(SignalState.name);
                    }
                });
            }

            var btnSave = document.getElementById('btnCreatorSave');
            if (btnSave) {
                btnSave.addEventListener('click', function() {
                    SignalStorage.saveNamed(SignalState.name || 'Custom Signal');
                    alert('Saved ' + SignalState.name + ' successfully.');
                });
            }

            var btnLib = document.getElementById('btnCreatorLib');
            if (btnLib) {
                btnLib.addEventListener('click', function() {
                    var btnOpen = document.getElementById('btnOpenLibrary');
                    if (btnOpen) btnOpen.click();
                });
            }
        },

        bindNavTabs: function() {
            var self = this;
            var tabBtns = this.container.querySelectorAll('.tab-btn');
            for (var t = 0; t < tabBtns.length; t++) {
                tabBtns[t].addEventListener('click', function() {
                    for (var k = 0; k < tabBtns.length; k++) tabBtns[k].classList.remove('active');
                    this.classList.add('active');
                    self.activeTab = this.getAttribute('data-tab');
                    self.renderCurrentTab();
                });
            }
        },

        renderCurrentTab: function() {
            var body = document.getElementById('creatorTabBody');
            if (!body) return;

            if (this.activeTab === 'plates') {
                if (window.CreatorShapes) window.CreatorShapes.render(body);
            } else if (this.activeTab === 'lamps') {
                if (window.CreatorLamps) window.CreatorLamps.render(body);
            } else if (this.activeTab === 'routes') {
                if (window.CreatorRoutes) window.CreatorRoutes.render(body);
            } else if (this.activeTab === 'structure') {
                if (window.CreatorStructure) window.CreatorStructure.render(body);
            }
        }
    };

    window.CreatorUI = CreatorUI;
    window.InspectorUI = CreatorUI;
})(window);