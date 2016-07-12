# 自定义注解
## 如何被扫描器识别
需要加注解 **AutoLoad** ，这样才会被识别，参见 [AutoLoad](./doc/annotation/AutoLoad.md)

## 如何成为注解类
需要继承自`require('node-annotation').Annotation`，直接使用其.extend方法即可

> `extend`方法的第一个参数为类的所有成员方法／变量的对象，第二个参数为类的所有静态方法／变量的对象

## 注解数据模型
请参见 [Model](./doc/Model.md)

## 模块代理
请参见 [Proxy](./doc/Proxy.md)

## 模版

```javascript
'use strict';
/*@AutoLoad*/
module.exports =
 require('node-annotation').Annotation.extend({
    /**
     * business realization
     * @return
     */
    execute: function() {
        //注解业务实现，必须在子类中（即这里）重写该方法
      	// 可以在这里使用this.model拿到该注解模型
      	// 可以在这里使用this.data拿到compile的返回结果
        // 可以在这里使用this.traverse(function(){}, this)遍历其所有子注解
        // 这里可以返回一个Promise，方便内部处理异步操作
    },
    /**
     * compile the model
     * @param  {[Model]} model [annotation data]
     * @return
     */
    compile: function(model) {
        //处理注解模型参数，返回需要的数据，可以被this.data取到
    }
}, {
    name: 'AnnotationName'
});
```
