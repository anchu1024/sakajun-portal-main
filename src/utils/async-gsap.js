// gsapAsync.js
(function (global) {
  // GSAP を動的 import（HTML に書かなくていい）
  const gsapReady = import(
    "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js"
  ).then((mod) => mod.gsap);

  // Tween を Promise 化する共通関数
  async function tweenToPromise(tween) {
    return new Promise((resolve) => {
      tween.eventCallback("onComplete", resolve);
    });
  }

  // -------------------------
  //  GSAP の各 API を Promise 化
  // -------------------------

  async function to(target, vars) {
    const gsap = await gsapReady;
    return tweenToPromise(gsap.to(target, vars));
  }

  async function from(target, vars) {
    const gsap = await gsapReady;
    return tweenToPromise(gsap.from(target, vars));
  }

  async function fromTo(target, fromVars, toVars) {
    const gsap = await gsapReady;
    return tweenToPromise(gsap.fromTo(target, fromVars, toVars));
  }

  async function set(target, vars) {
    const gsap = await gsapReady;
    gsap.set(target, vars);
    return Promise.resolve(); // set は即時完了
  }

  // Timeline も Promise 化
  async function timeline(vars = {}) {
    const gsap = await gsapReady;
    const tl = gsap.timeline(vars);

    // Promise 化した timeline を返す
    tl.finished = new Promise((resolve) => {
      tl.eventCallback("onComplete", resolve);
    });

    return tl;
  }

  // -------------------------
  //  グローバル公開
  // -------------------------
  global.GsapAsync = {
    to,
    from,
    fromTo,
    set,
    timeline,
  };
})(window);
