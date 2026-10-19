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
            SignalEvents.on('state:loaded', function() {
                self.centerView();
                self.renderAll();
            });
            SignalEvents.on('lamp:updated', this.updateLampFast.bind(this));
            SignalEvents.on('lamp:blink', this.updateBlinkFast.bind(this));
            SignalEvents.on('matrix:updated', this.updateMatrixFast.bind(this));
        },

        getSignalBounds: function() {
            var minY = -160, maxY = 380;
            var minX = -35, maxX = 35;

            if (SignalState.mast) {
                var mh = SignalState.mast.height || 380;
                var my = SignalState.mast.y || 0;
                var mx = SignalState.mast.x || 0;
                var mType = SignalState.mast.type || 'tubular';
                var footW = SignalState.mast.footWidth || (mType === 'tubular' ? 64 : 110);
                maxY = Math.max(maxY, my + mh + 15);
                minY = Math.min(minY, my);
                minX = Math.min(minX, mx - footW / 2);
                maxX = Math.max(maxX, mx + footW / 2);
                if (mType === 'gantry') {
                    minX = Math.min(minX, mx - 130);
                    maxX = Math.max(maxX, mx + 90);
                }
            }

            if (SignalState.shapes && SignalState.shapes.length) {
                for (var i = 0; i < SignalState.shapes.length; i++) {
                    var s = SignalState.shapes[i];
                    var sx = s.x !== undefined ? s.x : 0;
                    var sy = s.y !== undefined ? s.y : 0;
                    var sw = s.width || (s.radius ? s.radius * 2 : 60);
                    var sh = s.height || (s.radius ? s.radius * 2 : 40);
                    minY = Math.min(minY, sy);
                    maxY = Math.max(maxY, sy + sh);
                    minX = Math.min(minX, sx);
                    maxX = Math.max(maxX, sx + sw);
                }
            }

            if (SignalState.lamps && SignalState.lamps.length) {
                for (var j = 0; j < SignalState.lamps.length; j++) {
                    var l = SignalState.lamps[j];
                    var lx = l.x !== undefined ? l.x : 0;
                    var ly = l.y !== undefined ? l.y : 0;
                    var lr = (l.diameter || 34) / 2;
                    minX = Math.min(minX, lx - lr);
                    maxX = Math.max(maxX, lx + lr);
                    minY = Math.min(minY, ly - lr);
                    maxY = Math.max(maxY, ly + lr);
                }
            }

            var fb = SignalState.featherBase;
            var hasFeathers = SignalState.feathers && SignalState.feathers.length > 0;
            if (hasFeathers || (fb && fb.enabled)) {
                var hx = (fb && fb.x !== undefined) ? fb.x : 0;
                var hub = window.FeatherRenderer ? window.FeatherRenderer.getHubCenter(fb) : { x: hx, y: -205 };
                minY = Math.min(minY, hub.y - 40);
                minX = Math.min(minX, hx - 125);
                maxX = Math.max(maxX, hx + 125);
            }

            if (SignalState.matrix && SignalState.matrix.enabled) {
                var mat = SignalState.matrix;
                var matX = mat.x !== undefined ? mat.x : 0;
                var matW = mat.size === '2x' ? 80 : 44;
                var matTopY = (window.MatrixRenderer && window.MatrixRenderer.getSignalAssemblyTopY) ?
                    window.MatrixRenderer.getSignalAssemblyTopY() - 65 : -320;
                minY = Math.min(minY, matTopY);
                minX = Math.min(minX, matX - matW / 2);
                maxX = Math.max(maxX, matX + matW / 2);
            }

            var totalW = Math.max(70, maxX - minX);
            var totalH = Math.max(150, maxY - minY);
            return {
                minX: minX,
                maxX: maxX,
                minY: minY,
                maxY: maxY,
                width: totalW,
                height: totalH,
                centerX: (minX + maxX) / 2,
                centerY: (minY + maxY) / 2
            };
        },

        centerView: function() {
            var container = document.getElementById('canvasContainer');
            var w = (container && container.clientWidth) ? container.clientWidth : (window.innerWidth / 2);
            var h = (container && container.clientHeight) ? container.clientHeight : (window.innerHeight / 2);
            var bounds = this.getSignalBounds();
            var pad = 24;
            var availH = Math.max(80, h - pad * 2);
            var availW = Math.max(80, w - pad * 2);

            var fitScaleY = availH / bounds.height;
            var fitScaleX = availW / bounds.width;
            var targetScale = Math.min(fitScaleY, fitScaleX);
            this.scale = Math.min(1.2, Math.max(0.12, Math.round(targetScale * 100) / 100));

            this.panX = Math.round(w / 2 - bounds.centerX * this.scale);
            this.panY = Math.round(h / 2 - bounds.centerY * this.scale);
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
                    if (e.cancelable) e.preventDefault();
                    var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                    self.scale = Math.min(3.5, Math.max(0.1, self.baseScale * (dist / self.initialDistance)));
                    self.scheduleTransform();
                }
            }, { passive: false });

            container.addEventListener('wheel', function(e) {
                e.preventDefault();
                var delta = e.deltaY > 0 ? 0.9 : 1.1;
                self.scale = Math.min(3.5, Math.max(0.1, self.scale * delta));
                self.scheduleTransform();
            }, { passive: false });

            document.getElementById('btnZoomIn').addEventListener('click', function() {
                self.scale = Math.min(3.5, self.scale * 1.2);
                self.scheduleTransform();
            });

            document.getElementById('btnZoomOut').addEventListener('click', function() {
                self.scale = Math.max(0.1, self.scale / 1.2);
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

            var hasFeathers = SignalState.feathers && SignalState.feathers.length > 0;
            var isBaseEnabled = SignalState.featherBase && SignalState.featherBase.enabled;
            if (hasFeathers || isBaseEnabled) {
                out += FeatherRenderer.renderAll(SignalState.feathers || [], function(id) {
                    return SignalState.getLamp(id);
                });
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
            var targetId = String(payload.id).toUpperCase();
            var el = this.sceneRoot.querySelector('[data-lamp-id="' + payload.id + '"], [data-feather-id="' + payload.id + '"]');
            if (!el) {
                var allFeathers = this.sceneRoot.querySelectorAll('[data-feather-id]');
                for (var f = 0; f < allFeathers.length; f++) {
                    if (allFeathers[f].getAttribute('data-feather-id').toUpperCase() === targetId) { el = allFeathers[f]; break; }
                }
            }
            if (!el) {
                var allLamps = this.sceneRoot.querySelectorAll('[data-lamp-id]');
                for (var l = 0; l < allLamps.length; l++) {
                    if (allLamps[l].getAttribute('data-lamp-id').toUpperCase() === targetId) { el = allLamps[l]; break; }
                }
            }
            if (el) {
                el.classList.toggle('lit', !!payload.lit);
                var litLayer = el.querySelector('.lamp-lit-layer, .feather-lit-layer');
                if (litLayer) litLayer.style.display = payload.lit ? 'inline' : 'none';
            }
            if (window.FeatherRenderer && window.FeatherRenderer.updateCommonLamp) {
                window.FeatherRenderer.updateCommonLamp(this.sceneRoot);
            }
        },

        updateBlinkFast: function(payload) {
            var targetId = String(payload.id).toUpperCase();
            var el = this.sceneRoot.querySelector('[data-lamp-id="' + payload.id + '"], [data-feather-id="' + payload.id + '"]');
            if (!el) {
                var allFeathers = this.sceneRoot.querySelectorAll('[data-feather-id]');
                for (var f = 0; f < allFeathers.length; f++) {
                    if (allFeathers[f].getAttribute('data-feather-id').toUpperCase() === targetId) { el = allFeathers[f]; break; }
                }
            }
            if (!el) {
                var allLamps = this.sceneRoot.querySelectorAll('[data-lamp-id]');
                for (var l = 0; l < allLamps.length; l++) {
                    if (allLamps[l].getAttribute('data-lamp-id').toUpperCase() === targetId) { el = allLamps[l]; break; }
                }
            }
            if (el) {
                el.classList.toggle('lit', !!payload.visible);
                var litLayer = el.querySelector('.lamp-lit-layer, .feather-lit-layer');
                if (litLayer) litLayer.style.display = payload.visible ? 'inline' : 'none';
            }
            if (window.FeatherRenderer && window.FeatherRenderer.updateCommonLamp) {
                window.FeatherRenderer.updateCommonLamp(this.sceneRoot);
            }
        },

        updateMatrixFast: function() {
            var mContainer = this.sceneRoot.querySelector('.theatre-matrix-unit');
            if (SignalState.matrix && SignalState.matrix.enabled) {
                var svgStr = MatrixRenderer.render(SignalState.matrix, SignalState.matrix.text);
                try {
                    var parser = new DOMParser();
                    var doc = parser.parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + svgStr + '</svg>', 'image/svg+xml');
                    if (!doc.querySelector('parsererror')) {
                        var newEl = doc.documentElement.firstElementChild;
                        if (mContainer && newEl && mContainer.parentNode) {
                            mContainer.parentNode.replaceChild(document.importNode(newEl, true), mContainer);
                            return;
                        }
                    }
                } catch (e) {}
                this.renderAll();
            }
        }
    };

    window.ViewportUI = ViewportUI;
})(window);