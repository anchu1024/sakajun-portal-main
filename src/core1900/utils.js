function popup(str, level = "normal") {
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

// diff-match-patch が必要
// import { diff_match_patch, DIFF_EQUAL, DIFF_DELETE, DIFF_INSERT } from "diff-match-patch";

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function diffWords(userText, answerText) {
  const dmp = new diff_match_patch();
  let diffs = dmp.diff_main(userText, answerText);
  dmp.diff_cleanupSemantic(diffs);

  // 文字単位 → 単語単位に変換
  const wordDiffs = [];
  for (const [op, text] of diffs) {
    const parts = text
      .split(/(\s+)/)
      .filter((w) => w.trim() !== "" || w === " ");
    for (const p of parts) {
      if (p.trim() === "") continue; // 空白は無視
      wordDiffs.push([op, p]);
    }
  }

  // 単語単位で分類
  const result = [];
  let i = 0;

  while (i < wordDiffs.length) {
    const [op, word] = wordDiffs[i];

    if (op === DIFF_EQUAL) {
      result.push({ type: "equal", word });
      i++;
      continue;
    }

    // DELETE + INSERT が連続 → スペルミスの可能性
    if (
      op === DIFF_DELETE &&
      i + 1 < wordDiffs.length &&
      wordDiffs[i + 1][0] === DIFF_INSERT
    ) {
      const delWord = word;
      const insWord = wordDiffs[i + 1][1];

      const dist = levenshtein(delWord, insWord);

      if (dist <= 2) {
        result.push({
          type: "spell",
          from: delWord,
          to: insWord,
        });
      } else {
        result.push({ type: "missing", word: delWord });
        result.push({ type: "extra", word: insWord });
      }

      i += 2;
      continue;
    }

    // 単独 DELETE → 単語抜け
    if (op === DIFF_DELETE) {
      result.push({ type: "missing", word });
      i++;
      continue;
    }

    // 単独 INSERT → 余計な単語
    if (op === DIFF_INSERT) {
      result.push({ type: "extra", word });
      i++;
      continue;
    }

    i++;
  }

  return result;
}
