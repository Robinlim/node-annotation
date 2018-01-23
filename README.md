# node-annotation
node-annotation开发的初衷是因为node本身在服务层面并不太成熟，而且代码层次及维护各大公司都有自己的做法，借鉴于Java里spring的想法开发了这个，当然在功能实现上和spring相差甚多，这里只实现了几个重要功能, 欢迎大家提供意见建议。(QQ群：523291195)

## 注解
注解区别于正常可运行的代码，仅仅是注释的写法，这里写法格式为:

`/*@注解名称(注解参数)*/`注解参数支持格式：
- 单引号或者双引号括起来的字符串
- JSON格式

## 如何使用
**纳入node-annotation管理** 如果需要使用node-annotation来处理模块，需要在扫描文件完成后才能做业务操作  

```javascript
var nodeAnnotation = require('node-annotation');
/** 配置全局错误处理
 * [Function] 错误处理函数
 */
nodeAnnotation.setGlobalErrorHandler(function(err){
  console.error(err);
})
/** 配置node－annotation内的日志流出
 * [Boolean] 是否开启日志，默认true
 * [String] "error/warn/info/log" 输出日至级别，默认warn
 * [Function/LoggerObject] 日志处理函数或对象(类似log4js的Logger对象)，默认为console
 */
nodeAnnotation.setLogger(true, 'info', function(str, level) {
    console.log('[NodeAnnotation]', str);
});
/* 配置资源路径
 * [String] 配置文件所在路径(文件夹)，默认工程目录下的resoucres文件夹
 */
nodeAnnotation.configurePath(path.join(process.cwd(), 'resources'));
nodeAnnotation.start(源文件路径, function() {
  	nodeAnnotation.app(/*你的express app*/)
    //你的业务代码
});
```

**限制** 使用该注解功能有个约束，如果注解修饰的是方法，只针对通过`module.exports={..}`导出的才有效，比如正确的写法<br/>

```javascript
/*@Controller*/
module.exports = {
    /*@RequestMapping("/user/{name}")*/
    user: function(name, req, res){
      //do something
    }
};
```

错误的写法<br />

```javascript
/*@Controller*/
/*@RequestMapping("/user/{name}")*/
function user(name, req, res){
  //do something
}
module.exports = {
  user: user
};
```

## 启动配置

- 全局错误配置

  > 会包裹`start`的回调函数（你的业务代码应该全部置于回调中），能够捕获其内的同步或者异步错误（捕获参见[trycatch](https://www.npmjs.com/package/trycatch)）
  >
  > 默认情况会直接打印错误到控制台

```javascript
/** 配置全局错误处理
 * [Function] 错误处理函数
 */
nodeAnnotation.setGlobalErrorHandler(function(err){
  console.error(err);
})
```

- 日志流出配置

  > node-annotation在编译和执行过程中会产生一系列日志，在不同情况下你可能对是否输出日志以及需要哪些日志有着不同的需求。我们定义了四个日志级别：error，warn，info，log。
  >
  > 默认情况下我们会打印warn级别及以上的日志到console，当你开启debug模式（指直接在启动node时追加`--debug`或`--debug-brk`）时，则会打印log级别的日志（即全部日志）。

```javascript
/** 配置node－annotation内的日志流出
 * [Boolean] 是否开启日志，默认true
 * [String] "error/warn/info/log" 输出日至级别，默认warn
 * [Function/LoggerObject] 日志处理函数或对象(类似log4js的Logger对象)，默认为console
 */
nodeAnnotation.setLogger(true, 'info', function(str, level) {
    console.log('[NodeAnnotation]', str);
});
```

- 资源文件路径配置

  > 在注解中使用[Configure](./doc/annotation/Configure.md)时需要配置资源文件所在路径
  >
  > 默认情况会使用node启动目录下的resources目录

```javascript
/* 配置资源路径
 * [String] 配置文件所在路径(文件夹)，默认工程目录下的resoucres文件夹
 */
nodeAnnotation.configurePath(path.join(process.cwd(), 'resources'));
```

- 路由中间件启用

  > 在注解中使用[RequestMapping](./doc/annotation/Controller.md)时需要配置web服务，我们会将你的路由规则作为一个router中间件置入外围的express服务。
  >
  > 请务必在`start`的回调函数内配置该中间件。

```javascript
var app = express.createServer();
nodeAnnotation.app(app);
// 实际在annotation内会 app.use(`AnnotationRouter`)
```

- 编译启动

  > 注解需要指定它需要编译的目录，将扫描该目录下所有文件进行正则匹配完成注解编译。
  >
  > 请注意一般不要把node_modules包含进扫描目录，这样会极大降低启动速度，尽量仅包含使用了注解的少数几个目录。

```javascript
/** 注解编译启动
 * [Array] 需要被扫描编译的目录
 * [Function] 扫描完成的回调，你的全部业务代码应该置于这里
 */
nodeAnnotation.start(dirs, function() {
  	nodeAnnotation.app(/*你的express app*/)
    //你的业务代码
});
```

## 注解

### 分层注解
- [Controller](./doc/annotation/Controller.md)  访问控制层，请求映射后的处理类
  - [RequestMapping](./doc/annotation/Controller.md) 请求映射
  - [ResponseBody](./doc/annotation/Controller.md) 返回包装
  - [ExceptionHandler](./doc/annotation/Controller.md) 异常处理

- [ControllerAdvice](./doc/annotation/Controller.md)  访问器增强，将其内的[ExceptionHandler](./doc/annotation/Controller.md)应用到所有Controller
- [Service](./doc/annotation/Controller.md)      业务层，负责处理业务相关逻辑
- [Repository](./doc/annotation/Controller.md)   持久层，负责数据持久化相关

### 组件依赖注解
- [Autowired](./doc/annotation/DI.md)     能够将组件自动注入到模块中
- [Component](./doc/annotation/DI.md)     识别为组件，会被存储到组件池中以便注入时使用

### 切面注解
- [Aspect](./doc/annotation/AOP.md) 切面标识
- [PointCut](./doc/annotation/AOP.md) 切点，描述哪些模块方法会被处理
- [Before](./doc/annotation/AOP.md) 符合切点描述的方法执行前处理
- [After](./doc/annotation/AOP.md)  符合切点描述的方法执行后处理
- [Around](./doc/annotation/AOP.md) 符合切点描述的方法执行前后都会被处理
- [Throws](./doc/annotation/AOP.md) 符合切点描述的方法抛出异常时处理
- [AfterReturning](./doc/annotation/AOP.md) 符合切点描述的方法的回调执行前处理

### 异步注解（类似ES7async/await）
- [Async](./doc/annotation/fiber.md) 注解一个异步函数，该函数内可以同步调用其他Async函数
- [AsyncWrap](./doc/annotation/fiber.md) 将一个callback形式的函数库包装为Async形式

### 自动加载注解
- [AutoLoad](./doc/annotation/AutoLoad.md)  自动加载文件，一般在创建注解类的时候需要用到

### 配置加载
- [Configure](./doc/annotation/Configure.md)  加载配置文件，通过该标签直接获取配置里的值

## 自定义注解
请挪驾 [自定义注解](./doc/Annotation.md)

## 注解数据模型
[注解数据模型](./doc/Model.md)

## 使用demo及test
请参考项目 [node-annotation-example](https://github.com/Robinlim/node-annotation-example)

## 注解第三方扩展
请参考项目 [node-annotation-extend](https://github.com/Robinlim/node-annotation-extend)


## 历史版本
- 1.0.0 删除了对fibers的依赖，将async的支持挪至 [node-annotation-async](https://github.com/Robinlim/node-annotation-async)