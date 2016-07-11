/**
 * @Author: xin.lin
 * @Date: 15-4-10
 * request mapping, supports the formatter as below
 * @RequestMapping("/goods")
 * @RequestMapping("/ajax/goods/{name}")
 * @RequestMapping(["/goods", "/ajax/goods/{name}"])
 * @RequestMapping({ url : "/goods",method : "post"})
 */
/*@AutoLoad*/
var _ = require('lodash'),
    domain = require('domain'),
    utils = require("../../Utils");

var URLPATTER = /\{([^}]*)\}/g, //url format like /pathname/{name}
    CUSTOME_EXP = /\{/,
    PRE_EXP = "^",
    END_EXP = "/?$";
var RequestMapping = module.exports = require("./Controller").extend({
    /**
     * find the controller of corresponding url
     * @return {[type]} [description]
     */
    execute: function() {
        //do nothing
    },
    /**
     * compile the model
     * @param  {[Model]} model [annotation data]
     * @return {[type]} [description]
     */
    compile: function(model) {
        var po = model.po(),
            type = utils.typeofObject(po).value;
        this.cpMethod(model);
        switch (type) {
            case "[object String]":
                return [this.cpUrl(po)];
            case "[object Array]":
                return this.cpUrls(po);
            case "[object Object]":
                return [this.cpReq(po)];
            default:
                break;
        }
        return;
    },
    /**
     * match the request and export params
     * @param  {[String]} path [url path]
     * @param  {[Request]} req  [request object]
     * @param  {[Response]} res [response object]
     * @return {[Array|Boolean]}
     */
    match: function(path, req, res) {
        var match,found = false;
        this.data.some(function(item, i) {
            if ((match = path.match(item.url)) && this.check(req, item)) {
                found = true;
                return true;
            }
        }, this);
        if(found){
            return match;
        } else {
            return false;
        }
    },
    makeparam: function(req, res, matches){
        var args,
            params,
            funcParams = this.params || [];
        params = this.mix(funcParams, matches.slice(1));
        params.req = params.request = req;
        params.res = params.response = res;
        params.reqData = req.method.toLowerCase() == 'get' ? req.query : req.body;
        args = [];
        _.forEach(funcParams, function(v, i) {
            args.push(params[v]);
        });
        return args;
    },
    /**
     * check the request has right headers
     * @param  {[type]} req [description]
     * @param  {[type]} item [description]
     * @return {[type]}     [description]
     */
    check: function(req, item) {
        if (item.method && item.method.toLowerCase() != req.method.toLowerCase()) {
            return false;
        }
        return true;
    },
    /**
     * execute the module
     * @return {[type]} [description]
     */
    run: function(req, res, matches) {
        var model = this.model,
            instance = model.instance();
        instance[model.vo()].apply(instance, this.makeparam(req, res, matches || []));
    },
    /**
     * compile the method
     * @param  {[type]} model [description]
     * @return {[type]}       [description]
     */
    cpMethod: function(model) {
        this.params = model.voParam();
    },
    /**
     * deal the patter as bellow
     * "/goods"
     * "/goods/{user}"
     * "/goods/{good:00[1~9]*ab}"
     * @param {[String]} url [description]
     * @param {[Boolean]} useExp [if url is a RegExp]
     * @return {[Object]}     [description]
     */
    cpUrl: function(url, useExp) {
        if(useExp){
            return {
                isExp: true,
                url: RegExp(url)
            }
        }
        if (CUSTOME_EXP.test(url)) {
            var data = {
                params: [],
                isExp: true
            };
            // deal "/prefix/..." and store prefix to data.prefix
            var piece = url.split('/'),prefix;
            if((prefix = piece.shift()) == ""){
                prefix = piece.shift();
            }
            if(!URLPATTER.test(prefix)){
                data.prefix = prefix;
                url = piece.join('/');
            }

            data.url = RegExp(PRE_EXP + url.replace(URLPATTER, function($, $1) {
                var pos = $1.indexOf('=');
                if(pos > 0){
                    var varName = $1.slice(0,pos),
                        regStr = $1.slice(pos+1);
                    data.params.push(varName);
                    return "(" + regStr + ")";
                } else {
                    data.params.push($1);
                    return "([^/?]+)";
                }
            }) + END_EXP);
            return data;
        }
        return {
            url: url
        };
    },
    /**
     * deal the patter as bellow
     * ["/goods", "/goods/{user}"] or [{url: "/goods"}]
     * @param  {[type]} po [description]
     * @return {[type]}    [description]
     */
    cpUrls: function(po) {
        var urls = [];
        _.forEach(po, function(v, i) {
            urls.push(utils.typeofObject(v).isObject() ?
                this.cpReq(v) :
                this.cpUrl(v));
        }, this);
        return urls;
    },
    /**
     * deal the patter as bellow
     * {"url": "/goods", "produces":"text/javascript;charset=UTF-8"}
     * @param  {[type]} po [description]
     * @return {[type]}    [description]
     */
    cpReq: function(po) {
        return utils.extend(po, this.cpUrl(po.url, po.useExp));
    },
    /**
     * with two array to generate a map
     * @param  {[Array]} arryKeys   [keys]
     * @param  {[Array]} arryValues [values]
     * @return {[type]}            [description]
     */
    mix: function(arryKeys, arryValues) {
        if (!arryKeys || !arryValues) return {};
        var result = {};
        _.forEach(arryKeys, function(v, i) {
            result[v] = arryValues[i];
        });
        return result;
    }
}, {
    //annotation name
    name: "RequestMapping"
});
