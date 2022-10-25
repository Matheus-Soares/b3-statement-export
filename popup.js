// Prevent any jQuery code from running before the document is finished loading.
$(function () {
    function popupI18n() {
        var objects = document.getElementsByTagName("html");
        for (let obj of objects) {
            var tag = obj.innerHTML.toString();
            var newValue = tag.replace(/__MSG_(\w+)__/g, function (match, v1) {
                return v1 ? chrome.i18n.getMessage(v1) : "";
            });

            if (newValue != tag) {
                obj.innerHTML = newValue;
            }
        }
    }

    popupI18n();

    function initTable() {
        var table = $("#resultTable").DataTable({
            dom: "Bfrtip",
            buttons: [
                {
                    extend: "copyHtml5",
                    fieldBoundary: "",
                    fieldSeparator: ";"
                },
                {
                    extend: "csvHtml5",
                    fieldBoundary: "",
                    fieldSeparator: ";",
                    filename: "clearStatement.csv"
                }
            ],
            paging: false,
            searching: false,
            ordering: true,
            columnDefs: [{
                targets: 0,
                render: function (data, type, row) {
                    if (type === "sort") {
                        return moment(data, "DD/MM/YYYY").format("YYYY/MM/DD")
                    }
                    return data
                }
            }]
        }
        );

        table.clear().draw();
    }

    initTable();

    function readStatements(tableContent) {
        var operations = $("<div></div>")
            .html(tableContent.content)
            .find("div.table-content__item.pointer")

        var table = $("#resultTable").DataTable()
        table.clear().draw()
        for (let op of operations) {
            // Check if the value is positive
            if ($(op).find("div.value.positive.icon-positive").length > 0) {
                var settlement = $(op)
                    .find("div.settlement > soma-caption.date.soma-caption.hydrated")
                    .text()
                var value = $(op)
                    .find("div.value.positive.icon-positive > soma-caption.value.soma-caption.hydrated")
                    .text()
                    .replace("R$ ", "")
                var description = $(op).find("div > soma-caption.description.soma-caption.hydrated")
                    .text()
                    .replace(/\s+/g, "")
                    .trim()

                if (description.includes("RENDIMENTO")) {
                    const regexRendimentos = new RegExp("RENDIMENTO(.+)PAPEL(.+)", "g")
                    const [_, quantity, ticker] = regexRendimentos.exec(description)

                    table.row.add([settlement, ticker, quantity, value, "Rendimento"]).draw()
                } else if (description.includes("JUROSS/CAPITAL")) {
                    const regexJuros = new RegExp("JUROSS\/CAPITAL([0-9]+)([A-Z0-9]+)", "g")
                    const [_, quantity, ticker] = regexJuros.exec(description)

                    table.row.add([settlement, ticker, quantity, value, "Juros s/ Capital"]).draw()
                } else if (description.includes("DIVIDENDOS")) {
                    const regexDividendos = new RegExp("DIVIDENDOS([0-9]+)([A-Z0-9]+)")
                    const [_, quantity, ticker] = regexDividendos.exec(description)

                    table.row.add([settlement, ticker, quantity, value, "Dividendos"]).draw()
                }
            }
        }
    }

    $("#convert").click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "getExchangeStatement" }, readStatements);
        });
    })
});
