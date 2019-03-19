import ClipboardAction from './clipboard-action';
import Emitter from 'tiny-emitter';
import listen from 'good-listener';

/**
 * Base class which takes one or more elements, adds event listeners to them,
 * and instantiates a new `ClipboardAction` on each click.
 */
class Clipboard extends Emitter {
  /**
   * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
   * @param {Object} options
   */
  constructor(trigger, options) {
    super();
    // 定义属性
    this.resolveOptions(options);
    // 定义事件
    this.listenClick(trigger);
  }

  /**
   * 定义函数的属性，如果外部有传函数，使用外部的函数，否则使用内部的默认函数
   * Defines if attributes would be resolved using internal setter functions
   * or custom functions that were passed in the constructor.
   * @param {Object} options
   */
  resolveOptions(options = {}) {
    // 事件行为
    this.action = (typeof options.action === 'function') ? options.action : this.defaultAction;
    // 复制的目标
    this.target = (typeof options.target === 'function') ? options.target : this.defaultTarget;
    // 复制的内容
    this.text = (typeof options.text === 'function') ? options.text : this.defaultText;
    // 包含元素
    this.container = (typeof options.container === 'object') ? options.container : document.body;
  }

  /**
   * 为目标添加点击事件
   * Adds a click event listener to the passed trigger.
   * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
   */
  listenClick(trigger) {
    this.listener = listen(trigger, 'click', (e) => this.onClick(e));
  }

  /**
   * 给目标添加clipboardAction属性
   * Defines a new `ClipboardAction` on each click event.
   * @param {Event} e
   */
  onClick(e) {
    // trigger元素
    const trigger = e.delegateTarget || e.currentTarget;

    if (this.clipboardAction) {
      this.clipboardAction = null;
    }

    // 执行复制操作，把格式化的参数传递进去
    this.clipboardAction = new ClipboardAction({
      action: this.action(trigger),
      target: this.target(trigger),
      text: this.text(trigger),
      container: this.container,
      trigger: trigger,
      emitter: this
    });
  }

  /**
   * 定义行为的回调函数
   * Default `action` lookup function.
   * @param {Element} trigger
   */
  defaultAction(trigger) {
    return getAttributeValue('action', trigger);
  }

  /**
   * 定义复制目标的回调函数
   * Default `target` lookup function.
   * @param {Element} trigger
   */
  defaultTarget(trigger) {
    const selector = getAttributeValue('target', trigger);

    if (selector) {
      return document.querySelector(selector);
    }
  }

  /**
   * Returns the support of the given action, or all actions if no action is
   * given.
   * @param {String} [action]
   */
  static isSupported(action = ['copy', 'cut']) {
    const actions = (typeof action === 'string') ? [action] : action;
    let support = !!document.queryCommandSupported;

    actions.forEach((action) => {
      support = support && !!document.queryCommandSupported(action);
    });

    return support;
  }

  /**
   * 定义复制内容的回调函数
   * Default `text` lookup function.
   * @param {Element} trigger
   */
  defaultText(trigger) {
    return getAttributeValue('text', trigger);
  }

  /**
   * Destroy lifecycle.
   */
  destroy() {
    this.listener.destroy();

    if (this.clipboardAction) {
      this.clipboardAction.destroy();
      this.clipboardAction = null;
    }
  }
}

/**
 * 工具函数：获取复制目标属性的值
 * Helper function to retrieve attribute value.
 * @param {String} suffix
 * @param {Element} element
 */
function getAttributeValue(suffix, element) {
  const attribute = `data-clipboard-${suffix}`;

  if (!element.hasAttribute(attribute)) {
    return;
  }

  return element.getAttribute(attribute);
}

module.exports = Clipboard;
