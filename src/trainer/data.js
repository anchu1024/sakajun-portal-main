const list = {
  "2-3-3": "2年3学期③",
  "2-3-4": "2年3学期④",
  "3-1-5": "3年1学期⑤",
  "3-1-6": "3年1学期⑥",
  "3-2-1": "3年2学期①",
  "3-2-2": "3年2学期②",
  "3-3-1": "3年3学期①",
  "3-3-2": "3年3学期②",
  "4-1-1": "4年1学期①",
  "4-1-2": "4年1学期②",
};

const Data = {
  /**
   * 既に読み込み済みのデータを保存しておく
   */
  datas: {},

  /**
   * 生データを読み込む
   */
  raw: null,

  async init() {
    try {
      this.raw = await (await fetch("../data/tango-bundle.json")).json();
      error("データが読み込まれました", "info");
    } catch (e) {
      error(e.toString());
    }
  },

  /**
   * 和英の単語データをとってきます
   * @param {string} range とってくる単語の範囲
   * @return object 単語のデータ
   */
  getJEData(range) {
    const key = range + "-je";
    if (key in this.datas) {
      return this.datas[key];
    }
    const data = localStorage.getItem(key);
    if (data !== null) {
      const res = JSON.parse(data);
      this.datas[key] = res;
      return res;
    }
    const fallback = this.makeFallback(range, "je");
    this.datas[key] = fallback;
    return fallback;
  },

  /**
   * 英和の単語データをとってきます
   * @param {string} range とってくる単語の範囲
   * @return object 単語のデータ
   */
  getEJData(range) {
    const key = range + "-ej";
    if (key in this.datas) {
      return this.datas[key];
    }
    const data = localStorage.getItem(key);
    if (data !== null) {
      const res = JSON.parse(data);
      this.datas[key] = res;
      return res;
    }
    const fallback = this.makeFallback(range, "ej");
    this.datas[key] = fallback;
    return fallback;
  },

  /**
   * ローカルストレージに単語のデータを保存します。
   * @param {string} range 保存する単語の範囲
   * @param {string} type 和英か英和か
   * @param {object} data 保存するデータ
   */
  save(range, type, data) {
    if (!["je", "ej"].includes(type)) {
      throw new Error("タイプの文字列が不正です");
    }
    const key = `${range}-${type}`;
    const json = JSON.stringify(data);
    this.datas[key] = data;
    localStorage.setItem(key, json);
  },

  /**
   * 単語データが存在しないとき初期データを作成するフォールバック関数
   * @param {string} range 単語の範囲
   * @param {string} type テストの種類(和英か英和か)
   * @return object フォールバック初期データ
   */
  makeFallback(range, type) {
    const res = {
      unseen: {},
      incorrect: {},
      correct: {},
      mastered: {},
    };

    const raw = type == "je" ? this.raw[range] : this.invert(this.raw[range]);

    const time = Date.now();

    for (const [q, a] of Object.entries(raw)) {
      if (Math.random() >= 0.75) {
        res.unseen[q] = time;
      } else if (Math.random() >= 0.5) {
        res.incorrect[q] = time;
      } else if (Math.random() >= 0.25) {
        res.correct[q] = time;
      } else {
        res.mastered[q] = time;
      }
    }

    return res;
  },

  /**
   * 生データを逆変換する
   * @param {object} data 生データ
   * @return object 逆変換生データ
   */
  invert(data) {
    const result = {};

    Object.entries(data).forEach(([ja, en]) => {
      const enList = Array.isArray(en) ? en : [en];

      enList.forEach((word) => {
        if (result[word]) {
          result[word].push(ja);
        } else {
          result[word] = [ja];
        }
      });
    });

    Object.keys(result).forEach((key) => {
      if (result[key].length == 1) {
        result[key] = result[key][0];
      }
    });

    return result;
  },
};
