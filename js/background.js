chrome.runtime.onInstalled.addListener(() => {
    console.log('Service worker instalado!');
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'achieved_condition') {

        // Verificar se o contexto da extensão ainda está válido
        if (chrome.runtime.lastError) {
            console.error('Erro na extensão:', chrome.runtime.lastError);
            return;
        }
    }
});
