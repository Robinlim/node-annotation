/**
 * User: xin.lin
 * Date: 15-4-10
 * store the annotation data
 */
'use strict';
var Path = require('path');

var ApplicationContext = require('../ApplicationContext');

var STR_EXP = /^(["'])(.+)\1$/,     //string must in ".."
    JSON_EXP = /^[\[{](.+)[}\]]$/,  //json must in {} or []
    JSONFORMATTER_EXP = /([{,]\s*)(\w+)(\s*:)/g,  //fetch key
    PARAM_EXP = /\s*([^,\s]+)\s*/g; //parameter is (param1, param2)

module.exports = require("../base/Collection")(true, true).extend({
    /**
     * Overwrite the default constructor
     * @param  {[String]} name [annotation name]
     * @param  {[String]} po   [parameter]
     * @param  {[String]} vo   [variable name, maybe it is a function name, or a variable name]
     * @param  {[String]} voParam   [if variable is a function ,this is parameters of the function]
     * @param { [String]} classpath [file path]
     * @return {[type]}  [description]
     */
    constructor: function(name, po, vo, voParam, classpath) {
        this.data = {
            name: name,
            po: this.dealStr(po) || this.dealJson(po),
            vo: vo,
            voParam: voParam,
            classpath: classpath
        };
        var VOPARAM_NAME = 'voParam';
        //generate the quick getter and setter
        for (var attr in this.data) {
            if (attr == VOPARAM_NAME) {
                this[VOPARAM_NAME] = function(value) {
                    if (!value) {
                        return this.data[VOPARAM_NAME];
                    }
                    this.data[VOPARAM_NAME] = this.dealVoParam(value);
                }
                continue;
            }
            this[attr] = function(attr) {
                return function(value) {
                    return attribute.call(this, attr, value);
                }
            }(attr);
        }
    },
    /**
     * deal the string value
     * @param  {[String]} po [parameter for annotation]
     * @return {[String]}    [parameter value]
     */
    dealStr: function(po) {
        if (STR_EXP.test(po)) {
            po = po.substring(1, po.length - 1);
            return po;
        }
    },
    /**
     * deal the json value
     * @param  {[String]} po [parameter for annotation]
     * @return {[JSON]}    [parameter value]
     */
    dealJson: function(po) {
        if (JSON_EXP.test(po)) {
            po = JSON.parse(po.replace(JSONFORMATTER_EXP, function($, $1, $2, $3) {
                return [$1, '"', $2, '"', $3].join("");
            }));
            return po;
        }
    },
    /**
     * deal the function parameters
     * @param  {[String]} params [function parameter]
     * @return {[type]}        [description]
     */
    dealVoParam: function(params) {
        if (params && PARAM_EXP.test(params)) {
            var list = [];
            params.replace(PARAM_EXP, function($, $1) {
                list.push($1);
            });
            return list;
        }
        return null;
    },
    /**
     * return real module instance
     * @return {[type]} [description]
     */
    instance: function() {
        return this.exports().instance();
    },
    /**
     * load the module proxy
     * @param {[boolean]} proxy [whether or not to delegate the module object]
     * @return {[Module]} [js file]
     */
    exports: function(proxy, unuseAlias) {
        if (!this.data.exports) {
            var classpath = this.data.classpath,
                extname = Path.extname(classpath);
            if(proxy){
                this.data.exports = require(classpath);
            }else{
                if(unuseAlias){
                    this.data.exports = ApplicationContext.createBean(classpath);
                } else {
                    this.data.exports = ApplicationContext.createBean(Path.basename(classpath, extname), classpath);
                }
            }
        }
        return this.data.exports;
    }
}, {
    /**
     * create a new instance
     * @param  {[String]} name [annotation name]
     * @param  {[String]} po   [parameter]
     * @param  {[String]} vo   [variable name, maybe it is a function name, or a variable name]
     * @param  {[String]} voParam   [if variable is a function ,this is parameters of the function]
     * @param { [String]} classpath [file path]
     * @return {[Model]}      [model instance]
     */
    create: function(name, po, vo, voParam, classpath) {
        return this.add(new this(name, po, vo, voParam, classpath));
    }

});
/**
 * if value is not exist, then return value, or set the attribute value
 * @param  {[String]} name  [attribute name]
 * @param  {[String]} value [attribute value]
 * @return {[Object]}       [any value]
 */
function attribute(name, value) {
    if (value) {
        return this.data[name] = value;
    }
    return this.data[name];
}
