chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method === "getTableContent") {
            var element = document.getElementsByClassName("exchange-statement")[0].outerHTML
            alert(element)
            var tablecontent = JSON.stringify(element)
            alert(tablecontent)
            sendResponse({ content: tablecontent });
        }
    }
);
