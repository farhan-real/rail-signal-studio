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