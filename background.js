// A function to use as callback
function doStuffWithDom(domContent) {
    console.log('I received the following DOM content:\n' + domContent);
}

// When the browser-action button is clicked...
chrome.browserAction.onClicked.addListener(function (tab) {
    console.log("Sending message to Content Script")
    // ...if it matches, send a message specifying a callback too
    chrome.tabs.sendMessage(tab.id, { text: 'getDom' }, doStuffWithDom);
});
