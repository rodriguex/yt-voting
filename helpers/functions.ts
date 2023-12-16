export function setScrollBody(option: string) {
  let nuxtDiv = document.getElementById("__nuxt");

  if (nuxtDiv) {
    if (option === "remove") {
      nuxtDiv.style.overflowY = "hidden";
    } else {
      nuxtDiv.style.overflowY = "auto";
    }
  }
}
