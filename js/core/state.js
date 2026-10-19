(function(window) {
    'use strict';

    var GRID = 20;

    var SignalState = {
        id: null,
        name: 'New Signal',
        mast: { type: 'tubular', height: 380, x: 0, y: 0, platform: true, platformX: null, platformY: 45, platformWidth: 54, platformHeight: 6, ladder: true },
        shapes: [],
        lamps: [],
        feathers: [],
        featherBase: { enabled: false, x: 0, y: -196, collarWidth: 32, collarHeight: null, autoConnect: true },
        matrix: { enabled: false, id: 'ROUTE_BOX', x: 0, yOffset: 0, text: '', lit: false },
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
            this.featherBase = { enabled: false, x: 0, y: -196, collarWidth: 32, collarHeight: null, autoConnect: true };
            this.matrix = { enabled: false, id: 'ROUTE_BOX', x: 0, yOffset: 0, text: '', lit: false };
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

        newBlankSignal: function(name) {
            var n = name || 'Custom Signal';
            this.id = 'sig_' + Date.now();
            this.name = n;
            this.mast = { type: 'tubular', height: 380, x: 0, y: -20, platform: true, platformX: null, platformY: 50, platformWidth: 54, platformHeight: 6, ladder: true };
            this.shapes = [
                { id: 'plate_main', name: 'Main Head Plate', type: 'rounded-rect', x: -26, y: -130, width: 52, height: 110, corners: [26, 26, 26, 26], fill: '#0a0d16', stroke: '#262d3e', strokeWidth: 2.5 }
            ];
            this.lamps = [
                { id: 'RED', color: 'red', diameter: 34, x: 0, y: -95, hood: 'round', brightness: 1.0 },
                { id: 'GREEN', color: 'green', diameter: 34, x: 0, y: -45, hood: 'round', brightness: 1.0 }
            ];
            this.feathers = [];
            this.featherBase = { enabled: false, x: 0, y: -196, collarWidth: 32, collarHeight: null, autoConnect: true };
            this.matrix = { enabled: false, id: 'ROUTE_BOX', x: 0, yOffset: 0, text: '', lit: false };
            this.controls = [
                { id: 'SignalLever', type: 'lever', label: 'Signal', color: '#d92525', positions: 2, defaultValue: 0, x: 20, y: 20 }
            ];
            this.texts = [];
            this.groups = {};
            this.variables = {};
            this.enums = {};
            this.script = [
                '%% Aspect Definitions',
                'aspect DANGER {',
                '    unset ALL;',
                '    set RED;',
                '}',
                '',
                'aspect PROCEED {',
                '    unset ALL;',
                '    set GREEN;',
                '}',
                '',
                '%% Interlocking Logic',
                'mainloop {',
                '    if SignalLever is 0 {',
                '        aspect DANGER;',
                '    } else {',
                '        aspect PROCEED;',
                '    }',
                '}'
            ].join('\n');
            this.lampStates = { RED: false, GREEN: false };
            this.controlValues = { SignalLever: 0 };
            SignalEvents.emit('state:loaded');
            SignalEvents.emit('state:persist');
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
            this.featherBase = data.featherBase || {
                enabled: !!(data.feathers && data.feathers.length > 0),
                x: 0, y: -196, collarWidth: 32, collarHeight: null, autoConnect: true
            };
            this.matrix = data.matrix || { enabled: false, id: 'ROUTE_BOX', x: 0, yOffset: 0, text: '', lit: false };
            if (this.matrix.lit === undefined) this.matrix.lit = !!(this.matrix.text);
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
                    if (Math.abs(cy - b.y) < 60 && cx < b.right) cx = b.right;
                }
                ctrl.x = cx;
                ctrl.y = cy;
                placedBoxes.push({ x: cx, y: cy, right: cx + cw });
            }
            SignalEvents.emit('state:loaded');
        },

        setLamp: function(lampId, isLit) {
            if (!lampId) return;
            if (lampId.toUpperCase() === 'MATRIX' && this.matrix) {
                var bVal = !!isLit;
                if (this.matrix.lit === bVal) return;
                this.matrix.lit = bVal;
                SignalEvents.emit('matrix:updated', bVal ? this.matrix.text : '');
                return;
            }
            var boolVal = !!isLit;
            var targetId = lampId;
            var uId = String(lampId).toUpperCase();
            for (var i = 0; i < this.lamps.length; i++) {
                if (this.lamps[i].id.toUpperCase() === uId) { targetId = this.lamps[i].id; break; }
            }
            for (var f = 0; f < this.feathers.length; f++) {
                if (this.feathers[f].id.toUpperCase() === uId) { targetId = this.feathers[f].id; break; }
            }
            for (var c = 0; c < this.controls.length; c++) {
                if (this.controls[c].id.toUpperCase() === uId) { targetId = this.controls[c].id; break; }
            }

            if (this.lampStates[targetId] === boolVal) return;
            this.lampStates[targetId] = boolVal;
            SignalEvents.emit('lamp:updated', { id: targetId, lit: boolVal });
        },

        getLamp: function(lampId) {
            if (!lampId) return false;
            if (lampId.toUpperCase() === 'MATRIX' && this.matrix) return !!this.matrix.lit;
            var uId = String(lampId).toUpperCase();
            if (this.lampStates[lampId] !== undefined) return !!this.lampStates[lampId];
            for (var k in this.lampStates) {
                if (k.toUpperCase() === uId) return !!this.lampStates[k];
            }
            return false;
        },

        setControlValue: function(controlId, value) {
            this.controlValues[controlId] = value;
            SignalEvents.emit('control:changed', { id: controlId, value: value });
        },

        getControlValue: function(controlId) { return this.controlValues[controlId]; },
        getVar: function(name) { return this.variables[name]; },
        setVar: function(name, val) { this.variables[name] = val; },

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