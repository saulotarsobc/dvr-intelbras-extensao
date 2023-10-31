chrome.runtime.onInstalled.addListener(() => {
    console.log('Service worker instalado!');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

    console.log(message);

    if (chrome.runtime.lastError) {
        console.error('Erro na extensão:', chrome.runtime.lastError);
        return;
    }
    
});
