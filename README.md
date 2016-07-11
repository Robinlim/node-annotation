# node-annotation
node-annotation开发的初衷是因为node本身在服务层面并不太成熟，而且代码层次及维护各大公司都有自己的做法，借鉴于Java里spring的想法开发了这个，当然在功能实现上和spring相差甚多，这里只实现了几个重要功能，欢迎有志同道合者共同来维护。

## 注解
注解区别于正常可运行的代码，仅仅是注释的写法，这里写法格式为:

`/*@注解名称(注解参数)*/`注解参数支持格式：
- 单引号或者双引号括起来的字符串
- JSON格式

## 如何使用
**纳入node-annotation管理** 如果需要使用node-annotation来处理模块，需要在扫描文件完成后才能做业务操作  

```
var nodeAnnotation = require('node-annotation');
nodeAnnotation.start(源文件路径, function() {
    //do something
});
```

**限制** 使用该注解功能有个约束，如果注解修饰的是方法，只针对通过`module.exports={..}`导出的才有效，比如正确的写法<br/>

```
/*@Controller*/
module.exports = {
    /*@RequestMapping("/user/{name}")*/
    user: function(name, req, res){
      //do something
    }
};
```

错误的写法<br />

```
/*@Controller*/
/*@RequestMapping("/user/{name}")*/
function user(name, req, res){
  //do something
}
module.exports = {
  user: user
};
```

## 注解
### 分层注解
- [Controller](./doc/annotation/Hierarchy.md)  访问控制层，请求映射后的处理类
- [Service](./doc/annotation/Hierarchy.md)      业务层，负责处理业务相关逻辑
- [Repository](./doc/annotation/Hierarchy.md)   持久层，负责数据持久化相关

### 组件依赖注解
- [Autowired](./doc/annotation/Hierarchy.md)     能够将组件自动注入到模块中
- [Component](./doc/annotation/Hierarchy.md)     识别为组件，会被存储到组件池中以便注入时使用

### 切面注解
- [Aspect](./doc/annotation/AOP.md) 切面标识
- [PointCut](./doc/annotation/AOP.md) 切点，描述哪些模块方法会被处理
- [Before](./doc/annotation/AOP.md) 符合切点描述的方法执行前处理
- [After](./doc/annotation/AOP.md)  符合切点描述的方法执行后处理
- [Around](./doc/annotation/AOP.md) 符合切点描述的方法执行前后都会被处理

### 自动加载注解
- [AutoLoad](./doc/annotation/AutoLoad.md)  自动加载文件，一般在创建注解类的时候需要用到

### 配置加载
- [Configure](./doc/annotation/Configure.md)  加载配置文件，通过该标签直接获取配置里的值

## 自定义注解
请挪驾 [自定义注解](./doc/Annotation.md)

## 注解数据模型
[注解数据模型](./doc/Model.md)

## 使用dem
请参考项目 node-annotation-example

## 注解第三方扩展
请参考项目 node-annotation-extend
