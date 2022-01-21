function convertTableToCSV(tableContent) {
    document.getElementById("resultText").value = tableContent.content
}


document.getElementById("convert").onclick = function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var currTabId = tabs[0].id

        chrome.tabs.sendMessage(tabs[0].id, {method: "getTableContent"}, convertTableToCSV);
      });      
}

document.getElementById("copyToClipboard").onclick = function() {
    document.querySelector("textarea").select();
    document.execCommand('copy');
    document.querySelector("textarea")
}