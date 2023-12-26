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
