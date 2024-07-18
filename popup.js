// Prevent any jQuery code from running before the document is finished loading.
$(function () {
    function popupI18n() {
        let objects = document.getElementsByTagName("html");
        for (let obj of objects) {
            let tag = obj.innerHTML.toString();
            let newValue = tag.replace(/__MSG_(\w+)__/g, function (match, v1) {
                return v1 ? chrome.i18n.getMessage(v1) : "";
            });

            if (newValue != tag) {
                obj.innerHTML = newValue;
            }
        }
    }

    popupI18n();

    function formatDate(dateStr) {
        const months = {
            "JANEIRO": "01",
            "FEVEREIRO": "02",
            "MARÇO": "03",
            "ABRIL": "04",
            "MAIO": "05",
            "JUNHO": "06",
            "JULHO": "07",
            "AGOSTO": "08",
            "SETEMBRO": "09",
            "OUTUBRO": "10",
            "NOVEMBRO": "11",
            "DEZEMBRO": "12"
        };

        const split = dateStr.split(" ");
        const day = split[1];
        const month = months[split[3].toUpperCase()];
        const year = split[5];

        // Date format DD/MM/YYYY
        return `${day.padStart(2, '0')}/${month}/${year}`;
    }


    function initTable() {
        let table = $("#resultTable").DataTable({
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
                        filename: "b3Statement.csv"
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
        let table = $("#resultTable").DataTable();
        table.clear().draw()

        let operations = $('<div></div>').html(tableContent).find('b3-table.tabela-desktop');

        operations.each(function (index, day) {
            let date = $(day).find('#left_info_tabela-extrato_top').text()
            let formattedDate = formatDate(date)

            let rows = $(day).find(".cdk-row.ng-star-inserted");

            const allowedMovements ={
                "dividendo": "Dividendos",
                "jurossobrecapitalpróprio": "Juros s/ Capital",
                "rendimento": "Rendimento"
            }

            rows.each(function (index, row){
                let operationType = $(row).find('.cdk-cell.cdk-column-tipoOperacao.ng-star-inserted > span')
                    .text()
                    .replace(/\s+/g, "")
                    .trim()
                    .toLowerCase()

                let movementType = $(row).find('.cdk-cell.cdk-column-tipoMovimentacaoFormatado.ng-star-inserted > span')
                    .text()
                    .replace(/\s+/g, "")
                    .trim()
                    .toLowerCase()

                if (operationType === 'saída' || !(movementType in allowedMovements)) {
                    return;
                }

                let quantity = $(row).find('.cdk-cell.cdk-column-quantidade.ng-star-inserted > span')
                    .text()
                    .replace(/\s+/g, "")
                    .trim()

                let value = $(row).find('.cdk-cell.cdk-column-valorOperacao.ng-star-inserted > span')
                    .text()
                    .replace("R$ ", "")

                let description = $(row).find('.cdk-cell.cdk-column-nomeProduto.ng-star-inserted > span')
                    .text()

                let brokerDescription = $(row).find('.cdk-cell.cdk-column-instituicao.ng-star-inserted > span')
                    .text()

                let broker = ""
                switch (brokerDescription) {
                    case " XP INVESTIMENTOS CCTVM S/A ":
                        broker = "Rico";
                        break;
                    case " NU INVEST CORRETORA DE VALORES S.A. ":
                        broker = "Nuinvest";
                        break;
                    default:
                        broker = brokerDescription;
                }

                const regexTicker = new RegExp( "([A-Z]{4}[0-9]{1,2}).*", "g")
                const [_, ticker] = regexTicker.exec(description)

                table.row.add([formattedDate, ticker, quantity, value, allowedMovements[movementType], broker]).draw()
            })
        });
    }

    $("#convert").click(function () {
        chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {method: "getStatement"}, function (response) {
                readStatement(response.content);
            });
        });
    });
});
