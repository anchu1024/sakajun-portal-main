const range = [
  "1. 日米が地熱エネルギーでの協力に合意",
  "2. サバと火山は、気候変動について何を語りうるのだろうか",
  "3. 世界保健機関:大気汚染の削減によって何百万人もの命を救える可能性",
];

let userSubmitResolve = null;

const rangeHolder = $(".range-holder");
for (let i = 0; i < range.length; i++) {
  rangeHolder.append(`
  <label class="checkbox">
    <input type="checkbox" data-idx="${i}">
    <span>${range[i]}</span>
  </label>`);
}

let data = [];
fetch("../data/core1900.json")
  .then((res) => res.text())
  .then((text) => {
    text = text.replace("!", `"`);
    data = d;
    popup("データが読み込まれました。", "info");
  })
  .catch((e) =>
    popup(`データが読み込めませんでした。${e.toString()}`, "error")
  );

$("#settings-form").on("submit", (e) => {
  e.preventDefault();
  const idxs = [...document.querySelectorAll(".checkbox input:checked")].map(
    (el) => Number(el.dataset.idx)
  );
  if (idxs.length == 0) {
    error(
      "範囲がありません。上記のチェックボックスから選択してください。",
      "error"
    );
    return;
  }
  const probCount = Number(probCounter.get().value);
  startTest(idxs, probCount);
});

const probCounter = $("#prob-counter");

$("#dec").on("click", (e) => {
  e.preventDefault();
  probCounter.get().stepDown();
});

$("#inc").on("click", (e) => {
  e.preventDefault();
  probCounter.get().stepUp();
});

$(".btn-holder").on("click", (e) => {
  e.preventDefault();
  userSubmitResolve();
});

async function startTest(indexes, count) {
  await GsapAsync.to(".settings", { opacity: 0, duration: 0.2 });
  $(".settings").css("display", "none");
  const questions = [];
  const answers = [];
  let target = data;
  const n = indexes.length;
  for (const el of target) {
    el.sort((a, b) => Math.random() - 0.5);
  }
  for (let i = 0; i < count; i++) {
    questions.push(target[indexes[i % n]][Math.floor(i / n)].j);
  }
  const title = $(".problem-number");
  const display = $(".problem-display");
  const answerSheet = $(".answer-sheet").get();
  title.text(`問題1`);
  display.text(questions[0]);
  answerSheet.value = "";
  $(".test").css("opacity", 0).css("display", "flex");
  GsapAsync.to(".test", { opacity: 1, duration: 0.2 });

  for (let i = 0; i < count; i++) {
    title.text(`問題${i + 1}`);
    display.text(questions[i]);
    answerSheet.value = "";
    if (i == count - 1) {
      $(".btn-holder").addClass("last-problem");
    }
    await waitUserInput();
    answers.push(answerSheet.value);
    console.log(answers);
  }
}

async function displayResult(questions, answers) {
  await GsapAsync.to(".test", { opacity: 0, duration: 0.2 });
  $(".test").css("display", "none");
  $(".btn-holder").removeClass("last-problem");
  const resDom = $(".result");
  for (let i = 0; i < questions.length; i++) {
    const res = diffWords(questions[i], answers[i]);
    resDom.append(makeResUI(res));
  }
}

function makeResUI(res) {
  const holder = $.create("div").addClass("result-holder");
  for (let i = 0; i < res.length; i++) {
    const type = res[i].type;
    if (type == "equal") {
      const word = res[i].word;
      holder.append(`
        <div class="accurate">${escape(res[i].word)}</div>
      `);
    } else if (type == "missing") {
      holder.append(`
        <div class="missing">${escape(res[i].word)}</div>
      `);
    } else if (type == "extra") {
      holder.append(`
        <div class="extra">${escape(res[i].word)}</div>
      `);
    } else if (type == "spell") {
      holder.append(`
        <div class="spellmiss" data-wrong="${escape(
          res[i].from
        )}" data-correct="${escape(res[i].to)}"></div>
      `);
    }
    holder.append(document.createTextNode(" "));
  }
  return holder.get();
}

function waitUserInput() {
  const promise = new Promise((resolve) => {
    userSubmitResolve = resolve;
  });
  return promise;
}
