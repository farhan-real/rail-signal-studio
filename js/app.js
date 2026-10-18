(function(window) {
    'use strict';

    var App = {
        init: function() {
            ViewportUI.init();
            InspectorUI.init();
            ConsoleUI.init();
            EditorUI.init();

            this.bindHeader();
            this.bindLibraryModal();
            this.bindPersistence();
            this.loadInitial();
        },

        bindHeader: function() {
            var presetSelect = document.getElementById('presetSelector');
            presetSelect.addEventListener('change', function() {
                var val = this.value;
                if (val === 'indian') SignalState.load(PresetIndian);
                else if (val === 'french') SignalState.load(PresetFrench);
                else if (val === 'british') SignalState.load(PresetBritish);
                else if (val === 'dwarf') SignalState.load(PresetDwarf);
                else if (val === 'examplesections') SignalState.load(ExampleSections);
                else if (val === 'examplegroup') SignalState.load(ExampleGroup);
                else if (val === 'exampleif') SignalState.load(ExampleIf);
                else if (val === 'exampleknob') SignalState.load(ExampleKnob);
                else if (val === 'examplebutton') SignalState.load(ExampleButton);
                else if (val === 'examplematrix') SignalState.load(ExampleMatrix);
                else if (val === 'examplejump') SignalState.load(ExampleJump);
                presetSelect.value = '';
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
                        if (err) alert('Import error: ' + err.message);
                        else SignalState.load(data);
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
            var draft = SignalStorage.loadDraft();
            if (draft) {
                SignalState.load(draft);
            } else {
                SignalState.load(PresetIndian);
            }
        }
    };

    window.addEventListener('DOMContentLoaded', function() {
        App.init();
    });

    window.App = App;
})(window);
