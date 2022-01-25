function convertTableToCSV(tableContent) {
    var div = document.createElement("div")
    div.innerHTML = tableContent.content
    var operations = div.getElementsByClassName("table-content__item pointer")
    var result = "Data;Papel;Qtde;Valor;Tipo\n"
    var skippedOperations = 0
    for (let op of operations) {
        // Check if the value is positive
        if (op.getElementsByClassName("value positive icon-positive").length > 0) {
            var settlement = op.getElementsByClassName("settlement")[0].getElementsByClassName("date soma-caption hydrated")[0].innerText
            var value = op.getElementsByClassName("value positive icon-positive")[0].getElementsByClassName("value soma-caption hydrated")[0].innerText.replace("R$ ", "")
            var description = op.getElementsByClassName("description")[0].getElementsByClassName("description soma-caption hydrated")[0].innerText.replace(/\s+/g, "").trim()

            if (description.includes("RENDIMENTO")) {
                const regexRendimentos =  new RegExp("RENDIMENTO(.+)PAPEL(.+)", "g")
                const [_, quantity, ticket] = regexRendimentos.exec(description)
                result += [settlement, ticket, quantity, value, "Rendimento", "\n"].join(";")
            } else if (description.includes("JUROSS/CAPITAL")) {
                const regexJuros = new RegExp("JUROSS\/CAPITAL([0-9]+)([A-Z0-9]+)", "g")
                const [_, quantity, ticket] = regexJuros.exec(description)
                result += [settlement, ticket, quantity, value,  "Juros s/ Capital", "\n"].join(";")
            } else if (description.includes("DIVIDENDOS")) {
                const regexDividendos = new RegExp("DIVIDENDOS([0-9]+)([A-Z0-9]+)")
                const [_, quantity, ticket] = regexDividendos.exec(description)
                result += [settlement, ticket, quantity, value,  "Dividendos", "\n"].join(";")
            } else skippedOperations++
        }
    }
    result += "\n\n Skipped Operations = " + skippedOperations

    document.getElementById("resultText").value = result
}


document.getElementById("convert").onclick = function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        var currTabId = tabs[0].id

        chrome.tabs.sendMessage(tabs[0].id, { method: "getExchangeStatement" }, convertTableToCSV);
    });
}

document.getElementById("copyToClipboard").onclick = function () {
    document.querySelector("textarea").select();
    document.execCommand('copy');
    document.querySelector("textarea")
}