class DOMChain {
  constructor(selector) {
    if (typeof selector === "string") {
      this.elements = Array.from(document.querySelectorAll(selector));
    } else if (
      selector instanceof HTMLElement ||
      selector === window ||
      selector === document
    ) {
      this.elements = [selector];
    } else if (Array.isArray(selector) || selector instanceof NodeList) {
      this.elements = Array.from(selector);
    } else {
      this.elements = [];
    }
  }

  // --- 🌟 追加: 表示・非表示の切り替え ---

  show() {
    this.elements.forEach((el) => (el.style.display = "")); // CSSのデフォルトに戻す
    return this;
  }

  hide() {
    this.elements.forEach((el) => (el.style.display = "none"));
    return this;
  }

  // --- 🌟 追加: 要素の挿入 ---

  // 要素の末尾にHTMLまたはDOMノードを追加
  append(content) {
    this.elements.forEach((el) => {
      if (typeof content === "string") {
        el.insertAdjacentHTML("beforeend", content);
      } else if (content instanceof HTMLElement) {
        el.appendChild(content);
      }
    });
    return this;
  }

  // 要素の先頭にHTMLを追加
  prepend(content) {
    this.elements.forEach((el) => {
      if (typeof content === "string") {
        el.insertAdjacentHTML("afterbegin", content);
      }
    });
    return this;
  }

  // --- 既存の短縮メソッド ---

  on(event, callback) {
    this.elements.forEach((el) => el.addEventListener(event, callback));
    return this;
  }

  html(content) {
    if (content === undefined) return this.elements[0]?.innerHTML;
    this.elements.forEach((el) => (el.innerHTML = content));
    return this;
  }

  text(content) {
    if (content === undefined) return this.elements[0]?.textContent;
    this.elements.forEach((el) => (el.textContent = content));
    return this;
  }

  css(property, value) {
    if (value === undefined) return this.elements[0]?.style[property];
    this.elements.forEach((el) => (el.style[property] = value));
    return this;
  }

  addClass(...className) {
    this.elements.forEach((el) => el.classList.add(...className));
    return this;
  }

  removeClass(...className) {
    this.elements.forEach((el) => el.classList.remove(...className));
    return this;
  }

  toggleClass(...className) {
    this.elements.forEach((el) => {
      for (const cls of className) {
        el.classList.toggle(cls);
      }
    });
    return this;
  }

  data(name, value) {
    if (value === undefined) return this.elements[0]?.dataset[name];
    this.elements.forEach((el) => (el.dataset[name] = value));
    return this;
  }

  attr(name, value) {
    if (value === undefined) return this.elements[0]?.getAttribute(name);
    this.elements.forEach((el) => el.setAttribute(name, value));
    return this;
  }

  get(index = 0) {
    return this.elements[index];
  }

  clear() {
    this.elements.forEach((el) => el.replaceChildren());
    return this;
  }

  hollow() {
    for (const el of this.elements) {
      for (const child of el.children) {
        if (child.dataset.ignore) continue;
        child.replaceChildren();
      }
    }
    return this;
  }
}

// 既存の要素を選択するショートカット
const $ = (selector) => new DOMChain(selector);

// --- 🌟 追加: 新規要素を作成するショートカット ---
$.create = (tagName) => new DOMChain(document.createElement(tagName));

const escape = (str) => {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
};

function error(str, level = "error") {
  const pop = document.createElement("div");
  pop.textContent = `"${level.toUpperCase()}" : ${str}`;
  pop.classList.add("message-pop-up");
  pop.classList.add(`message-${level}`);
  document.body.appendChild(pop);
  setTimeout(() => {
    pop.style.animation = "slide-out 500ms forwards";
  }, 2000);

  setTimeout(() => {
    pop.remove();
  }, 2500);
}
