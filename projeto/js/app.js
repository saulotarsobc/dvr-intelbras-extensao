const main = async () => {
  console.log('main');
}

main();

/* observer */
const observer = new MutationObserver(main);
observer.observe(document.body, { childList: true, subtree: true });