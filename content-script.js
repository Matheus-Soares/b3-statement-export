document.addEventListener("DOMContentLoaded", function () {
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            if (request.method === "getStatement") {
                var table = $('#account-statement > div > div:nth-child(2) > div > table').html()
                sendResponse({ content: table });
            }
        }
    );
});
