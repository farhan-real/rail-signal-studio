(function(window) {
    'use strict';

    var GRID = 20;

    var SignalState = {
        id: null,
        name: 'New Signal',
        mast: { type: 'tubular', height: 380, x: 0, y: 0, platform: true, ladder: true },
        shapes: [],
        lamps: [],
        feathers: [],
        matrix: { enabled: false, id: 'ROUTE_BOX', x: 0, y: -140, text: '', lit: false },
        controls: [],
        texts: [],
        groups: {},
        variables: {},
        enums: {},
        script: '',
        currentAspect: 'UNSET',
        lampStates: {},
        controlValues: {},

        reset: function() {
            this.id = null;
            this.name = 'New Signal';
            this.shapes = [];
            this.lamps = [];
            this.feathers = [];
            this.matrix = { enabled: false, id: 'ROUTE_BOX', x: 0, y: -140, text: '', lit: false };
            this.controls = [];
            this.texts = [];
            this.groups = {};
            this.variables = {};
            this.enums = {};
            this.script = '';
            this.currentAspect = 'UNSET';
            this.lampStates = {};
            this.controlValues = {};
            SignalEvents.emit('state:changed');
        },

        getControlWidth: function(c) {
            if (!c) return 100;
            if (c.type === 'knob') return 160;
            if (c.type === 'led') return 80;
            return 100;
        },

        load: function(data) {
            if (!data) return;
            this.id = data.id || null;
            this.name = data.name || 'Railway Signal';
            this.mast = data.mast || { type: 'tubular', height: 380, x: 0, y: 0, platform: true, ladder: true };
            this.shapes = data.shapes || [];
            this.lamps = data.lamps || [];
            this.feathers = data.feathers || [];
            this.matrix = data.matrix || { enabled: false, id: 'ROUTE_BOX', x: 0, y: -140, text: '', lit: false };
            if (this.matrix.lit === undefined) {
                this.matrix.lit = !!(this.matrix.text);
            }
            this.controls = data.controls || [];
            this.texts = data.texts || [];
            this.groups = data.groups || {};
            this.variables = data.variables || {};
            this.enums = data.enums || {};
            this.script = data.script || '';
            this.currentAspect = 'UNSET';
            this.lampStates = {};
            this.controlValues = {};

            for (var i = 0; i < this.lamps.length; i++) this.lampStates[this.lamps[i].id] = false;
            for (var f = 0; f < this.feathers.length; f++) this.lampStates[this.feathers[f].id] = false;

            var placedBoxes = [];
            for (var j = 0; j < this.controls.length; j++) {
                var ctrl = this.controls[j];
                this.controlValues[ctrl.id] = ctrl.defaultValue !== undefined ? ctrl.defaultValue : 0;
                var cx = ctrl.x !== undefined ? ctrl.x : (20 + j * 120);
                var cy = ctrl.y !== undefined ? ctrl.y : 20;
                cx = Math.round(cx / GRID) * GRID;
                cy = Math.round(cy / GRID) * GRID;
                var cw = this.getControlWidth(ctrl);

                for (var p = 0; p < placedBoxes.length; p++) {
                    var b = placedBoxes[p];
                    if (Math.abs(cy - b.y) < 60) {
                        if (cx < b.right) {
                            cx = b.right;
                        }
                    }
                }
                ctrl.x = cx;
                ctrl.y = cy;
                placedBoxes.push({ x: cx, y: cy, right: cx + cw });
            }
            SignalEvents.emit('state:loaded');
        },

        setLamp: function(lampId, isLit) {
            if (lampId && lampId.toUpperCase() === 'MATRIX' && this.matrix) {
                var bVal = !!isLit;
                if (this.matrix.lit === bVal) return;
                this.matrix.lit = bVal;
                SignalEvents.emit('matrix:updated', bVal ? this.matrix.text : '');
                return;
            }
            var boolVal = !!isLit;
            if (this.lampStates[lampId] === boolVal) return;
            this.lampStates[lampId] = boolVal;
            SignalEvents.emit('lamp:updated', { id: lampId, lit: boolVal });
        },

        getLamp: function(lampId) {
            if (lampId && lampId.toUpperCase() === 'MATRIX' && this.matrix) {
                return !!this.matrix.lit;
            }
            return !!this.lampStates[lampId];
        },

        setControlValue: function(controlId, value) {
            this.controlValues[controlId] = value;
            SignalEvents.emit('control:changed', { id: controlId, value: value });
        },

        getControlValue: function(controlId) {
            return this.controlValues[controlId];
        },

        getVar: function(name) {
            return this.variables[name];
        },

        setVar: function(name, val) {
            this.variables[name] = val;
        },

        updateControlPos: function(id, x, y) {
            for (var i = 0; i < this.controls.length; i++) {
                if (this.controls[i].id === id) {
                    this.controls[i].x = x;
                    this.controls[i].y = y;
                    SignalEvents.emit('state:persist');
                    break;
                }
            }
        },

        updateTextPos: function(id, x, y) {
            for (var i = 0; i < this.texts.length; i++) {
                if (this.texts[i].id === id) {
                    this.texts[i].x = x;
                    this.texts[i].y = y;
                    SignalEvents.emit('state:persist');
                    break;
                }
            }
        },

        updateTextContent: function(id, text) {
            for (var i = 0; i < this.texts.length; i++) {
                if (this.texts[i].id === id) {
                    this.texts[i].text = text;
                    SignalEvents.emit('state:persist');
                    break;
                }
            }
        },

        removeControl: function(id) {
            this.controls = this.controls.filter(function(c) { return c.id !== id; });
            delete this.controlValues[id];
            SignalEvents.emit('control:removed', id);
            SignalEvents.emit('state:changed');
        },

        removeText: function(id) {
            this.texts = this.texts.filter(function(t) { return t.id !== id; });
            SignalEvents.emit('text:removed', id);
            SignalEvents.emit('state:changed');
        }
    };

    window.SignalState = SignalState;
})(window);