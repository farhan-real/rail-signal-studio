(function(window) {
    'use strict';

    var SignalStorage = {
        CATALOG_KEY: 'rail_signal_studio_catalog',
        DRAFT_KEY: 'rail_signal_studio_draft',
        ITEM_PREFIX: 'rail_signal_studio_item_',

        getCatalog: function() {
            try {
                var raw = localStorage.getItem(this.CATALOG_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                return [];
            }
        },

        saveCatalog: function(catalog) {
            try {
                localStorage.setItem(this.CATALOG_KEY, JSON.stringify(catalog));
            } catch (e) {}
        },

        packState: function(name) {
            return {
                id: SignalState.id || ('sig_' + Date.now()),
                name: name || SignalState.name,
                updatedAt: new Date().toISOString(),
                mast: SignalState.mast,
                shapes: SignalState.shapes,
                lamps: SignalState.lamps,
                feathers: SignalState.feathers,
                matrix: SignalState.matrix,
                controls: SignalState.controls,
                texts: SignalState.texts,
                script: SignalState.script
            };
        },

        saveNamed: function(name) {
            var data = this.packState(name);
            SignalState.id = data.id;
            SignalState.name = data.name;

            try {
                localStorage.setItem(this.ITEM_PREFIX + data.id, JSON.stringify(data));
                var catalog = this.getCatalog();
                catalog = catalog.filter(function(c) { return c.id !== data.id; });
                catalog.unshift({ id: data.id, name: data.name, updatedAt: data.updatedAt });
                this.saveCatalog(catalog);
                this.saveDraft();
                return true;
            } catch (err) {
                console.error(err);
                return false;
            }
        },

        loadById: function(id) {
            try {
                var raw = localStorage.getItem(this.ITEM_PREFIX + id);
                if (raw) return JSON.parse(raw);
            } catch (e) {}
            return null;
        },

        deleteById: function(id) {
            try {
                localStorage.removeItem(this.ITEM_PREFIX + id);
                var catalog = this.getCatalog().filter(function(c) { return c.id !== id; });
                this.saveCatalog(catalog);
                return true;
            } catch (e) {
                return false;
            }
        },

        saveDraft: function() {
            try {
                var data = this.packState();
                localStorage.setItem(this.DRAFT_KEY, JSON.stringify(data));
            } catch (e) {}
        },

        loadDraft: function() {
            try {
                var raw = localStorage.getItem(this.DRAFT_KEY);
                if (raw) {
                    var data = JSON.parse(raw);
                    if (data && data.script && typeof data.script === 'string' && data.script.indexOf('aspect') !== -1) {
                        if (data.name && data.name.indexOf('Indian') !== -1) {
                            if (window.PresetIndian) {
                                data.shapes = window.PresetIndian.shapes;
                                data.lamps = window.PresetIndian.lamps;
                                data.feathers = window.PresetIndian.feathers;
                                data.matrix = window.PresetIndian.matrix;
                                data.controls = window.PresetIndian.controls;
                                data.script = window.PresetIndian.script;
                            }
                        } else if (data.name && (data.name.indexOf('Dwarf') !== -1 || data.name.indexOf('Shunt') !== -1)) {
                            if (window.PresetDwarf) {
                                data.mast = window.PresetDwarf.mast;
                                data.shapes = window.PresetDwarf.shapes;
                                data.lamps = window.PresetDwarf.lamps;
                                data.controls = window.PresetDwarf.controls;
                                data.script = window.PresetDwarf.script;
                            }
                        } else if (data.name && data.name.indexOf('British') !== -1) {
                            if (window.PresetBritish) {
                                data.shapes = window.PresetBritish.shapes;
                                data.lamps = window.PresetBritish.lamps;
                                data.matrix = window.PresetBritish.matrix;
                                data.controls = window.PresetBritish.controls;
                                data.script = window.PresetBritish.script;
                            }
                        } else if (data.name && data.name.indexOf('French') !== -1) {
                            if (window.PresetFrench) {
                                data.shapes = window.PresetFrench.shapes;
                                data.lamps = window.PresetFrench.lamps;
                                data.controls = window.PresetFrench.controls;
                                data.script = window.PresetFrench.script;
                            }
                        } else if (data.name && data.name.indexOf('Group') !== -1) {
                            if (window.ExampleGroup) {
                                data.shapes = window.ExampleGroup.shapes;
                                data.lamps = window.ExampleGroup.lamps;
                                data.feathers = window.ExampleGroup.feathers;
                                data.matrix = window.ExampleGroup.matrix;
                                data.controls = window.ExampleGroup.controls;
                                data.script = window.ExampleGroup.script;
                            }
                        } else if (data.name && data.name.indexOf('Section') !== -1) {
                            if (window.ExampleSections) {
                                data.shapes = window.ExampleSections.shapes;
                                data.lamps = window.ExampleSections.lamps;
                                data.feathers = window.ExampleSections.feathers;
                                data.matrix = window.ExampleSections.matrix;
                                data.controls = window.ExampleSections.controls;
                                data.script = window.ExampleSections.script;
                            }
                        } else if (data.name && data.name.indexOf('Matrix') !== -1) {
                            if (window.ExampleMatrix) {
                                data.shapes = window.ExampleMatrix.shapes;
                                data.lamps = window.ExampleMatrix.lamps;
                                data.feathers = window.ExampleMatrix.feathers;
                                data.matrix = window.ExampleMatrix.matrix;
                                data.controls = window.ExampleMatrix.controls;
                                data.script = window.ExampleMatrix.script;
                            }
                        } else if (data.name && data.name.indexOf('Jump') !== -1) {
                            if (window.ExampleJump) {
                                data.shapes = window.ExampleJump.shapes;
                                data.lamps = window.ExampleJump.lamps;
                                data.controls = window.ExampleJump.controls;
                                data.script = window.ExampleJump.script;
                            }
                        }
                        return data;
                    }
                }
            } catch (e) {}
            return null;
        },

        exportJson: function() {
            var data = this.packState();
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = (data.name.replace(/[^a-zA-Z0-9]/g, '') || 'Signal') + '.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        importFile: function(file, callback) {
            var reader = new FileReader();
            reader.onload = function(e) {
                try {
                    var data = JSON.parse(e.target.result);
                    if (data && (data.lamps || data.shapes || data.script)) {
                        callback(null, data);
                    } else {
                        callback(new Error('Invalid railway signal JSON'));
                    }
                } catch (err) {
                    callback(err);
                }
            };
            reader.onerror = function() {
                callback(new Error('Failed to read file'));
            };
            reader.readAsText(file);
        }
    };

    window.SignalStorage = SignalStorage;
})(window);