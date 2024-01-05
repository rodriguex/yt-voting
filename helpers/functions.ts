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
