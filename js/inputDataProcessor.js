'use strict';

window.inputDataProcessor = {};

function readAtmData(input, out, type, maxValues) {
    var index = out.length;
    for (var i = 0; i < input.length; i++) {
        var item = {
            type: type,
            id: index++,
            lat: input[i].lat, lng: input[i].lng,
            latlng: input[i]["lat"] + "--" + input[i]["lng"],
            atmId: input[i]["4"],
            address: input[i]['6'],
            code: input[i]['code'],
            cashOut: parseFloat(input[i]["11"] || 0),
            cashOutCount: parseInt(input[i]["12"] || 0),
            cashIn: parseFloat(input[i]["13"] || 0),
            cashInCount: parseInt(input[i]["14"] || 0),
            salary: parseFloat(input[i]["16"] || 0),
            balance: parseFloat(input[i]["17"] || 0),
            due: parseFloat(input[i]["20"] || 0),
            overdue: parseFloat(input[i]["21"] || 0),
            total: parseInt(input[i]["12"] || 0) + parseInt(input[i]["14"] || 0),
            c: parseFloat(input[i]["coefficient"] || 0)
        };
        out.push(item);
        maxValues.atmCashOutMax = Math.max(maxValues.atmCashOutMax, item.cashOut);
        maxValues.atmCashInMax = Math.max(maxValues.atmCashInMax, item.cashIn);
        maxValues.atmCashOutCountMax = Math.max(maxValues.atmCashOutCountMax, item.cashOutCount);
        maxValues.atmCashInCountMax = Math.max(maxValues.atmCashInCountMax, item.cashInCount);
//        maxValues.salary= Math.max(maxValues.salary, currentSalary);
//        maxValues.balance= Math.max(maxValues.balance, currentBalance);
    }
    console.log("atm", maxValues.atmCashOutMax, maxValues.atmCashInMax, maxValues.atmCashOutCountMax, maxValues.atmCashInCountMax);
}

function readPosData(input, out, type, maxValues) {
    var index = out.length;
    for (var i = 0; i < input.length; i++) {
        var item = {
            type: type,
            id: index++,
            name: input[i]["2"],
            atmId: input[i]["4"],
            address: input[i]['6'],
            code: input[i]['code'],
            lat: input[i].lat, lng: input[i].lng,
            posId: input[i]["4"],
            transAvg: parseFloat(input[i]["9"] || 0),
            transCount: parseInt(input[i]["10"] || 0),
            salary: parseFloat(input[i]["16"] || 0),
            balance: parseFloat(input[i]["17"] || 0),
            due: parseFloat(input[i]["20"] || 0),
            overdue: parseFloat(input[i]["21"] || 0),
            latlng: input[i]["lat"] + "--" + input[i]["lng"],
            total: parseInt(input[i]["10"] || 0),
            c: parseFloat(input[i]["coefficient"] || 0)
        };
        out.push(item);
        maxValues.posTransCountMax = Math.max(maxValues.posTransCountMax, item.transCount);
        maxValues.posTransAvgMax = Math.max(maxValues.posTransAvgMax, item.transAvg);
//        maxValues.salary= Math.max(maxValues.salary, currentSalary);
//        maxValues.balance= Math.max(maxValues.balance, currentBalance);
    }
    console.log("pos", maxValues.posTransCountMax, maxValues.posTransAvgMax);
}

function readVspData(input, out, type, maxValues) {
    var index = out.length;
    for (var i = 0; i < input.length; i++) {
        var item = {
            type: type,
            id: index++,
            atmId: input[i]["4"],
            address: input[i]['6'],
            code: input[i]['code'],
            lat: input[i].lat, lng: input[i].lng,
            latlng: input[i]["lat"] + "--" + input[i]["lng"],
            subbranch_id: input[i]["4"],
            subbranch_name: input[i]["5"],
            count: parseInt(input[i]["15"] || 0),
            salary: parseFloat(input[i]["16"] || 0),
            balance: parseFloat(input[i]["17"] || 0),
            due: parseFloat(input[i]["20"] || 0),
            overdue: parseFloat(input[i]["21"] || 0),
            total: parseInt(input[i]["15"] || 0),
            c: parseFloat(input[i]["coefficient"] || 0)
        };
        out.push(item);
        maxValues.vspCountMax = Math.max(maxValues.vspCountMax, item.count);
//        maxValues.salary= Math.max(maxValues.salary, currentSalary);
//        maxValues.balance= Math.max(maxValues.balance, currentBalance);
    }
    console.log("vsp", maxValues.vspCountMax);
}

