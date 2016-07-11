# Configure
##  设置配置文件路径
默认配置文件路径为 **启动进程所在路径 + resource** 目录，可通过 ```require('node-annotation').configurePath(指定目录)``` 来指定目录

##  参数
支持两种参数形式
- 文件路径|变量名，每个文件的变量都是单独的，不会有命名冲突
  *  文件路径是指相对于上面配置文件目录的路径。
  *  变量名是指变量路径。
- 变量名
  变量路径，这里会将所有配置文件里的内容进行合并，当命名冲突产生，合并的为
  *	当值为简单类型时会被覆盖
  * 当值为复杂对象(非数组类型)时会取并集
  * 当值为复杂对象(数组类型)时会进行concat操作
  比如：
  ```
    {"data": [{ "user": "barney" }, { "user": "fred" }]} 和
    {"data": [{ "age": 36 }, { "age": 40 }]} 会得到
    { "data": [{ "user": "barney", "age": 36 }, { "user": "fred", "age": 40 }] }
  ```
  ```
    {"fruits": ["apple"], "vegetables": ["beet"]} 和
    {"fruits": ["banana"],"vegetables": ["carrot"]} 会得到
    { "fruits": ["apple", "banana"], "vegetables": ["beet", "carrot"] }
  ```

##  实例
> settings.json文件，在配置文件目录下

```
{
    "monitor": {
        "server": "xxx",
        "port": "8125",
        "prefix": "nodeExample.",
        "interval": 1000
    },
    "appenders": [{
        "type": "Hello"
    }, {
        "type": "World"
    }]
}
```
> User.js
```
...
/*@Configure("setting.json|appenders[0].type")*/
settings: null,
...
```
或者
```
...
/*@Configure("appenders[0].type")*/
settings: null,
...
```
settings的值为Hello
