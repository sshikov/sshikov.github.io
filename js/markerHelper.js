"use strict";

(function (window) {
    window.markerHelper = {};

    markerHelper.populateMarkers = function (settings) {
        var dataSource = settings && settings.filteredData || globals.inputData;
	    var set= globals.activeMarkerSet;
        for (var i = 0; i < dataSource.length; i++) {
            var arrElement = dataSource[i];
            var markerIcon = undefined;
            var popupString;
            [popupString, markerIcon]= markerHelper.elements[arrElement.type](arrElement, set, settings);
//            [popupString, markerIcon]= markerHelper.due(arrElement, set, popupString, markerIcon)
//            [popupString, markerIcon]= markerHelper.overdue(arrElement, set, popupString, markerIcon)

            if (markerIcon) {
                var m = L.marker(L.latLng(arrElement.lat, arrElement.lng), { title: arrElement.atmId, icon: markerIcon });
                m.number = i;
                m.bindPopup(popupString);
                globals.markerClusterLayer.addLayer(m);
            }
        }
    };

    markerHelper.due= function(arrElement, set, popupString, markerIcon) {
        if (set.has('DUE')) {
            var due = Number(arrElement.due);
            if (due > 0) {
    	        popupString= _.concat(popupString, [
    	            "<b>Долги по кредитам</b> " + Math.round(due * 100) + "% из "+arrElement.total
//        	        , arrElement.type+" id - " + arrElement.atmId
//        	        , " Адрес " + arrElement.address
                ]);
    	        //+ "<br>" + " Координаты " + arrElement.latlng
                markerIcon = L.AwesomeMarkers.icon({icon: 'coffee', markerColor: "cadetblue"});
//                'red', 'darkred', 'orange', 'green', 'darkgreen', 'blue', 'purple', 'darkpuple', 'cadetblue'
    	        console.log("due", popupString, markerIcon)
    	    }
        }
    	return [popupString, markerIcon]
    };

    markerHelper.overdue= function(arrElement, set, popupString, markerIcon) {
        if (set.has('OVERDUE')) {
            var overdue = Number(arrElement.overdue);
            if (overdue > 0) {
        		popupString= _.concat(popupString, [
        		    "<br><b>Просроченные долги по кредитам</b> " + Math.round(overdue * 100) + "% из "+arrElement.total
//        		    , arrElement.type+" id - " + arrElement.atmId
//        		    , " Адрес " + arrElement.address
        		]);
        		//+ "<br>" + " Координаты " + arrElement.latlng
                markerIcon = L.AwesomeMarkers.icon({icon: 'coffee', markerColor: "black"});
    	    }
        }
    	return [popupString, markerIcon]
    };

    markerHelper.elements= {
        "ATM": function(arrElement, set, settings) {
            var popupString= [];
            var markerIcon= undefined;
            if (set.has('ATMPOS')) {
                console.log('ATMPOS')
                popupString= [
                    "<b>ATM</b> id - " + arrElement.atmId
                    , " Интегр. показатель - " + Math.round(arrElement.coefficient * 100) / 100
                    , " Снятие (кол-во) - " + arrElement.cashOutCount
                    , " Снятие - " + arrElement.cashOut
                    , " Внесение (кол-во) - " + arrElement.cashInCount
                    , " Внесение - " + arrElement.cashIn
        		    , " Адрес " + arrElement.address
                ];
                var markerIcon = L.AwesomeMarkers.icon({icon: 'credit-card', markerColor: 'red'});
            }
//            console.log("atm", popupString, markerIcon);
            [popupString, markerIcon]= markerHelper.due(arrElement, set, popupString, markerIcon);
            [popupString, markerIcon]= markerHelper.overdue(arrElement, set, popupString, markerIcon);
            return [_.join(_.uniq(popupString), "<br>"), markerIcon]
        }
        , "POS": function(arrElement, set, settings) {
            var popupString= [];
            var markerIcon= undefined;
            if (set.has('ATMPOS')) {
                var popupString= [
                    "<b>POS</b> id - " + arrElement.posId + " " +arrElement.name
                    , " Интегр. показатель - " + Math.round(arrElement.coefficient * 100) / 100
                    , " Средняя транзакция - " + arrElement.transAvg
                    , " Кол-во транзакций - " + arrElement.transCount
                    , " Адрес " + arrElement.address
//                    , " LATLNG " + arrElement.latlng
                ];
                markerIcon = L.AwesomeMarkers.icon({icon: 'shopping-cart', markerColor: 'blue'});
            }
//            console.log("pos", popupString, markerIcon);
            [popupString, markerIcon]= markerHelper.due(arrElement, set, popupString, markerIcon);
//            console.log("due", popupString, markerIcon);
            [popupString, markerIcon]= markerHelper.overdue(arrElement, set, popupString, markerIcon);
//            console.log("overdue", popupString, markerIcon);
            return [_.join(_.uniq(popupString), "<br>"), markerIcon]
        }
        , "VSP": function(arrElement, set, settings) {
            var popupString= [];
            var markerIcon= undefined;
            if (set.has('ATMPOS')) {
                popupString = [
                    "<b>ВСП " + arrElement.subbranch_name + "</b>"
                    , " id - " + arrElement.subbranch_id
                    , " Кол-во клиентов - " + arrElement.count
        		    , " Адрес " + arrElement.address
                ];
                markerIcon = L.AwesomeMarkers.icon({icon: 'university', markerColor: "green"});
            }
            [popupString, markerIcon]= markerHelper.due(arrElement, set, popupString, markerIcon)
            [popupString, markerIcon]= markerHelper.overdue(arrElement, set, popupString, markerIcon)
            return [_.join(_.uniq(popupString), "<br>"), markerIcon]
        }
        , "asun": function(arrElement, set, settings) {
            var popupString= "";
            var markerIcon= undefined;
            if (set.has('RENT')) {	//asun
                popupString = "<b>" + arrElement.division_name + "</b>"
                    + "<br>" + arrElement.object_name
                    + "<br>" + " Площадь - " + arrElement.area
                    + "<br>" + " Ставка аренды (руб/мес) - " + arrElement.cost
                ;
                markerIcon = L.AwesomeMarkers.icon({icon: 'home', markerColor: "darkred"});
            }
            return [popupString, markerIcon]
        }
        , "marketrent": function(arrElement, set, settings) {
            var popupString= "";
            var markerIcon= undefined;
            var show= (
                !settings || (
                       (typeof settings.realtyAreaMin === 'undefined' || arrElement.square >= settings.realtyAreaMin)
                    && (typeof settings.realtyAreaMax === 'undefined' || arrElement.square <= settings.realtyAreaMax)
                    && (typeof settings.realtyFloorMin === 'undefined' || arrElement.floor >= settings.realtyFloorMin)
                    && (typeof settings.realtyFloorMax === 'undefined' || arrElement.floor <= settings.realtyFloorMax)
                    && (typeof settings.selectedRealtyTypes === 'undefined' || settings.selectedRealtyTypes.includes(arrElement.realtyType.toLowerCase()))
                )
            )
            if (set.has('MARKETRENT') && show) {
                popupString = "<b>" + arrElement.realtyType + "</b>"
                    + "<br>" + " id - " + arrElement.id
                    + "<br>" + " Этаж - " + arrElement.floor + (arrElement.maxFloor ? "/" + arrElement.maxFloor : "")
                    + "<br>" + " Стоимость - " + arrElement.price
                    + "<br>" + " Площадь - " + arrElement.square + " кв.м."
                    + "<br>" + " Стоимость кв.м. - " + arrElement.sqmPrice
                    + "<br>" + " Адрес - " + arrElement.address
//                    + "<br>" + "<a target=\"_blank\" href=\"" + arrElement.link + "\">Ссылка</a>"
                ;
//    	        console.log("MARKETRENT", popupString)
                markerIcon = L.AwesomeMarkers.icon({icon: 'home', markerColor: "orange"});
            }
            return [popupString, markerIcon]
        }
    }

    markerHelper.findMarkersFromPolygon = function (poly) {
        var polyPoints = poly.getLatLngs();
        var left = 999,
            right = 0,
            up = 0,
            down = 999;
        for (var i = 0; i < polyPoints.length; i++) {
            left = Math.min(left, polyPoints[i].lng);
            right = Math.max(right, polyPoints[i].lng);
            down = Math.min(down, polyPoints[i].lat);
            up = Math.max(up, polyPoints[i].lat);
        }

        var inputDataTemp = $.grep(globals.inputData, function (n) {
            return n.lng >= left && n.lng <= right && n.lat >= down && n.lat <= up;
        });

        var result = [];
        for (var i = 0; i < inputDataTemp.length; i++) {
            if (ifMarkerInPolygon(poly, inputDataTemp[i])) {
                result.push(inputDataTemp[i]);
            }
        }
        return result;
    };

    markerHelper.ifMarkerInPolygon = function (poly, marker) {
        var polyPoints = $.isArray(poly) ? poly : poly.getLatLngs();
        var x = marker.lat,
            y = marker.lng;
        var inside = false;
        for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            var xi = polyPoints[i].lat,
                yi = polyPoints[i].lng;
            var xj = polyPoints[j].lat,
                yj = polyPoints[j].lng;
            var intersect = yi > y != yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    };
})(window);
