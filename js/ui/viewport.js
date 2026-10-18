(function(window) {
    'use strict';

    var ViewportUI = {
        svg: null,
        sceneRoot: null,
        defs: null,
        scale: 1,
        panX: 0,
        panY: 0,
        isDragging: false,
        startX: 0,
        startY: 0,
        rafId: null,
        initialDistance: 0,
        baseScale: 1,

        init: function() {
            this.svg = document.getElementById('signalSvg');
            this.sceneRoot = document.getElementById('sceneRoot');
            this.defs = document.getElementById('svgDefs');
            var container = document.getElementById('canvasContainer');

            this.centerView();
            this.bindEvents(container);

            var self = this;
            window.addEventListener('resize', function() { self.centerView(); });

            SignalEvents.on('state:changed', this.renderAll.bind(this));
            SignalEvents.on('state:loaded', this.renderAll.bind(this));
            SignalEvents.on('lamp:updated', this.updateLampFast.bind(this));
            SignalEvents.on('lamp:blink', this.updateBlinkFast.bind(this));
            SignalEvents.on('matrix:updated', this.updateMatrixFast.bind(this));
        },

        centerView: function() {
            var container = document.getElementById('canvasContainer');
            var w = (container && container.clientWidth) ? container.clientWidth : (window.innerWidth / 2);
            var h = (container && container.clientHeight) ? container.clientHeight : (window.innerHeight / 2);
            this.panX = Math.max(100, w / 2);
            this.panY = Math.max(100, h / 2 + 30);
            this.scale = 1.0;
            this.applyTransform();
        },

        applyTransform: function() {
            if (this.sceneRoot) {
                this.sceneRoot.setAttribute('transform', 'translate(' + this.panX + ',' + this.panY + ') scale(' + this.scale + ')');
            }
        },

        scheduleTransform: function() {
            if (this.rafId) return;
            var self = this;
            this.rafId = requestAnimationFrame(function() {
                self.applyTransform();
                self.rafId = null;
            });
        },

        bindEvents: function(container) {
            var self = this;

            container.addEventListener('pointerdown', function(e) {
                if (e.pointerType === 'touch' && !e.isPrimary) return;
                self.isDragging = true;
                self.startX = e.clientX - self.panX;
                self.startY = e.clientY - self.panY;
                container.classList.add('grabbing');
            });

            window.addEventListener('pointermove', function(e) {
                if (!self.isDragging) return;
                self.panX = e.clientX - self.startX;
                self.panY = e.clientY - self.startY;
                self.scheduleTransform();
            });

            window.addEventListener('pointerup', function() {
                self.isDragging = false;
                container.classList.remove('grabbing');
            });

            container.addEventListener('touchstart', function(e) {
                if (e.touches.length === 2) {
                    self.isDragging = false;
                    self.initialDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                    self.baseScale = self.scale;
                }
            }, { passive: true });

            container.addEventListener('touchmove', function(e) {
                if (e.touches.length === 2 && self.initialDistance > 0) {
                    var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                    self.scale = Math.min(3.5, Math.max(0.3, self.baseScale * (dist / self.initialDistance)));
                    self.scheduleTransform();
                }
            }, { passive: true });

            container.addEventListener('wheel', function(e) {
                e.preventDefault();
                var delta = e.deltaY > 0 ? 0.9 : 1.1;
                self.scale = Math.min(3.5, Math.max(0.3, self.scale * delta));
                self.scheduleTransform();
            }, { passive: false });

            document.getElementById('btnZoomIn').addEventListener('click', function() {
                self.scale = Math.min(3.5, self.scale * 1.2);
                self.scheduleTransform();
            });

            document.getElementById('btnZoomOut').addEventListener('click', function() {
                self.scale = Math.max(0.3, self.scale / 1.2);
                self.scheduleTransform();
            });

            document.getElementById('btnZoomReset').addEventListener('click', function() {
                self.centerView();
            });
        },

        renderAll: function() {
            var out = '';
            if (SignalState.mast) out += MastRenderer.render(SignalState.mast);
            for (var i = 0; i < SignalState.shapes.length; i++) out += ShapeRenderer.render(SignalState.shapes[i]);
            for (var f = 0; f < SignalState.feathers.length; f++) {
                var fth = SignalState.feathers[f];
                out += FeatherRenderer.render(fth, SignalState.getLamp(fth.id));
            }
            for (var j = 0; j < SignalState.lamps.length; j++) {
                var l = SignalState.lamps[j];
                out += LampRenderer.render(l, SignalState.getLamp(l.id));
            }
            if (SignalState.matrix && SignalState.matrix.enabled) {
                out += MatrixRenderer.render(SignalState.matrix, SignalState.matrix.text);
            }
            this.sceneRoot.innerHTML = out;
            this.applyTransform();
        },

        updateLampFast: function(payload) {
            var el = this.sceneRoot.querySelector('[data-lamp-id="' + payload.id + '"], [data-feather-id="' + payload.id + '"]');
            if (el) {
                el.classList.toggle('lit', !!payload.lit);
                var litLayer = el.querySelector('.lamp-lit-layer, .feather-lit-layer');
                if (litLayer) litLayer.style.display = payload.lit ? 'inline' : 'none';
            }
        },

        updateBlinkFast: function(payload) {
            var el = this.sceneRoot.querySelector('[data-lamp-id="' + payload.id + '"], [data-feather-id="' + payload.id + '"]');
            if (el) {
                el.classList.toggle('lit', !!payload.visible);
                var litLayer = el.querySelector('.lamp-lit-layer, .feather-lit-layer');
                if (litLayer) litLayer.style.display = payload.visible ? 'inline' : 'none';
            }
        },

        updateMatrixFast: function() {
            var mContainer = this.sceneRoot.querySelector('.theatre-matrix-unit');
            if (mContainer && SignalState.matrix && SignalState.matrix.enabled) {
                mContainer.outerHTML = MatrixRenderer.render(SignalState.matrix, SignalState.matrix.text);
            }
        }
    };

    window.ViewportUI = ViewportUI;
})(window);