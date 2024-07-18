document.addEventListener("DOMContentLoaded", function () {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.method === "getStatement") {
                let table = $('.b3i-extrato-conteudo__tabela.fundo-extrato').html();
                sendResponse({ content: table });
            }
        }
    );
});
