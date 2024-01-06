export function setScrollBody(option: string) {
  if (process.client) {
    let nuxtDiv = document.querySelector("body");

    if (nuxtDiv) {
      if (option === "remove") {
        nuxtDiv.style.overflowY = "hidden";
      } else {
        nuxtDiv.style.overflowY = "auto";
      }
    }
  }
}

export function decodeHtml(value: any) {
  let txt = document.createElement("textarea");
  txt.innerHTML = value;
  return txt.value;
}

export function formatDate(date: any) {
  return `${(new Date(date).getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${new Date(date)
    .getDate()
    .toString()
    .padStart(2, "0")}-${new Date(date).getFullYear()}`;
}
