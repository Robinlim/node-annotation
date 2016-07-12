# AOP
> AOP为Aspect Oriented Programming的缩写，意为：面向切面编程，通过预编译方式和运行期动态代理实现程序功能的统一维护的一种技术。

##  概念
* Aspect(切面)  一个对关注点处理的模块化。

* PointCut(切入点)  明确需要介入的模块执行的点，目前只支持方法执行时机，参数为

  ```{module:"模块匹配正则,主要匹配模块路径", method:"方法名",interceptor:"如果module的输出是一个class，需要监听其原型方法亦其类成员方法，则此处填写prototype"}```

  当方法不存在的时候会监听所有方法。

* Advice(通知点) 通知类型目前支持"Before"、"After"、"Around","Throws","AfterReturning"。

## 参数

> 传入给处理函数的参数

- Before 将在原函数执行之前执行
  - 原函数的所有参数
- Around 将包裹原函数
  - 原函数的所有参数
  - 最后一个参数为原函数本身（不调用的话原函数将不会执行）
- After 将在原函数return之后执行
  - 第一个参数为原函数的return值
  - 第二个及之后的参数对应原函数的所有参数
- Throws 将在原函数抛出异常时执行（可以捕获大多数异步异常，参见trycatch）
  - 第一个参数为抛出的异常（Error）
  - 第二个及之后的参数对应原函数的所有参数
- AfterReturning 将在原函数的入参中的回调函数执行前执行
  - 原函数的所有参数

## 实例

Knight.js
```javascript
module.exports = {
    hit: function() {
        var self = this;
        console.info('knight hitting!!');
        process.nextTick(function() {
            self.flight(function() {
                console.info('knight flight');
            });
        });
        this.die(new Date(), function(){
            require('fs').readFile('./NotExistFIle');
        });
        return "result";
    },
    flight: function(cb) {
        console.info('knight ready to flight, wait for 1000 ms');
        setTimeout(function() {
            cb();
        }, 1000);
    },
    die: function(time, cbk){
        // console.log('knight die!')
        // throw new Error('knight die');
        // cbk();
        
        setTimeout(function() {
            console.log('knight die!')
            throw new Error('knight die');
        },1000);
    }
};
```
Poet.js
```javascript
/*@Aspect*/
module.exports = {
    /*@PointCut({module:"\/Knight$", method:"hit"})*/
    /*@Before*/
    say: function() {
        console.info('Poet say: knight will hit!!');
    },
    /*@Around*/
    around: function(fn){
        console.info('Poet say: around before');
        var rs = arguments[arguments.length - 1 ]();
        console.info(rs);
        console.info('Poet say: around leave');
        return rs;
    },
    /*@Around*/
    around2: function(fn){
        console.info('Poet say: around before2');
        var rs = arguments[arguments.length - 1 ]();
        console.info(rs);
        console.info('Poet say: around leave2');
        return rs;
    },
    /*@After*/
    result: function(){
        console.info('Poet say: knight hitted!!');
    },
    /*@Throws*/
    hidThrow: function(err){
        console.info('Poet say: knight hit wrong!!', err);
    },
    /*@PointCut({module:"\/Knight$", method:"flight"})*/
    /*@AfterReturning*/
    flight: function(){
        console.info('Poet say: knight will flight!!');
    },
    /*@PointCut({module:"\/Knight$", method:"die"})*/
    /*@Throws*/
    die: function(err, time){
        console.info('Poet say: knight die error!!');
        //console.error(time, err, err.stack);
    }
};
```
Main.js
```javascript
var nodeAnnotation = require('node-annotation');
nodeAnnotation.start(__dirname, function() {
    var knight = require('./Knight');
    knight.hit();
});
```

> 整个Demo参见[node-annotation-example](https://www.npmjs.com/package/node-annotation-example) 中的example/AOP

