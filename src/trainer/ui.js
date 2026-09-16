const UI = {
  optionHolder: $(".option-holder"),
  details: $(".details"),
  test: $(".test"),

  async init() {
    await Data.init();
    this.details.hide();
    this.test.hide();
    for (const [range, label] of Object.entries(list)) {
      this.create(range, label);
    }
  },

  create(range, label) {
    this.optionHolder.show();
    this.details.hide();
    this.test.hide();
    const el = $.create("div")
      .addClass("range-option", range)
      .data("id", range)
      .on("click", (e) => {
        UI.gotoDetails(e.currentTarget.dataset.id);
      });
    const title = $.create("p")
      .text(label)
      .css("font-size", "40px")
      .css("font-weight", "bold")
      .css("margin", "20px")
      .css("font-family", `"Hiragino Maru Gothic", sans-serif`)
      .css("text-decoration", "underline")
      .css("cursor", "text");
    el.append(title.get());
    const graph_binder = $.create("div").addClass("graph-binder");
    el.append(graph_binder.get());

    const baseWidth = Math.max(
      Math.min(window.innerWidth, window.innerHeight) * 0.18,
      80
    );

    graph_binder
      .append(this.createGraph("和英", Data.getJEData(range), baseWidth))
      .append(this.createGraph("英和", Data.getEJData(range), baseWidth));

    this.optionHolder.append(el.get());
  },

  createGraph(label, data, baseWidth) {
    // 1. 各カテゴリのデータ数と設定を定義
    const stats = [
      {
        key: "unseen",
        name: "未学習",
        count: Object.keys(data.unseen).length || 0,
        color: "#c5cbd4",
      }, // グレー
      {
        key: "incorrect",
        name: "不正解",
        count: Object.keys(data.incorrect).length || 0,
        color: "#f87171",
      }, // レッド
      {
        key: "correct",
        name: "正解",
        count: Object.keys(data.correct).length || 0,
        color: "#4ade80",
      }, // グリーン
      {
        key: "mastered",
        name: "マスター",
        count: Object.keys(data.mastered).length || 0,
        color: "#3cb589",
      }, // イエロー
    ];

    const total = stats.reduce((sum, stat) => sum + stat.count, 0);

    // 2. ラッパー要素の作成
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.alignItems = "center";
    wrapper.style.width = `${baseWidth + 10}px`;
    wrapper.style.fontFamily = "sans-serif";
    wrapper.style.margin = "15px 0 15px 0";

    // 3. グラフコンテナ（相対配置）
    const graphContainer = document.createElement("div");
    graphContainer.style.position = "relative";
    graphContainer.style.width = `${baseWidth}px`;
    graphContainer.style.height = `${baseWidth}px`;
    graphContainer.style.margin = "0";

    // 4. 中央のテキスト表示用div
    const centerText = document.createElement("div");
    centerText.style.position = "absolute";
    centerText.style.top = "50%";
    centerText.style.left = "50%";
    centerText.style.transform = "translate(-50%, -50%)";
    centerText.style.textAlign = "center";
    centerText.style.pointerEvents = "none"; // マウスイベントを貫通させる
    centerText.style.transition = "all 0.2s ease";
    centerText.style.margin = "0";

    // デフォルトの中央テキスト
    const setDefaultText = () => {
      centerText.innerHTML = `
      <div style="font-size: ${baseWidth * 0.075}px; color: #64748b;">合計</div>
      <div style="font-size: ${
        baseWidth * 0.15
      }px; font-weight: bold; color: #334155;">${total}</div>
    `;
    };
    setDefaultText();

    // 5. SVGの生成（時計の12時方向から開始させるために-90度回転）
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.style.transform = "rotate(-90deg)";
    svg.style.width = "100%px";
    svg.style.height = "100%px";
    svg.style.overflow = "visible";
    svg.style.margin = "0";

    // 円の計算（半径rと円周C）
    const r = 35;
    const circumference = 2 * Math.PI * r; // 円周 ($C = 2\pi r$)
    let currentOffset = 0;

    // 6. データに基づいて円の帯（パス）を生成
    if (total === 0) {
      // データが0件の場合のダミー円
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", "50");
      circle.setAttribute("cy", "50");
      circle.setAttribute("r", r);
      circle.setAttribute("fill", "transparent");
      circle.setAttribute("stroke", "#f1f5f9");
      circle.setAttribute("stroke-width", "12");
      svg.appendChild(circle);
    } else {
      stats.forEach((stat) => {
        if (stat.count === 0) return; // 0件のカテゴリは描画しない

        const circle = document.createElementNS(svgNS, "circle");
        const percentage = stat.count / total;
        const dashLength = percentage * circumference;

        circle.setAttribute("cx", "50");
        circle.setAttribute("cy", "50");
        circle.setAttribute("r", r);
        circle.setAttribute("fill", "transparent");
        circle.setAttribute("stroke", stat.color);
        circle.setAttribute("stroke-width", "12"); // デフォルトの太さ

        // 破線の長さと隙間を利用して扇形を表現
        circle.setAttribute(
          "stroke-dasharray",
          `${dashLength} ${circumference - dashLength}`
        );
        // 描画開始位置をずらす
        circle.setAttribute("stroke-dashoffset", -currentOffset);

        circle.style.transition =
          "stroke-width 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
        circle.style.cursor = "pointer";

        // ホバー時のイベント
        circle.addEventListener("mouseenter", () => {
          circle.setAttribute("stroke-width", "18"); // 幅を太くして飛び出させる
          centerText.innerHTML = `
          <div style="font-size: ${baseWidth * 0.075}px; color: ${
            stat.color
          }; font-weight: bold;">${stat.name}</div>
          <div style="font-size: ${
            baseWidth * 0.15
          }px; font-weight: bold; color: #334155;">${stat.count}</div>
        `;
        });

        // マウスアウト時のイベント
        circle.addEventListener("mouseleave", () => {
          circle.setAttribute("stroke-width", "12"); // 元の太さに戻す
          setDefaultText();
        });

        svg.appendChild(circle);
        currentOffset += dashLength; // 次の帯の開始位置を更新
      });
    }

    // 7. ラベルの作成
    const labelDiv = document.createElement("div");
    labelDiv.textContent = label;
    labelDiv.style.marginTop = `${baseWidth * 0.075}px`;
    labelDiv.style.fontSize = `${baseWidth * 0.09375}px`;
    labelDiv.style.fontWeight = "bold";
    labelDiv.style.color = "#475569";

    // 8. 組み立てて返す
    graphContainer.appendChild(svg);
    graphContainer.appendChild(centerText);
    wrapper.appendChild(graphContainer);
    wrapper.appendChild(labelDiv);

    return wrapper;
  },

  goBackToLists() {
    this.optionHolder.show();
    this.details.hide();
    this.test.hide();
  },

  goBackToDetails(alert = false) {
    if (alert) {
      if (confirm("テストを中断しますか?(テスト結果は保存されません)")) {
        this.goBackToDetails();
      } else {
        return;
      }
    }
    this.optionHolder.hide();
    this.details.show();
    this.test.hide();
  },

  gotoDetails(range) {
    this.optionHolder.hide();
    this.details.hollow();
    this.details.show();
    this.test.hide();
    const title = $(".title");
    const graphs = $(".graph-binder");
    const btns = $(".button-holder");
    title.text(range);
    const width = Math.min(Math.max(window.innerWidth * 0.3, 130), 300);
    graphs
      .append(this.createGraph("和英", Data.getJEData(range), width))
      .append(this.createGraph("英和", Data.getEJData(range), width));

    btns
      .append(
        $.create("div")
          .text("和英テスト開始")
          .addClass("test-btn")
          .on("click", (e) => {
            this.beginTest(range, "je");
          })
          .get()
      )
      .append(
        $.create("div")
          .text("英和テスト開始")
          .addClass("test-btn")
          .on("click", (e) => {
            this.beginTest(range, "ej");
          })
          .get()
      );
  },

  async beginTest(range, type) {
    this.optionHolder.hide();
    this.details.hide();
    this.test.show();
    const data = type == "je" ? Data.getJEData(range) : Data.getEJData(range);
    const testData = Question.get(data, 20);
    for (const prob of testData) {
      const ansCnt =
        typeof Data.raw[range][prob] == "string"
          ? 1
          : Data.raw[range][prob].length;
    }
  },
};

