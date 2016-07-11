Proxy
=====
模块的代理，可以介入到模块方法的执行阶段，但业务操作的时候一般要通过instance()获取原始模块实例再进行操作。**被代理的模块不会立即被加载进来，只有在用的时候才会加载。**
## 方法
*	addMethodInterceptor  
 参数：

| 参数名  |类型     | 说明           |
| -------|:------:| --------------:|
|method  |String  | 需要介入的方法名  |
|advice  |[PROXYCYCLE](./doc/PROXYCYCLE.md)|   介入阶段 |
|callback|Function| 回调函数 |

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
