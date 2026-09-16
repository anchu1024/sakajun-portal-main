const allowList = [
  "s64005@salesio-gakuin.ac.jp",
  "s64092@salesio-gakuin.ac.jp",
];

const allowed = sessionStorage.getItem("isAllowed");
const email = sessionStorage.getItem("mail");
const ticket = localStorage.getItem("code");
if (
  hash1(ticket) !== "959850f2" &&
  (allowed != "Yes" || !allowList.includes(email))
) {
  sessionStorage.setItem("isAllowed", "No");
  sessionStorage.setItem("mail", "invaild");
  window.location.href = "./tango.html";
}
if (hash1(ticket) !== "959850f2") {
  window.location.href = "./password.html";
}

function hash1(str) {
  if (typeof str !== "string") return 0;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}
