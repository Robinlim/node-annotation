# Model
注解数据模型，存储里注解内部的参数，以及注解所在的模块，注解修饰的变量名及其参数。

## 方法
- name  获取注解名称
- po  获取注解内部的参数
- vo  获取注解修饰的变量名称
- voParam 获取注解修饰的变量参数，当该变量类型为方法时才有值
- classpath 获取注解所在模块的路径
- exports 获取模块[Proxy](./doc/Proxy.md)
- instance 获取模块本身
