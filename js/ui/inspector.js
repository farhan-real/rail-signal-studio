(function(window) {
    'use strict';

    var InspectorUI = {
        container: null,
        drawer: null,

        init: function() {
            this.container = document.getElementById('inspectorContent');
            this.drawer = document.getElementById('inspectorDrawer');

            document.getElementById('btnToggleInspector').addEventListener('click', this.toggle.bind(this));
            document.getElementById('btnCloseInspector').addEventListener('click', this.close.bind(this));

            SignalEvents.on('state:loaded', this.render.bind(this));
            SignalEvents.on('state:changed', this.render.bind(this));
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
            html += '<div class="inspector-section"><h4>Mounting Mast</h4>';
            html += '<div class="form-group"><label class="form-label">Type</label>';
            html += '<select id="mastTypeSelect" class="form-select">';
            var types = ['tubular', 'lattice', 'gantry', 'dwarf'];
            for (var t = 0; t < types.length; t++) {
                var sel = SignalState.mast.type === types[t] ? 'selected' : '';
                html += '<option value="' + types[t] + '" ' + sel + '>' + types[t] + '</option>';
            }
            html += '</select></div>';
            html += '<div class="form-group"><label class="form-label">Height (px)</label>';
            html += '<input id="mastHeightInput" type="number" class="form-input" value="' + SignalState.mast.height + '"/></div></div>';

            html += '<div class="inspector-section"><h4>Target Plates (' + SignalState.shapes.length + ')</h4>';
            html += '<button id="btnAddPlate" class="console-btn" style="margin-bottom:8px;">+ Add Modular Plate</button>';
            for (var i = 0; i < SignalState.shapes.length; i++) {
                var s = SignalState.shapes[i];
                html += '<div class="part-item"><span>Plate ' + (i + 1) + ' (' + s.type + ')</span>';
                html += '<button class="tool-btn btn-del-shape" data-index="' + i + '">x</button></div>';
            }
            html += '</div>';

            html += '<div class="inspector-section"><h4>Lamps (' + SignalState.lamps.length + ')</h4>';
            html += '<button id="btnAddLamp" class="console-btn" style="margin-bottom:8px;">+ Add Signal Lamp</button>';
            for (var j = 0; j < SignalState.lamps.length; j++) {
                var l = SignalState.lamps[j];
                html += '<div class="part-item"><span>' + l.id + ' (' + l.color + ')</span>';
                html += '<button class="tool-btn btn-del-lamp" data-index="' + j + '">x</button></div>';
            }
            html += '</div>';

            this.container.innerHTML = html;
            this.bindEvents();
        },

        bindEvents: function() {
            var mastSel = document.getElementById('mastTypeSelect');
            if (mastSel) {
                mastSel.addEventListener('change', function() {
                    SignalState.mast.type = this.value;
                    SignalEvents.emit('state:changed');
                });
            }

            var mastH = document.getElementById('mastHeightInput');
            if (mastH) {
                mastH.addEventListener('change', function() {
                    SignalState.mast.height = parseInt(this.value, 10) || 300;
                    SignalEvents.emit('state:changed');
                });
            }

            var btnAddPlate = document.getElementById('btnAddPlate');
            if (btnAddPlate) {
                btnAddPlate.addEventListener('click', function() {
                    SignalState.shapes.push({
                        type: 'rounded-rect',
                        x: -30,
                        y: -100,
                        width: 60,
                        height: 120,
                        corners: [25, 25, 25, 25],
                        fill: '#0d0f14',
                        stroke: '#2c3140'
                    });
                    SignalEvents.emit('state:changed');
                });
            }

            var btnAddLamp = document.getElementById('btnAddLamp');
            if (btnAddLamp) {
                btnAddLamp.addEventListener('click', function() {
                    var id = 'LAMP_' + (SignalState.lamps.length + 1);
                    SignalState.lamps.push({
                        id: id,
                        color: 'red',
                        diameter: 36,
                        x: 0,
                        y: -80 + (SignalState.lamps.length * 40),
                        hood: 'round',
                        brightness: 1.0
                    });
                    SignalEvents.emit('state:changed');
                });
            }

            var delShapes = this.container.querySelectorAll('.btn-del-shape');
            for (var i = 0; i < delShapes.length; i++) {
                delShapes[i].addEventListener('click', function() {
                    var idx = parseInt(this.getAttribute('data-index'), 10);
                    SignalState.shapes.splice(idx, 1);
                    SignalEvents.emit('state:changed');
                });
            }

            var delLamps = this.container.querySelectorAll('.btn-del-lamp');
            for (var j = 0; j < delLamps.length; j++) {
                delLamps[j].addEventListener('click', function() {
                    var lIdx = parseInt(this.getAttribute('data-index'), 10);
                    SignalState.lamps.splice(lIdx, 1);
                    SignalEvents.emit('state:changed');
                });
            }
        }
    };

    window.InspectorUI = InspectorUI;
})(window);
