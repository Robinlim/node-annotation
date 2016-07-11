var _ = require('lodash');

var Base = module.exports = function() {};
Base.extend = extend;

/**
 * Extend this Class to create a new one inherithing this one.
 * Also add a helper __super__ object poiting to the parent prototypes methods
 * @param  {Object} protoProps  Prototype properties (available on the instances)
 * @param  {Object} staticProps Static properties (available on the contructor)
 * @return {Object}             New sub class
 */
function extend(protoProps, staticProps) {
    var parent = this;
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && _.has(protoProps, 'constructor')) {
        child = protoProps.constructor;
    } else {
        child = function() {
            return parent.apply(this, arguments);
        };
    }
    _.forEach(staticProps, function(v, k) {
        if (typeof v == 'function') {
            v.$name = k;
        }
    });
    // Add static properties to the constructor function, if supplied.
    _.extend(child, parent, staticProps);

    // Set the prototype chain to inherit from `parent`
    child.prototype = Object.create(parent.prototype, {
        constructor: {
            value: child,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    //call the same method in the prototype chain
    child.prototype.super = function() {
        var parent = this.constructor,
            caller = arguments.callee.caller && arguments.callee.caller,
            args = arguments.length > 0 ? arguments : caller.arguments,
            method = caller.$name || "extend";
        if (!parent) return;
        if (parent[method]) {
            return parent[method].apply(this, args);
        }
        while (parent = parent.constructor) {
            if (parent[method]) {
                return parent[method].apply(this, args);
            }
        }
    };
    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
        _.forEach(protoProps, function(v, k) {
            if (typeof v == 'function') {
                v.$name = k;
            }
        });
        _.extend(child.prototype, protoProps);
    }

    // Set a convenience property in case the parent's prototype is needed
    // later.
    child.__super__ = parent.prototype;
    child.super = function() {
        var parent = child.__super__ && child.__super__.constructor,
            caller = arguments.callee.caller && arguments.callee.caller,
            args = arguments.length > 0 ? arguments : caller.arguments,
            method = caller.$name;
        if (!parent) return;
        if (parent[method]) {
            return parent[method].apply(this, args);
        }
        while (parent = parent.__super__ && parent.__super__.constructor) {
            if (parent[method]) {
                return parent[method].apply(this, args);
            }
        }
    }
    return child;
};
