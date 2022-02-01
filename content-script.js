chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method === "getExchangeStatement") {
            var iframe = $.find("div.frame-holder > iframe")[0].contentWindow.document.body
            var statement = $(iframe).find("div.exchange-statement").html()
            sendResponse({ content: statement });
        }
    }
);