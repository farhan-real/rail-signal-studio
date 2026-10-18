(function(window) {
    'use strict';

    var App = {
        presetsMap: {
            indian: { data: window.PresetIndian, key: 'indian' },
            french: { data: window.PresetFrench, key: 'french' },
            british: { data: window.PresetBritish, key: 'british' },
            dwarf: { data: window.PresetDwarf, key: 'dwarf' },
            examplesections: { data: window.ExampleSections, key: 'examplesections' },
            examplegroup: { data: window.ExampleGroup, key: 'examplegroup' },
            exampledelay: { data: window.ExampleDelay, key: 'exampledelay' },
            exampleif: { data: window.ExampleIf, key: 'exampleif' },
            exampleknob: { data: window.ExampleKnob, key: 'exampleknob' },
            examplebutton: { data: window.ExampleButton, key: 'examplebutton' },
            examplematrix: { data: window.ExampleMatrix, key: 'examplematrix' },
            examplejump: { data: window.ExampleJump, key: 'examplejump' }
        },

        init: function() {
            this.bindPresets();
            ViewportUI.init();
            InspectorUI.init();
            ConsoleUI.init();
            EditorUI.init();

            this.bindHeader();
            this.bindLibraryModal();
            this.bindPersistence();
            this.loadInitial();
        },

        bindPresets: function() {
            this.presetsMap.indian.data = window.PresetIndian;
            this.presetsMap.french.data = window.PresetFrench;
            this.presetsMap.british.data = window.PresetBritish;
            this.presetsMap.dwarf.data = window.PresetDwarf;
            this.presetsMap.examplesections.data = window.ExampleSections;
            this.presetsMap.examplegroup.data = window.ExampleGroup;
            this.presetsMap.exampledelay.data = window.ExampleDelay;
            this.presetsMap.exampleif.data = window.ExampleIf;
            this.presetsMap.exampleknob.data = window.ExampleKnob;
            this.presetsMap.examplebutton.data = window.ExampleButton;
            this.presetsMap.examplematrix.data = window.ExampleMatrix;
            this.presetsMap.examplejump.data = window.ExampleJump;
        },

        updateHeaderTitle: function(name) {
            var titleEl = document.getElementById('signalTitleBadge');
            if (titleEl && name) {
                titleEl.textContent = name;
            }
        },

        bindHeader: function() {
            var self = this;
            var presetSelect = document.getElementById('presetSelector');

            presetSelect.addEventListener('change', function() {
                var val = this.value;
                if (!val || !self.presetsMap[val]) return;

                var entry = self.presetsMap[val];
                if (entry && entry.data) {
                    SignalState.load(entry.data);
                    self.updateHeaderTitle(entry.data.name || 'Railway Signal');
                    if (EditorUI && EditorUI.compile) EditorUI.compile();
                    if (SignalRuntime.ast && SignalRuntime.ast.aspectList && SignalRuntime.ast.aspectList.length > 0) {
                        SignalRuntime.setAspect(SignalRuntime.ast.aspectList[0]);
                    }
                    SignalRuntime.resume();
                }
            });

            document.getElementById('btnQuickSave').addEventListener('click', function() {
                SignalStorage.saveNamed(SignalState.name || 'Custom Signal');
                alert('Saved ' + SignalState.name + ' successfully.');
            });

            document.getElementById('btnExport').addEventListener('click', function() {
                SignalStorage.exportJson();
            });

            var fileIn = document.getElementById('fileImporter');
            document.getElementById('btnTriggerImport').addEventListener('click', function() {
                fileIn.click();
            });

            fileIn.addEventListener('change', function(e) {
                if (e.target.files && e.target.files[0]) {
                    SignalStorage.importFile(e.target.files[0], function(err, data) {
                        if (err) {
                            alert('Import error: ' + err.message);
                        } else {
                            SignalState.load(data);
                            self.updateHeaderTitle(data.name || 'Imported Signal');
                            presetSelect.value = '';
                        }
                    });
                }
            });
        },

        bindLibraryModal: function() {
            var modal = document.getElementById('libraryModal');
            var btnOpen = document.getElementById('btnOpenLibrary');
            var btnClose = document.getElementById('btnCloseLibrary');
            var btnSaveAs = document.getElementById('btnSaveAs');
            var nameInput = document.getElementById('signalNameInput');
            var self = this;

            btnOpen.addEventListener('click', function() {
                nameInput.value = SignalState.name || '';
                self.renderLibraryList();
                modal.classList.add('open');
            });

            btnCloseLibrary.addEventListener('click', function() {
                modal.classList.remove('open');
            });

            btnSaveAs.addEventListener('click', function() {
                var n = nameInput.value.trim() || 'Custom Signal';
                SignalStorage.saveNamed(n);
                self.updateHeaderTitle(n);
                self.renderLibraryList();
            });
        },

        renderLibraryList: function() {
            var listEl = document.getElementById('savedSignalsList');
            var catalog = SignalStorage.getCatalog();
            var self = this;

            if (catalog.length === 0) {
                listEl.innerHTML = '<div style="color:var(--text-secondary);font-size:12px;">No signals saved yet.</div>';
                return;
            }

            var html = '';
            for (var i = 0; i < catalog.length; i++) {
                var item = catalog[i];
                var dateStr = new Date(item.updatedAt).toLocaleString();
                html += '<div class="saved-item">';
                html += '  <div class="saved-meta"><span class="saved-name">' + item.name + '</span><span class="saved-date">' + dateStr + '</span></div>';
                html += '  <div class="saved-actions">';
                html += '    <button class="tool-btn btn-load-sig" data-id="' + item.id + '">Load</button>';
                html += '    <button class="tool-btn btn-del-sig" data-id="' + item.id + '">&times;</button>';
                html += '  </div>';
                html += '</div>';
            }

            listEl.innerHTML = html;

            var loads = listEl.querySelectorAll('.btn-load-sig');
            for (var j = 0; j < loads.length; j++) {
                loads[j].addEventListener('click', function() {
                    var sData = SignalStorage.loadById(this.getAttribute('data-id'));
                    if (sData) {
                        SignalState.load(sData);
                        self.updateHeaderTitle(sData.name || 'Saved Signal');
                        document.getElementById('presetSelector').value = '';
                        document.getElementById('libraryModal').classList.remove('open');
                    }
                });
            }

            var dels = listEl.querySelectorAll('.btn-del-sig');
            for (var k = 0; k < dels.length; k++) {
                dels[k].addEventListener('click', function() {
                    SignalStorage.deleteById(this.getAttribute('data-id'));
                    self.renderLibraryList();
                });
            }
        },

        bindPersistence: function() {
            SignalEvents.on('state:persist', function() {
                SignalStorage.saveDraft();
            });
            window.addEventListener('beforeunload', function() {
                SignalStorage.saveDraft();
            });
        },

        loadInitial: function() {
            this.bindPresets();
            var presetSelect = document.getElementById('presetSelector');
            var draft = SignalStorage.loadDraft();

            if (draft) {
                SignalState.load(draft);
                this.updateHeaderTitle(draft.name || 'Saved Signal');
                if (presetSelect) presetSelect.value = '';
            } else {
                SignalState.load(window.PresetIndian);
                this.updateHeaderTitle((window.PresetIndian && window.PresetIndian.name) || 'Indian MACLS');
                if (presetSelect) presetSelect.value = 'indian';
            }

            if (EditorUI && EditorUI.compile) {
                EditorUI.compile();
            }
            if (SignalRuntime.ast && SignalRuntime.ast.aspectList && SignalRuntime.ast.aspectList.length > 0) {
                SignalRuntime.setAspect(SignalRuntime.ast.aspectList[0]);
            }
            SignalRuntime.resume();
        }
    };

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', function() { App.init(); });
    } else {
        App.init();
    }

    window.App = App;
})(window);