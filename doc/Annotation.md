# 自定义注解
## 如何被扫描器识别
需要加注解 **AutoLoad** ，这样才会被识别

## 如何成为注解类
需要继承自`require('node-annotation').Annotation`

## 通知点
被该注解修饰的变量会被处理，如果是方法的话，会介入到方法执行的阶段里，目前支持三个阶段：Before,After,Around,请参见 [PROXYCYCLE](./doc/PROXYCYCLE.md)

## 注解数据模型
请参见 [Model](./doc/Model.md)

## 模块代理
请参见 [Proxy](./doc/Proxy.md)

## 模版

```
'use strict';
/*@AutoLoad*/
module.exports =
 require('node-annotation').Annotation.extend({
    /**
     * business realization
     * @return
     */
    execute: function() {
        //注解业务实现
    },
    /**
     * compile the model
     * @param  {[Model]} model [annotation data]
     * @return
     */
    compile: function(model) {
        //处理注解模型参数，返回需要的数据
    }
}, {
    name: 'AnnotationName'
});
```
