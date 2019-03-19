/*
* tiny-emitter.js内部维护了一个对象（this.e），
* this.e对象用记录一系列的属性（例如：success、error），属性是数组，
* 当调用on方法往对应属性的数组添加触发函数，调用emit方法就触发对应属性的所有函数
* */
function E() {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

/**
 * @param {String} name 触发事件的表识
 * @param {function} callback 触发的事件
 * @param {object} ctx 函数调用上下文
 */
E.prototype = {
  on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});
    // this.e存储全局事件
    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;

    function listener() {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    };

    listener._ = callback
    return this.on(name, listener, ctx);
  },

  emit: function (name) {
    // 获取标识后的参数，就是上面this.emitter.emit函数第二个参数对象{action, text, trigger, clearSelection}
    // 最终从回调函数中获取data。E.on(success, (data) => data)
    var data = [].slice.call(arguments, 1);
    // 获取标识对应的函数
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      // 循环触发函数数组的函数，把data传递出去作为on的回调函数的结果
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback)
          liveEvents.push(evts[i]);
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length)
      ? e[name] = liveEvents
      : delete e[name];

    return this;
  }
};

module.exports = E;
module.exports.TinyEmitter = E;
