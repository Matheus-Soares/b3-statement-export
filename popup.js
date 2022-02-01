// Prevent any jQuery code from running before the document is finished loading.
$(function () {

    function convertTableToCSV(tableContent) {
        var operations = $("<div></div>").html(tableContent.content).find("div.table-content__item.pointer")
        var result = "Data;Papel;Qtde;Valor;Tipo\n"
        var skippedOperations = 0

        for (let op of operations) {
            // Check if the value is positive
            if ($(op).find("div.value.positive.icon-positive").length > 0) {
                var settlement = $(op).find("div.settlement > soma-caption.date.soma-caption.hydrated").text()
                var value = $(op).find("div.value.positive.icon-positive > soma-caption.value.soma-caption.hydrated").text().replace("R$ ", "")
                var description = $(op).find("div.description > soma-caption.description.soma-caption.hydrated").text().replace(/\s+/g, "").trim()

                if (description.includes("RENDIMENTO")) {
                    const regexRendimentos = new RegExp("RENDIMENTO(.+)PAPEL(.+)", "g")
                    const [_, quantity, ticket] = regexRendimentos.exec(description)
                    result += [settlement, ticket, quantity, value, "Rendimento", "\n"].join(";")
                } else if (description.includes("JUROSS/CAPITAL")) {
                    const regexJuros = new RegExp("JUROSS\/CAPITAL([0-9]+)([A-Z0-9]+)", "g")
                    const [_, quantity, ticket] = regexJuros.exec(description)
                    result += [settlement, ticket, quantity, value, "Juros s/ Capital", "\n"].join(";")
                } else if (description.includes("DIVIDENDOS")) {
                    const regexDividendos = new RegExp("DIVIDENDOS([0-9]+)([A-Z0-9]+)")
                    const [_, quantity, ticket] = regexDividendos.exec(description)
                    result += [settlement, ticket, quantity, value, "Dividendos", "\n"].join(";")
                } else skippedOperations++
            }
        }
        result += "\n\nSkipped Operations = " + skippedOperations

        $("#resultText").val(result)
    }


    $("#convert").click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var currTabId = tabs[0].id

            chrome.tabs.sendMessage(tabs[0].id, { method: "getExchangeStatement" }, convertTableToCSV);
        });
    })

    $("#copyToClipboard").click(function () {
        const text = $("#resultText").val();
        navigator.clipboard.writeText(text)
    })

});
