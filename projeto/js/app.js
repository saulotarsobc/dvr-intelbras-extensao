function main() {
  console.log("✅ Iniciando...");
}

const addListeners = () => {
  document.querySelector("img")?.addEventListener("click", (el) => {
    console.log("✅ Clicado", el.target);
  });
};

setTimeout(() => {
  addListeners();
}, 3000);

// Execute a função inicialmente
main();

// MutationObserver
const observer = new MutationObserver(main);
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
