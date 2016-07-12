# AutoLoad
> 自动加载模块，一般有继承关系处理的类用该标签来加载，注解扩展就是通过该方式来运作的

## 参数

- `order` 加载优先级，数值越小，加载顺序越靠前（此注解@Autoload会在所有其他注解加载直接生效）
  - type: intenger(>0)
  - default: infinite
  - notice: 如果你的模块中有使用注解，请使用大于10的数值标示顺序，注解库中的预置注解使用0～10来划分顺序

## Demo

```javascript
/*@AutoLoad("0")*/
var Path = require('path');

var ApplicationContext = require('../../ApplicationContext');

var FILE_REG = /^\.+\//;
module.exports = require("../Annotation").extend({
    /**
     *  the annotation affect
     * @return {[type]} [description]
     */
    execute: function() {
        var model = this.model,
            proxy = model.exports(),
            classpath = model.classpath(),
            po = model.po();
        if (FILE_REG.test(po)) {
            po = Path.join(Path.dirname(classpath), po);
        }
        ApplicationContext.getBean(po || model.vo()).then(function(bean) {
            proxy.instance()[model.vo()] = bean.instance();
        });
    }
}, {
    //annotation name
    name: "Autowired"
});

```

