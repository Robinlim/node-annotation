# Fiber

> 类似ES7的async／awatit语法



## Async

该注解可修饰一个函数，被其修饰的函数将成为一个异步函数，其内部可以采用同步方式调用其他异步函数（使用.await,见下方）。

### Demo

```javascript
var fs = require('./SyncLib').fs,
    path = require('path');
module.exports = {
    /*@AsyncWrap*/
    readFileSync: require('fs').readFile,
     /*@AsyncWrap*/
    sleep: function(ms, cbk){
        setTimeout(cbk, ms);
    },
    /*@Async*/
    do1: function(ms){
        var a = this.readFileSync(path.join(__dirname, './text.txt')).await();
        this.sleep(ms).await();
        return a.toString();
    },
    /*@Async*/
    do2: function(file){
        var a = fs.readFileSync(file).await();
        return a.toString();
    },
    /*@Async*/
    fin: function(ms){
        var a1 = this.do1(ms).await();
        var a2 = this.do2(path.join(__dirname, './main.js')).await();
        return a1;
    }
}
```



## await／then

一个Async函数有两种使用方式：

- 在另一个Async函数中同步调用，调用起.await直接赋值给一个变量即可。

  参见上个Demo

  ​

- 在最外层（因为最外层的函数一定不是一个Async函数，而是一个普通函数），Async函数的结果可以作为一个Promise来使用，调用起.then方法完成后续处理。

  ```javascript

  var main = require('./use.js');// main引用的为上面Demo

  main.fin(3000).then(function(val){
    console.log(val);
  }, function(err){
    console.error(err, err.stack)
  })
  ```

  ​

  ​

## AsyncWrap

该注解修饰一个对象，将其中的callback形式的异步函数转化为Async函数

### 参数

- `multi` 指示一个函数将在err参数后返回不止一个参数,比如`child_process.exec()`，此时将取最后一个参数作为callback
  - type: Boolean
  - default: false
- `suffix` 函数后缀，新转化的函数通过后缀与原函数区别开来，均可使用
  - type: String
  - default: “Sync”
- `stop` 类似 `request`的模块返回的函数本身包含函数成员，阻止此类的递归包裹。
  - type: Boolean
  - default: false

### Demo

```javascript
module.exports = {
    /*@AsyncWrap*/
    fs: require('fs'),
    /*@AsyncWrap({stop:true})*/
    request: require('request')
}
```

> 整个Demo参见[node-annotation-example](https://www.npmjs.com/package/node-annotation-example) 中的example/fiber