function readAsunData(input, out, type, maxValues) {
    console.log("readAsunData")
    var index = out.length;
    for (var i = 0; i < input.length; i++) {
        if (input[i].city != globals.currentCity) {
             continue;
        }
        var item = {
            type: type,
            id: index++,
            lat: input[i].lat, lng: input[i].lng,
            asun_id: input[i].asun_id,
            division_name: input[i].division_name,
            object_name: input[i].object_name,
            area: input[i].area_m2,
            cost: input[i].cost_rub_m2,
//	            salary: parseFloat(input[i]["16"] || 0),
//	            balance: parseFloat(input[i]["17"] || 0)
        };
        out.push(item);
        maxValues.areaMax = Math.max(maxValues.areaMax, item.area);
        maxValues.costMax = Math.max(maxValues.costMax, parseFloat(item.cost));
    }
    console.log(out.length)
}

function readFlatData(input, out, type, stats, settings) {
    console.log("readFlatData")
    var index = out.length;

    for (var i = 0; i < input.length; i++) {
        if (input[i]["amt.address_city"] != globals.currentCity) {
            continue;
        }
        var item = {
            type: type,
            id: index++,
            lat: input[i].lat, lng: input[i].lng,
            floor: parseFloat(input[i]["Floor"]),
            address: input[i]["Address"],
            price: parseFloat(input[i]["Price"]),
            maxFloor: parseFloat(input[i]["Total Floors"]),
            square: parseFloat(input[i]["Square"]),
            sqmPrice: parseFloat(input[i]["Price for Square Meter"]),
            realtyType: input[i]["Type of Realty"],
            link: input[i]["Link"],
//	            salary: parseFloat(input[i]["16"] || 0),
//	            balance: parseFloat(input[i]["17"] || 0)
        };
        stats.count++;
        stats.maxFloor = Math.max(stats.maxFloor, parseInt($.isNumeric(item.floor) ? item.floor : stats.maxFloor));
        stats.minFloor = Math.min(stats.minFloor, parseInt($.isNumeric(item.floor) ? item.floor : stats.minFloor));
        stats.maxArea = Math.max(stats.maxArea, item.square);
        stats.minArea = Math.min(stats.minArea, item.square);
        stats.type.add(item.realtyType.toLowerCase());

        out.push(item);
    }
    console.log(out.length)
}

function getDataByType(src, type) {
    return src.filter(function (el) {
        return el["0"] === type;
    });
}
//Перевод исходных данных, переменная в js-файле в массив объектов с приведенными типами и расчитанными weight и coefficient
inputDataProcessor.readInputData = function (settings) {
    console.log("readInputData "+globals.currentCity)

    var result = [];
    var maxValues = {
        posTransCountMax: 0,
        posTransAvgMax: 0,
        atmCashOutMax: 0,
        atmCashInMax: 0,
        atmCashOutCountMax: 0,
        atmCashInCountMax: 0,
        vspCountMax: 0,
        salary: 0,
        balance: 0
    };
    // попробовать вот так!
    var cityData= _.filter(initialInputDataProfile, function (el) {
        return (el["code"] == globals.currentCity);
    })
    console.log(cityData)
    var grouped= _.groupBy(cityData, function(el) {
        return el["0"];
    });
    console.log(grouped)
//	    console.log(
//	    _.chain(cityData).groupBy(function(el) {
//	        return el["0"];
//	    }).value());
    cityData.forEach(function (el) {
        var currentSalary = parseFloat(el["16"] || 0);
        var currentBalance = parseFloat(el["17"] || 0);
        maxValues.salary= Math.max(maxValues.salary, currentSalary);
        maxValues.balance= Math.max(maxValues.balance, currentBalance);
    });

    console.log("ATM", grouped['ATM']||[])
    readAtmData(grouped['ATM']||[], result, "ATM", maxValues);
    console.log("POS", grouped['POS']||[])
    readPosData(grouped['POS']||[], result, "POS", maxValues);
    console.log("VSP", grouped['VSP']||[])
    readVspData(grouped['VSP']||[], result, "VSP", maxValues);

    readAsunData(window.initialInputDataASUN, result, "asun", globals.maxValuesASUN);
    readFlatData(window.initialInputDataFlats, result, "marketrent", globals.realtyStats, settings);

    var atmCashOutWeight = settings && settings.atmCashOutWeight || 0.5,
        atmCashOutCountWeight = settings && settings.atmCashOutCountWeight || 0.5,
        atmCashInWeight = settings && settings.atmCashInWeight || 0.5,
        atmCashInCountWeight = settings && settings.atmCashInCountWeight || 0.5,
        posTransCountWeight = settings && settings.posTransCountWeight || 0.5,
        posTransAvgWeight = settings && settings.posTransAvgWeight || 0.5,
        atmCashOutAmountWeight = settings && settings.atmCashOutAmountWeight || 0.5,
        atmCashInAmountWeight = settings && settings.atmCashInAmountWeight || 0.5,
        vspWeight = settings && settings.vspWeight || 0.5,
        salaryWeight = settings && settings.salaryWeight || 0.5,
        balanceWeight = settings && settings.balanceWeight || 0.5;
    var index = 0;
    console.log(maxValues.balance +" "+maxValues.salary)
    for (var i = 0; i < result.length; i++) {
        result[i].coefficient= 0
        if (result[i].type == "ATM") {
            result[i].coefficient = (
                result[i].cashOut / maxValues.atmCashOutMax * atmCashOutAmountWeight
                    + result[i].cashOutCount / maxValues.atmCashOutCountMax * atmCashOutCountWeight) * atmCashOutWeight
                + (result[i].cashIn / maxValues.atmCashInMax * atmCashInAmountWeight
                    + result[i].cashInCount / maxValues.atmCashInCountMax * atmCashInCountWeight) * atmCashInWeight;
            // result[i].coefficient = result[i].coefficient * 100;
            // result[i].weight = result[i].coefficient;
        } else if (result[i].type == "POS") {
            result[i].coefficient = result[i].transAvg / maxValues.posTransAvgMax * posTransAvgWeight
                + result[i].transCount / maxValues.posTransCountMax * posTransCountWeight;
            // result[i].coefficient = result[i].coefficient * 100;
            // result[i].weight = result[i].coefficient;
        } else if (result[i].type == "VSP") {
            result[i].coefficient = result[i].count / maxValues.vspCountMax * vspWeight;
            // result[i].coefficient = result[i].coefficient * 100;
            // result[i].weight = result[i].coefficient;
        }
        result[i].coefficient = result[i].coefficient * 100;
        result[i].weight = result[i].coefficient;
        if(result[i].type != "asun" && result[i].type != "marketrent") {	// && result[i].type != "zalog" && result[i].type != "sale"
            result[i].coefficient = result[i].coefficient * 0.5
                + 0.5 * (
                     balanceWeight * (result[i].balance || 0) / (maxValues.balance || 1)
                   + salaryWeight * (result[i].salary || 0) / (maxValues.salary || 1)
                )
            ;
        }
    }
    // коэффициенты по ячейкам
    calculateMaxCells(result);
    return result;
};

