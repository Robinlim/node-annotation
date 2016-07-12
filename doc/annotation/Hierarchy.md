# 层次
被这些层次注解修饰的模块都会成为node-annotation的组件存在。参数支持也和[Component](./DI.md)一样
##  Controller  控制层
该层主要处理请求映射与返回
### RequestMapping 请求路径映射
会将对应的请求打到该注解所修饰的方法。
### ResponseBody  返回对象处理
response.render支持对象类型，作为接口api存在的时候很方便。

##  Service 服务层
该层主要处理与业务逻辑相关的内容

##  Repository  存储层
该层主要与数据库打交道

> 整个Demo参见[node-annotation-example](https://www.npmjs.com/package/node-annotation-example) 中的example/Hierarchy