const Question = {
  weights: {
    incorrect: 0.4,
    unseen: 0.3,
    correct: 0.2,
    mastered: 0.1,
  },

  get(source, total) {
    let test = [];

    // 現在のUNIXタイムスタンプ（ミリ秒）を取得
    const now = Date.now();

    let data = {};

    // 1. 各カテゴリのデータを変換し、重み付きでソートする
    Object.keys(source).forEach((key) => {
      // 対象カテゴリが存在しない場合へのフェールセーフ
      const categoryData = source[key] || {};

      const items = Object.entries(categoryData).map(([word, timestamp]) => {
        // 経過時間（秒）を計算。古いほど値が大きくなる。
        // 最低値を1とし、0除算や負の数を防ぐ。
        const elapsed = Math.max(now - timestamp, 1);

        // 【重み付きランダム抽出】
        // 0〜1の乱数を (1 / 経過時間) 乗する。
        // 経過時間が長い（古い）ほど、計算結果が「1」に近づきやすくなる。
        const randomKey = Math.random() ** (1 / elapsed);

        return { word, randomKey };
      });

      // randomKeyが大きい順（1に近い順）に降順ソート
      // これにより、古い単語ほど配列の先頭に来る確率が高くなります
      items.sort((a, b) => b.randomKey - a.randomKey);

      // 単語だけの配列として保存
      data[key] = items.map((item) => item.word);
    });

    const targets = Object.fromEntries(
      Object.entries(this.weights).map(([key, value]) => {
        return [key, Math.floor(total * value)];
      })
    );

    const order = ["incorrect", "unseen", "correct", "mastered"];

    // 2. 指定された割合（weights）に従って抽出
    order.forEach((key) => {
      if (data[key]) {
        test.push(
          ...data[key].splice(0, Math.min(data[key].length, targets[key]))
        );
      }
    });

    // 3. 足りない問題数を優先順位（order）に従って補充
    for (const key of order) {
      const remain = total - test.length;
      if (remain <= 0) break;
      if (data[key]) {
        test.push(...data[key].splice(0, Math.min(data[key].length, remain)));
      }
    }

    // 4. 最後にテスト全体の出題順序を完全ランダムにシャッフル
    return test.sort(() => Math.random() - 0.5);
  },
};

UI.init();