//Определение масимальных ячеек(сумма weight всех точек из ячейки) разных размеров 100, 200, 400 ... метров на всей карте
function calculateMaxCells(inputData) {
    console.log("calculateMaxCells")
    var selected= $("#citySelect option:selected");
    var x= selected.attr("data-x"); var y= selected.attr("data-y");

    var initX = Number(x); //globals.cityCenters[globals.currentCity].x;
    var initY = Number(y); //globals.cityCenters[globals.currentCity].y;
    var currentMapLeft = initX - globals.minGridCellSizeLng * 30;
    var currentMapRight = initX + globals.minGridCellSizeLng * 30;
    var currentMapDown = initY - globals.minGridCellSizeLat * 30;
    var currentMapUp = initY + globals.minGridCellSizeLat * 30;
    // то, что сейчас показано
    var inputDataTemp = $.grep(inputData, function (n) {
        return n.lng >= currentMapLeft && n.lng <= currentMapRight && n.lat >= currentMapDown && n.lat <= currentMapUp;
    });
    for (var k = 0; k < 5; k++) {
        var cellSizeCoef = Math.pow(2, k);

        var startGridLeft = currentMapLeft - currentMapLeft % (globals.minGridCellSizeLng * cellSizeCoef);
        var startGridDown = currentMapDown - currentMapDown % (globals.gridCellSizeLat * cellSizeCoef);

        var maxCellCoefficient = 0;
        // отбор объектов по координатам?
        for (var i = 0; i < 1000; i++) {
            var shiftedLng = startGridLeft + globals.minGridCellSizeLng * i * cellSizeCoef;
            // отбор объектов по lng
            var filteredByLng = $.grep(inputDataTemp, function (n) {
                return n.lng >= shiftedLng && n.lng < shiftedLng + globals.minGridCellSizeLng * cellSizeCoef;
            });

            // отбор объектов по lat
            for (var j = 0; j < 1000; j++) {
                var shiftedLat = startGridDown + globals.minGridCellSizeLat * j * cellSizeCoef;
                var filteredByLngLat = $.grep(filteredByLng, function (n) {
                    return n.lat >= shiftedLat && n.lat < shiftedLat + globals.minGridCellSizeLat * cellSizeCoef;
                });
                var cellCoefficient = 0;
                for (var m = 0; m < filteredByLngLat.length; m++) {
                    cellCoefficient += filteredByLngLat[m].coefficient || 0;
                }
                maxCellCoefficient = Math.max(maxCellCoefficient, cellCoefficient);
                if (shiftedLat > currentMapUp) {
                    break;
                }
            }
            if (shiftedLng > currentMapRight) {
                break;
            }
        }
        globals.maxCellCoefficients["" + cellSizeCoef * 100] = maxCellCoefficient;
    }
    console.log(globals.maxCellCoefficients)
}
