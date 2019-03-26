/*
* 一个比较简单的事件订阅发布器，但包含的核心思想还是比较完整的，
* 用到了面向对象，订阅发布者模式，代理模式等，
* 而且可以根据自己的需求进行很方便的扩展，比如我扩展的批量取消，也可以添加批量订阅，
* 甚至使用promise来封装异步触发，每一个函数都返回了对象本身，
* 可以完成链式调用，比如订阅完成后立刻触发完成初始化等等。
* */
/*
* 一个简易的基于监听发布者模式的事件派发和接收器
* on 用于订阅事件，一个事件订阅多个触发函数
* emit 用于发布事件，发布时会以此触发事件订阅的函数
* once 订阅的事件只触发一次
* off 取消订阅事件，支持指定取消，批量取消和全部取消
* */
class E {
  constructor() {
    this.eventObj = {}
  }

  /*
  * 订阅事件:把要触发的函数放到事件对应的对象里面,如果事件不存在，需要初始化一下即可。
  * 一个事件可以动态的订阅多个触发函数。而且支持指定作用域，可以远程调用任意模块的函数。
  * */
  on(eventName, callback, ctx) {
    (this.eventObj[eventName] || (this.eventObj[eventName] = [])).push({callback, ctx})
    return this
  }

  once(eventName, callback, ctx) {
    let listener = (...args) => {
      this.off(eventName, listener)
      callback.apply(ctx, args)
    }
    // 因为listener是在callback上封装了一层 所以要规定一个可以找到callbak的规则
    listener._ = callback
    return this.on(eventName, listener, ctx)
  }

  /*
  * 发布事件:接收事件的事件名和触发函数的参数，将对应事件订阅的触发函数依次执行即。
  * 参数可以使用es6的rest操作符。
  * */
  emit(eventName, ...args) {
    let eventArr = (this.eventObj[eventName] || []).slice()
    eventArr.forEach(ele => ele.callback.call(ele.ctx, args))
    return this
  }

  /*
  * 取消事件:可以指定取消事件订阅的某一个或者多个触发函数，也可以直接将整个事件都取消掉。
  * 取消事件接收取消的事件名称，和一个可选的函数对象或者函数对象数组（我自己增加的）。
  * 如果传入了指定的触发函数对象，通过遍历所有触发的函数来过滤掉需要取消的触发函数，最后重新赋值即可。
  * 如果没有传触发函数，那么就认为取消整个订阅的事件，直接从全局的事件对象中删除订阅对象即可
  * */
  off(eventName, callback) {
    if (Object.prototype.toString.call(callback) === "[object Array]") {
      callback.forEach(func => this.off(eventName, func))
      return this
    }
    let liveEvents = []
    let obj = this.eventObj
    let eventArr = obj[eventName]
    // 如果没有callback 就删除掉整个eventName对象
    if (eventArr && callback) {
      liveEvents = eventArr.filter(ele => (ele.callback !== callback && ele.callback._ !== callback))
    }
    (liveEvents.length) ? obj[eventName] = liveEvents : delete obj[eventName]
    return this
  }
}

module.exports = E
