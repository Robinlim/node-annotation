
Proxy
=====
模块的代理，可以介入到模块方法的执行阶段，但业务操作的时候一般要通过instance()获取原始模块实例再进行操作。**被代理的模块不会立即被加载进来，只有在用的时候才会加载。**
## 方法
*	addMethodInterceptor  
   参数：

| 参数名         |              类型              |        说明 |
| ----------- | :--------------------------: | --------: |
| method      |            String            |  需要介入的方法名 |
| advice      | [PROXYCYCLE](##PROXTYCYCLE)  |      介入阶段 |
| interceptor | [INTERCEPTOR](##INTERCEPTOR) | 需要介入的方法类型 |
| callback    |           Function           |      回调函数 |

*	instance
  获取原始模块实例

##  例子
```
/*@AutoLoad*/
var nodeAnnotation = require('node-annotation');

module.exports = nodeAnnotation.Annotation.extend({
    /**
     *  the annotation affect
     * @return {[void]}
     */
    execute: function() {
        var model = this.model;
        model.exports().addMethodInterceptor(model.vo(), nodeAnnotation.PROXYCYCLE.BEFORE, function(){
            //do something here
        });
    }
}, {
    //annotation name
    name: "Example"
});
```

## PROXYCYCLE

模块实例方法介入时机枚举

- BEFORE(0)  方法执行前
- AFTERRETURNING(1) 方法入参的回调执行前
- AFTER(2) 方法执行后
- AROUND(3)  方法执行前后，BEFORE后，AFTER前的阶段
- THROWS(4) 方法抛出异常时

## INTERCEPTOR

模块介入的方法的类型枚举

- MODULE(0) 介入模块的每个方法
- METHOD(1) 介入普通模块的方法或类模块的静态方法
- PROTORTYPE(2) 介入类模块的成员方法（实际是在模块输出对象的原型链上寻找方法）