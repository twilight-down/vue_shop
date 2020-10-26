import Vue from 'vue'
import { Form, FormItem, Button, Input, Message } from 'element-ui'


Vue.use(Button)
Vue.use(Input)
Vue.use(Form)
Vue.use(FormItem)

//将弹框组件挂载到了原型组件身上
Vue.prototype.$message = Message