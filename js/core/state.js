(function(window) {
    'use strict';

    var SignalState = {
        id: null,
        name: 'New Signal',
        mast: { type: 'tubular', height: 380, x: 0, y: 0, platform: true, ladder: true },
        shapes: [],
        lamps: [],
        feathers: [],
        matrix: { enabled: false, id: 'ROUTE_BOX', x: 0, y: -140, text: '' },
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
            this.matrix = { enabled: false, id: 'ROUTE_BOX', x: 0, y: -140, text: '' };
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

        load: function(data) {
            if (!data) return;
            this.id = data.id || null;
            this.name = data.name || 'Railway Signal';
            this.mast = data.mast || { type: 'tubular', height: 380, x: 0, y: 0, platform: true, ladder: true };
            this.shapes = data.shapes || [];
            this.lamps = data.lamps || [];
            this.feathers = data.feathers || [];
            this.matrix = data.matrix || { enabled: false, id: 'ROUTE_BOX', x: 0, y: -140, text: '' };
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
            for (var j = 0; j < this.controls.length; j++) {
                var ctrl = this.controls[j];
                this.controlValues[ctrl.id] = ctrl.defaultValue !== undefined ? ctrl.defaultValue : 0;
                if (ctrl.x === undefined) ctrl.x = 20 + j * 90;
                if (ctrl.y === undefined) ctrl.y = 20;
            }
            SignalEvents.emit('state:loaded');
        },

        setLamp: function(lampId, isLit) {
            this.lampStates[lampId] = !!isLit;
            SignalEvents.emit('lamp:updated', { id: lampId, lit: isLit });
        },

        getLamp: function(lampId) {
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
