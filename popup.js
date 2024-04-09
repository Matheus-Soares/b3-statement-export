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

    function readStatement(tableContent) {

        var table = $("#resultTable").DataTable()
        table.clear().draw()

        var operations = $('<div></div>').html(tableContent).find('tbody tr')

        operations.each(function (index, row) {
            var date = $(row).find('td:nth-child(1)').text()
            var description = $(row).find('td:nth-child(3)')
                .text()
                .replace(/\s+/g, "")
                .trim()
            var value = $(row).find('td:nth-child(4)')
                .text()
                .replace("R$ ", "")

            if (description.includes("Rendimento")) {
                const regexRendimentos = new RegExp("Rendimentos/([0-9.]+)([A-Z]{4}[0-9]{1,2}B?).*", "g")
                const [_, quantity, ticker] = regexRendimentos.exec(description)

                table.row.add([date, ticker, quantity, value, "Rendimento"]).draw()
            } else if (description.includes("Juros")) {
                const regexJuros = new RegExp("Jurosdecapitalproprios/([0-9.]+)([A-Z]{4}[0-9]{1,2}B?)", "g")
                const [_, quantity, ticker] = regexJuros.exec(description)

                table.row.add([date, ticker, quantity, value, "Juros s/ Capital"]).draw()
            } else if (description.includes("Dividendos")) {
                const regexDividendos = new RegExp("Dividendoss/([0-9.]+)([A-Z]{4}[0-9]{1,2}B?)")
                const [_, quantity, ticker] = regexDividendos.exec(description)

                table.row.add([date, ticker, quantity, value, "Dividendos"]).draw()
            }
        });
    }

    $("#convert").click(function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { method: "getStatement" }, function (response) {
                readStatement(response.content);
            });
        });
    });
});
