(function(window) {
    'use strict';

    var SignalEvents = {
        handlers: {},

        on: function(eventName, callback) {
            if (!this.handlers[eventName]) this.handlers[eventName] = [];
            this.handlers[eventName].push(callback);
            return callback;
        },

        off: function(eventName, callback) {
            if (!this.handlers[eventName]) return;
            this.handlers[eventName] = this.handlers[eventName].filter(function(cb) {
                return cb !== callback;
            });
        },

        emit: function(eventName, payload) {
            var listeners = this.handlers[eventName];
            if (listeners && listeners.length) {
                for (var i = 0; i < listeners.length; i++) listeners[i](payload);
            }
        }
    };

    window.SignalEvents = SignalEvents;
})(window);
