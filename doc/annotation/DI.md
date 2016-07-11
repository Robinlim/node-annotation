# DI
##  Component
被该注解修饰的模块会成为node-annotation的组件存在。可通过 **Autowired** 注解来注入，或者ApplicationContext来获取，如下：
```
require('node-annotation').ApplicationContext.getBean('组件名称');
```
支持参数  **Component("组件名称")**
  -	组件名称  当有此参数的时候，会以该名称命名组件，否则会以当前所在模块的文件名称来命名。

##  Autowired
能够引用到node-annotation的组件。
支持参数  **Autowired(“组件名称”)**
  - 组件名称 支持两种格式
    *	别名  通过别名的方式来获取对应的组件
    * 相对路径  相对于当前路径的方式来获取对应的组件

##  例子
> 路径 webApp/service/Service.js

```
@Component('service')
module.exports = {
  ...
};

```
> 路径  webApp/controller/User.js

```
......
@Autowired('service') 或者 @Autowired('../service/Service')
service: null,
......
```
