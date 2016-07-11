/**
 * @Author: xin.lin
 * @Date: 15-4-21
 * auto load the module
 *
 * @AutoLoad("1")
 */
var _SortedCol = require("../../base/_SortedCol"),
    utils = require("../../Utils"),
    Logger = require('../../Logger');

var AutoLoad = module.exports = require('../Annotation').extend({
    /**
     * compile the model
     * @param  {[Model]} model [annotation data]
     * @return {[type]} [description]
     */
    compile: function(model) {
        var po = model.po(),
            order = parseInt(po);
        order = isNaN(order)? Infinity : order;
        AutoLoad.addSort(this, order);
        return order;
    },
    execute: function(){
        if(AutoLoad.exportFlag){
            AutoLoad.sortAutoLoads.traverse(function(i, item, order){
                Logger.info(order, item.model.classpath());
                item.model.exports(false, true);
            });
            AutoLoad.exportFlag = false;
        }
    }
},
{
    //annotation name
    name: 'AutoLoad',
    sortAutoLoads: null, // 一个有序数组，会在插入时整理顺序
    exportFlag: true, // autoload模块是否需要被加载，为false表示已被加载完无需重复加载
    addSort: function(item, order){
        if(!this.sortAutoLoads){
            this.sortAutoLoads = new _SortedCol(true);
        }
        this.sortAutoLoads.add(item, order);
    }
});
