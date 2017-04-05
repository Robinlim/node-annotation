/**
 * @Author: xin.lin
 * @Date: 15-4-10
 * annotation base, all others will extend here
 *  if you want to use the annotation to control your code, you must obey code format as below:
 *  \/*@Controller*\/
 *  \/@RequestMapping("/")\/
 *  module.exports = {
 *  	\/* @RequestMapping("/users")\/
 *  	list: function(request, response){},
 *  	\/* @RequestMapping("/users/{name}")\/
 *  	user: function(name, request, response){}
 *  }
 *
 * three steps to follow:
 * 1. recognize the annotation
 * 2. store the relative data for annotation
 * 3. execute the annotation
 *
 */
var Promise = require('promise'),
    _ = require('lodash'),
    Class = require("../base/Class");

var Annotation = module.exports = require("../base/Collection")(true, true).extend(
    //instance method
    {
        /**
         * Overwrite the default constructor
         * @param  {[Model]} model [annotation data]
         * @return {[type]}         [description]
         */
        constructor: function(model) {
            this.data = this.compile(model);
            this.model = model;
        },
        /**
         *  the annotation affect
         *  allow no return or return a Promise
         * @return {[type]} [nil|Promise]
         */
        execute: function() {
            //do something by children
        },
        /**
         *  the annotation affect
         *  traverse apply execute to each annotation instance
         * @return {[type]} [description]
         */
        affectAnnotation: function() {
            var bulk = [];
            this.traverse(function(i, instance) {
                var res = instance.affectAnnotation();
                if(isPromise(res)){
                    bulk.push(res);
                }
            }, this);
            var cur = this.execute();
            return isPromise(cur)?
                cur.then(function(){
                    return Promise.all(bulk);
                }) : Promise.all(bulk);
        },
        /**
         * compile the model
         * @param  {[Model]} model [annotation data]
         * @return {[type]} [description]
         */
        compile: function(model) {
            return model;
        }
    },
    //static method
    {
        //annotation name
        // Function.prototype['name'] is anti-writable , use aname instead
        aname: "",
        /**
         *  parse the annotation content
         * @param  {[Iterator[Model]]} ms  [iterator of model data]
         * @param  {[Model]]} model  [annotation data]
         * @param {[Array<Annotation>]} annotations [description]
         * @return {[type]}       [description]
         */
        parse: function(ms, model, annotations) {
            if (!ms.hasNext() && !model) return;
            var annotation;
            if (!model) {
                model = ms.next();
            }
            if (!annotations) {
                annotations = [];
            }
            //create root node
            if (this == Annotation) {
                this.isEmpty() && this.create();
            }
            annotation = this.annotations(model.name());

            if (annotation) {
                //create annotation instance tree
                annotations.unshift(annotation);
                this.current().add(annotation.create(model));
                return annotation.parse(ms, null, annotations);
            }

            if (this == Annotation) {
                _.forEach(annotations, function(item) {
                    if (annotation = item.annotations(model.name())) {
                        annotation.parse(ms, model, annotations);
                        return false;
                    }
                });
                if (!annotation) {
                    this.parse(ms, ms.next(), annotations);
                }
                return;
            }
            // 使用 parent() 替代了__super__.constructor
            // return this.__super__.constructor.parse(ms, model, annotations);
            return this.parent().parse(ms, model, annotations);
        },
        /**
         * get annotation instance
         * @param  {[Model]} model [annotation data]
         * @return {[type]} [description]
         */
        create: function(model) {
            return this.add(new this(model));
        },
        /**
         * get or set _parent(means its parent class by extend) of current annotaionClass
         * @param  {[type]} parent [description]
         * @return {[type]}        [description]
         */
        parent: function(parent){
            if(parent){
                this._parent = parent;
            }
            return this._parent;
        },
        /**
         * subclass will be added here
         * @param  {[type]} protoProps  [description]
         * @param  {[type]} staticProps [description]
         * @return {[type]}             [description]
         */
        extend: function(protoProps, staticProps) {
            // allow use 'name' to define 'aname'
            staticProps.aname = staticProps.aname || staticProps.name;
            var AnnotationClass = Class.extend.apply(this, arguments);
            //静态方法多重继承不适合集合方式存储
            AnnotationClass._annotations = {};
            AnnotationClass._children = [];
            //追加_parent方便子类实例查找父类
            AnnotationClass._parent = this;
            return this.addAnnotation(staticProps.name, AnnotationClass);
        },
        /**
         * add annotation
         * @param {[type]} annotation [description]
         */
        addAnnotation: function(name, annotation) {
            return this.annotations()[name] = annotation;
        },
        /**
         * fetch the annotation by name or all annotations if name not exist
         * @return {[Annotation]} [description]
         */
        annotations: function(key) {
            if (!this._annotations) {
                this._annotations = {};
            }
            return key ? this._annotations[key] : this._annotations;
        },
        /**
         * traverse all annotations
         * @param  {Function} fn      [description]
         * @param  {[type]}   context [description]
         * @return {[type]}           [description]
         */
        traverseAnnotations: function(fn, context) {
            var annotations = this.annotations();
            for (var attr in annotations) {
                if (fn.call(context || this, attr, annotations[attr]) === false) break;
            }
        }
    });

function isPromise(p){
    // return p && (p instance of Promise)
    // 使用其他promise库构造的promise对象不能如上判断，改为判断then方法
    return p && typeof p.then == 'function';
}
