# AOP
AOP为Aspect Oriented Programming的缩写，意为：面向切面编程，通过预编译方式和运行期动态代理实现程序功能的统一维护的一种技术。
##  概念
*	Aspect(切面)  一个对关注点处理的模块化。
* PointCut(切入点)  明确需要介入的模块执行的点，目前只支持方法执行时机，参数为``{module:"模块匹配正则,主要匹配模块路径", method:"方法名"}``。当方法不存在的时候会监听所有方法。
* Advice(通知点) 通知类型目前支持"Before"、"After"、"Around"。

## 实例
Knight.js
```
module.exports = {
    hit: function() {
        console.info('knight hitting!!');
    }
};
```
Poet.js
```
/*@Aspect*/
module.exports = {
    /*@PointCut({module:"\/Knight$", method:"hit"})*/
    /*@Before*/
    say: function() {
        console.info('knight will hit!!');
    },
    /*@Around*/
    around: function(fn){
        console.info('around before');
        arguments[arguments.length - 1 ]();
        console.info('around leave');
    },
    /*@After*/
    result: function(){
        console.info('knight hitted!!');
    }
};
```
Main.js
```
var nodeAnnotation = require('node-annotation');
nodeAnnotation.start(__dirname, function() {
    var knight = require('./Knight');
    knight.hit();
});

```
