# Controller

> 控制器相关,继承自 [Component](./DI.md),在该注解下才可以使用下述的子注解

## RequestMapping

> 作用类似于express的router中间件，被注解的函数将收到注解描述的url规则的请求

### 路由规则及优先级 

- 路由匹配的优先级为 

  纯字符串路由(eg: /goods/aaa) > 一级前缀路由(eg:/goods/{name}) > 纯正则路由(eg: {url:"^goods\\\/[a-z]*$",useExp:true})

- 同一优先级内按书写先后顺序。

- 跨controller的优先级按controller加载顺序。

- 对于任意路由规则都没有匹配到时，如果你定义了路径为“/404”的路由规则，则301重定向过去，否则，直接返回404 NotFound。

### 注解参数

| URL Pattern                              | 功能                                       |
| ---------------------------------------- | ---------------------------------------- |
| /goods                                   | 仅匹配该url                                  |
| /goods/{name}                            | 匹配该路由，并将｛name｝占位符对应的参数作为请求处理函数中名为｀name｀的形参传入 |
| /regParam/{code=[1-9]*ab}                | 匹配该路由，并将＝后面的正则匹配的参数作为请求处理函数中名为｀code｀的形参传入 |
| /multiReg/v-{code=00[1-9]*ab}-t-{type=[A-Z]+0} | 同上，正则匹配参数不仅可以在／之间，还可以在其内，并可食用多个          |
| ^\\\/re[g]?$   (需要配置useExp: true)        | 匹配正则对应的url                               |
| {url: "/goods", method: "post"}          | 仅匹配post的该url请求                           |



| 参数类型   | 举例                                       | 说明         |
| ------ | ---------------------------------------- | ---------- |
| String | @RequestMapping("/goods")                | －          |
| Object | @RequestMapping({ url : "/goods",method : "post"})<br>@RequestMapping({url:"^\\\/re[g]?$", useExp:true}) | 满足对象的所有条件  |
| Array  | @RequestMapping([{url: "/animals", method: "post"},{url: "/allAnimals"}])<br>@RequestMapping(["/goods", "/ajax/goods/{name}"] | 匹配数组中的任一规则 |

### 处理函数参数

> 是通过传入的形参的名称来做参数注入的，与参数位置无关

| name                                | value                                    |
| ----------------------------------- | ---------------------------------------- |
| req/request                         | express.requset                          |
| res/reponse                         | exrepss.reponse                          |
| reqData                             | request.body + request.query(不区分post／get方式取参数) |
| other(urlPattern中通过形如｛name｝描述的参数注入) | ｛name｝占位或｛name＝XX｝匹配的参数                  |

## ResponseBody

> 修饰请求处理参数中res.end的返回，将对象作一遍JSON.stringify包裹

## ExceptionHandler

> 错误处理函数,可以捕获请求处理函数内的同步以及异步错误

### 注解参数

- 无参数：将处理该controller下的所有请求处理函数的异常
- value型：将处理Error.msg=value的错误（因为正常的new Error(msg)中仅能向Error传入一个参数作为Error的msg）
- key=value型：将处理Error[key]=value的错误（系统错误通常会带上code，例如找不到文件这一错误会是code=ENOENT）

### 处理函数参数

将传入三个参数，依次为异常的Error对象，请求request，请求response

### 注意事项

- 有一种情形下的异步错误无法捕获：在请求处理函数内调用了在其外定义的静态异步方法

- 对于Promise，由于Promise内的异常被Promise本身捕获了，如果希望暴露出来，推荐改写／追加（nodejs原生的Promise无done方法，一般Promise／A+库均包含）的done方法：

  ```javascript
  Promise.prototype.done = function (onFulfilled, onRejected) {
    var self = arguments.length ? this.then.apply(this, arguments) : this
    if (process.domain) {
      process.domain.emit('error', err)
    } else {
      self.then(null, function (err) {
        setTimeout(function () {
          throw err
        }, 0)
      })
    }
  }
  ```

  然后在希望抛出错误的Promise最后调用.done()方法。

# ControllerAdvice

> 控制器增强，可以在其内使用@ExceptionHandler，将把其内的的错误处理应用于全部的@Controller
>
> 推荐在这里捕获所有错误，完成返回500服务器错误等操作。



> 整个Demo参见[node-annotation-example](https://www.npmjs.com/package/node-annotation-example) 中的example/webApp