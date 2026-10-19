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
            if (SignalState.mast) {
                var mh = SignalState.mast.height || 380;
                var my = SignalState.mast.y || 0;
                maxY = Math.max(maxY, my + mh + 15);
                minY = Math.min(minY, my);
            }
            if (SignalState.shapes && SignalState.shapes.length) {
                for (var i = 0; i < SignalState.shapes.length; i++) {
                    var s = SignalState.shapes[i];
                    var sy = s.y !== undefined ? s.y : 0;
                    var sh = s.height || (s.radius ? s.radius * 2 : 40);
                    minY = Math.min(minY, sy);
                    maxY = Math.max(maxY, sy + sh);
                }
            }
            if (SignalState.matrix && SignalState.matrix.enabled) {
                var matTopY = (window.MatrixRenderer && window.MatrixRenderer.getSignalAssemblyTopY) ?
                    window.MatrixRenderer.getSignalAssemblyTopY() - 65 : -320;
                minY = Math.min(minY, matTopY);
            } else if (SignalState.feathers && SignalState.feathers.length) {
                minY = Math.min(minY, -280);
            }
            return { minY: minY, maxY: maxY, height: Math.max(160, maxY - minY), centerY: (minY + maxY) / 2 };
        },

        centerView: function() {
            var container = document.getElementById('canvasContainer');
            var w = (container && container.clientWidth) ? container.clientWidth : (window.innerWidth / 2);
            var h = (container && container.clientHeight) ? container.clientHeight : (window.innerHeight / 2);
            var bounds = this.getSignalBounds();
            var availH = Math.max(100, h - 30);
            var availW = Math.max(100, w - 30);

            var fitScaleY = availH / bounds.height;
            var fitScaleX = availW / 260;
            var targetScale = Math.min(fitScaleY, fitScaleX);
            this.scale = Math.min(1.0, Math.max(0.28, Math.round(targetScale * 100) / 100));

            this.panX = Math.round(w / 2);
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
                    var dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                    self.scale = Math.min(3.5, Math.max(0.2, self.baseScale * (dist / self.initialDistance)));
                    self.scheduleTransform();
                }
            }, { passive: true });

            container.addEventListener('wheel', function(e) {
                e.preventDefault();
                var delta = e.deltaY > 0 ? 0.9 : 1.1;
                self.scale = Math.min(3.5, Math.max(0.2, self.scale * delta));
                self.scheduleTransform();
            }, { passive: false });

            document.getElementById('btnZoomIn').addEventListener('click', function() {
                self.scale = Math.min(3.5, self.scale * 1.2);
                self.scheduleTransform();
            });

            document.getElementById('btnZoomOut').addEventListener('click', function() {
                self.scale = Math.max(0.2, self.scale / 1.2);
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