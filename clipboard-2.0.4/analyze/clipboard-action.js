import select from 'select';

/**
 * Inner class which performs selection from either `text` or `target`
 * properties and then executes copy or cut operations.
 */
class ClipboardAction {
  /**
   * @param {Object} options
   */
  constructor(options) {
    // 定义属性
    this.resolveOptions(options);
    // 定义事件
    this.initSelection();
  }

  /**
   * Defines base properties passed from constructor.
   * @param {Object} options
   */
  resolveOptions(options = {}) {
    // 行为copy / cut
    this.action = options.action;
    // 包含元素
    this.container = options.container;
    // 钩子函数
    this.emitter = options.emitter;
    // 复制目标
    this.target = options.target;
    // 复制内容
    this.text = options.text;
    // 绑定元素
    this.trigger = options.trigger;

    // 选中的复制内容
    this.selectedText = '';
  }

  /**
   * 使用哪一种策觉取决于提供的text和target
   * Decides which selection strategy is going to be applied based
   * on the existence of `text` and `target` properties.
   */
  initSelection() {
    if (this.text) {
      this.selectFake();
    } else if (this.target) {
      this.selectTarget();
    }
  }

  /**
   * 创建一个假的textarea元素（fakeElem），设置它的值为text属性的值并且选择它
   * Creates a fake textarea element, sets its value from `text` property,
   * and makes a selection on it.
   */
  selectFake() {
    const isRTL = document.documentElement.getAttribute('dir') == 'rtl';

    // 移除已经存在的上一次的fakeElem
    this.removeFake();

    this.fakeHandlerCallback = () => this.removeFake();
    // 利用事件冒泡，当创建假元素并实现复制功能后，点击事件冒泡到其父元素，删除该假元素
    this.fakeHandler = this.container.addEventListener('click', this.fakeHandlerCallback) || true;

    this.fakeElem = document.createElement('textarea');
    // Prevent zooming on iOS
    this.fakeElem.style.fontSize = '12pt';
    // Reset box model
    this.fakeElem.style.border = '0';
    this.fakeElem.style.padding = '0';
    this.fakeElem.style.margin = '0';
    // Move element out of screen horizontally
    this.fakeElem.style.position = 'absolute';
    this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
    // Move element to the same position vertically
    let yPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.fakeElem.style.top = `${yPosition}px`;

    this.fakeElem.setAttribute('readonly', '');
    this.fakeElem.value = this.text;

    // 添加到容器中
    this.container.appendChild(this.fakeElem);

    // 选中fakeElem
    this.selectedText = select(this.fakeElem);
    this.copyText();
  }

  /**
   * 在用户点击其他后再移除fakeElem。用户依然可以使用Ctrl+C去复制，因为fakeElem依然存在
   * Only removes the fake element after another click event, that way
   * a user can hit `Ctrl+C` to copy because selection still exists.
   */
  removeFake() {
    if (this.fakeHandler) {
      this.container.removeEventListener('click', this.fakeHandlerCallback);
      this.fakeHandler = null;
      this.fakeHandlerCallback = null;
    }

    if (this.fakeElem) {
      this.container.removeChild(this.fakeElem);
      this.fakeElem = null;
    }
  }

  /**
   * 从传递的target属性去选择元素
   * Selects the content from element passed on `target` property.
   */
  selectTarget() {
    this.selectedText = select(this.target);
    this.copyText();
  }

  /**
   * 对目标执行复制操作
   * Executes the copy operation based on the current selection.
   */
  copyText() {
    let succeeded;

    try {
      succeeded = document.execCommand(this.action);
    }
    catch (err) {
      succeeded = false;
    }

    this.handleResult(succeeded);
  }

  /**
   * 根据复制操作的结果触发对应发射器
   * Fires an event based on the copy operation result.
   * @param {Boolean} succeeded 复制操作后的返回值，用于判断复制是否成功
   */
  handleResult(succeeded) {
    // 这里this.emitter.emit相当于E.emit
    this.emitter.emit(succeeded ? 'success' : 'error', {
      action: this.action,
      text: this.selectedText,
      trigger: this.trigger,
      clearSelection: this.clearSelection.bind(this)
    });
  }

  /**
   * Moves focus away from `target` and back to the trigger, removes current selection.
   */
  clearSelection() {
    if (this.trigger) {
      this.trigger.focus();
    }

    window.getSelection().removeAllRanges();
  }

  /**
   * 设置行为action，可以是copy（复制）和cut（剪切）
   * Sets the `action` to be performed which can be either 'copy' or 'cut'.
   * @param {String} action
   */
  set action(action = 'copy') {
    this._action = action;

    if (this._action !== 'copy' && this._action !== 'cut') {
      throw new Error('Invalid "action" value, use either "copy" or "cut"');
    }
  }

  /**
   * 获取行为action
   * Gets the `action` property.
   * @return {String}
   */
  get action() {
    return this._action;
  }

  /**
   * 使用将复制其内容的元素设置`target`属性。
   * Sets the `target` property using an element
   * that will be have its content copied.
   * @param {Element} target
   */
  set target(target) {
    if (target !== undefined) {
      if (target && typeof target === 'object' && target.nodeType === 1) {
        if (this.action === 'copy' && target.hasAttribute('disabled')) {
          throw new Error('Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute');
        }

        if (this.action === 'cut' && (target.hasAttribute('readonly') || target.hasAttribute('disabled'))) {
          throw new Error('Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes');
        }

        this._target = target;
      }
      else {
        throw new Error('Invalid "target" value, use a valid Element');
      }
    }
  }

  /**
   * 获取target（目标）
   * Gets the `target` property.
   * @return {String|HTMLElement}
   */
  get target() {
    return this._target;
  }

  /**
   * Destroy lifecycle.
   */
  destroy() {
    this.removeFake();
  }
}

module.exports = ClipboardAction;
