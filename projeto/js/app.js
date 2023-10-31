function main() {
  console.log(["main", 234]);
}

const email = document.querySelector("#email");
const img = document.querySelector("img");
console.log(email);

img.addEventListener("click", () => {
  console.log(img.src);
});

// Execute a função inicialmente
main();

// Configura um MutationObserver para aplicar o estilo aos novos elementos adicionados com a classe 'atend_aguard'
const observer = new MutationObserver(main);
observer.observe(document.body, {
  childList: true,
  subtree: true,
});