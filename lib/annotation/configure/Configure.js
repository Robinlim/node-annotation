/**
 * User: xin.lin
 * Date: 16-01-04
 * load the configure file
 * Configure('settings') or Configure('file path relative to configure path | settings')
 * 同步加载全部config
 */
'use strict';
/*@AutoLoad*/
var Path = require('path'),
    fs = require('fs'),
    _ = require('lodash'),
    Logger = require('../../Logger'),
    ApplicationContext = require('../../ApplicationContext'),
    Utils = require('../../Utils');

var _configs = {}, _fileConfigs = {};
var Configure = module.exports = require("../Annotation").extend({
    /**
     *  the annotation affect
     * @return {[type]} [description]
     */
    execute: function() {
        var model = this.model,
            po = model.po(),
            proxy = model.exports();

        if (!po){
            proxy.instance()[model.vo()] = _configs;
            return;
        }

        var settings = po.split('|'), configs = _configs;
        if(settings.length == 2){
            configs = _fileConfigs[settings[0]];
            po = settings[1];
        }
        proxy.instance()[model.vo()] = _.get(configs, po);       
    }
}, {
    //annotation name
    name: "Configure",
    /**
     * load the configure files
     * @return [void]
     */
    init: function() {
        var configurePath = ApplicationContext.configurePath();
        try {
            fs.accessSync(configurePath, fs.R_OK);
        } catch (e) {
            Logger.warn('未配置resource文件夹或没有读取权限，@Configure注解将无法生效');
            return;
        }
        Utils.recursiveDirsSync(configurePath, function(content, filename) {
            try {
                _configs = _.merge(_configs, (_fileConfigs[filename.replace(configurePath + Path.sep, "")] = JSON.parse(content)), function(arry1, arry2) {
                    if (_.isArray(arry1)) {
                        return arry1.concat(arry2);
                    }
                });
            } catch (e) {
                Logger.error(e);
            }
        })
        Logger.log("全部配置项：\n",_configs,_fileConfigs)
    }
});
Configure.init();
