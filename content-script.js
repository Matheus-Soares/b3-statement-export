chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.method === "getExchangeStatement") {
            var frameHolder = document.getElementsByClassName("frame-holder")[0]
                .getElementsByTagName("iframe")[0]
                .contentWindow.document.body
                .getElementsByClassName("exchange-statement")
            var statement = Array.from(frameHolder)[0]
            sendResponse({ content: statement.outerHTML });
        }
    }
);