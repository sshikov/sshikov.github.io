"use strict";

(function (window) {
    window.markerHelper = {};

    markerHelper.populateMarkers = function (settings) {
        var dataSource= globals.inputData;  //settings && settings.filteredData ||
	    var set= globals.activeMarkerSet;
	    var markers= [];
//		globals.markerClusterLayer.clearLayers();
	    _.forEach(dataSource, function(arrElement, i) {
            var markerIcon = undefined;
            var popupString;
            var layer;
            [popupString, markerIcon, layer]= markerHelper.elements[arrElement.type](arrElement, set, settings);

            if (markerIcon) {
                var m = L.marker(L.latLng(arrElement.lat, arrElement.lng), { title: arrElement.atmId, icon: markerIcon, draggable: true, atmId: arrElement.atmId, draggable: false, data: arrElement });
//                var m= markerHelper.pieChartMarker(arrElement);
//                var m= markerHelper.pieChart(arrElement);
/*
                m.on('dragend', function markerMove(moveEvent) {
                    console.debug("marker-moved", moveEvent);
                    var marker= moveEvent.target;
                    var distance= moveEvent.distance;
                    var latlng= marker.getLatLng();
                    console.debug("moved marker", marker.options.atmId, latlng);
                });
*/
                m.number = i;
                m.bindPopup(popupString);
        	    globals.layers[layer].addLayer(m);
//                globals.markerClusterLayer.addLayer(m); // todo выбор слоя
                markers.push(m);
            }
	    });
//        globals.markerClusterLayer.addLayers(markers, true);
    };

    markerHelper.due= function(arrElement, set, popupString, markerIcon, layer) {
//        if (set.has('DUE')) {
            var due = Number(arrElement.due);
            if (due > 0) {
    	        popupString= _.concat(popupString, [
    	            "<span class='due'>"
    	            , "<b>Долги по кредитам</b> " + Math.round(due * 100) + "% из "+arrElement.total
    	            , "</span>"
//        	        , arrElement.type+" id - " + arrElement.atmId
//        	        , " Адрес " + arrElement.address
                    , "<div>"+arrElement.pieSvg+"</div>"
                ]);
    	        //+ "<br>" + " Координаты " + arrElement.latlng
                markerIcon.options.markerColor= "cadetblue";
//    	        console.debug("due", popupString, markerIcon)
    	    }
//        }
    	return [popupString, markerIcon, layer]
    };

    markerHelper.overdue= function(arrElement, set, popupString, markerIcon, layer) {
//        if (set.has('OVERDUE')) {
            var overdue = Number(arrElement.overdue);
            if (overdue > 0) {
        		popupString= _.concat(popupString, [
    	            "<span class='overdue'>"
        		    , "<br><b>Просроченные долги по кредитам</b> " + Math.round(overdue * 100) + "% из "+arrElement.total
    	            , "</span>"
//        		    , arrElement.type+" id - " + arrElement.atmId
//        		    , " Адрес " + arrElement.address
        		]);
        		//+ "<br>" + " Координаты " + arrElement.latlng
//                markerIcon= markerIcon||L.AwesomeMarkers.icon({icon: 'icon-coffee', markerColor: "black"});
                markerIcon.options.markerColor= "black";
    	    }
//        }
    	return [popupString, markerIcon, layer]
    };

    markerHelper.elements= {
        "ATM": function(arrElement, set, settings) {
            var popupString= [];
            var markerIcon= undefined;
            var layer= 'ATMPOS';
//            if (set.has('ATMPOS')) {
//                console.debug('ATMPOS')
                popupString= [
                    "<i class='icon icon-credit-card icon-white'></i> <b>ATM</b> id - " + arrElement.atmId
                    , " Интегр. показатель - " + Math.round(arrElement.coefficient * 100) / 100
                    , " Снятие (кол-во) - " + arrElement.cashOutCount
                    , " Снятие - " + arrElement.cashOut
                    , " Внесение (кол-во) - " + arrElement.cashInCount
                    , " Внесение - " + arrElement.cashIn
        		    , " Адрес " + arrElement.address
                ];
                var markerIcon = L.AwesomeMarkers.icon({icon: 'credit-card', markerColor: 'red'});
//            }
            [popupString, markerIcon, layer]= markerHelper.due(arrElement, set, popupString, markerIcon, layer);
            [popupString, markerIcon, layer]= markerHelper.overdue(arrElement, set, popupString, markerIcon, layer);
            return [_.join(_.uniq(popupString), "<br>"), markerIcon, layer];
        }
        , "POS": function(arrElement, set, settings) {
            var popupString= [];
            var markerIcon= undefined;
            var layer= 'ATMPOS';
//            if (set.has('ATMPOS')) {
                var popupString= [
                    "<i class='icon icon-shopping-cart icon-white'> <b>POS</b> id - " + arrElement.posId + " " +arrElement.name
                    , " Интегр. показатель - " + Math.round(arrElement.coefficient * 100) / 100
                    , " Средняя транзакция - " + arrElement.transAvg
                    , " Кол-во транзакций - " + arrElement.transCount
                    , " Адрес " + arrElement.address
//                    , " LATLNG " + arrElement.latlng
                ];
                markerIcon = L.AwesomeMarkers.icon({icon: 'icon-shopping-cart', markerColor: 'blue'});
//            }
            [popupString, markerIcon, layer]= markerHelper.due(arrElement, set, popupString, markerIcon, layer);
            [popupString, markerIcon, layer]= markerHelper.overdue(arrElement, set, popupString, markerIcon, layer);
            return [_.join(_.uniq(popupString), "<br>"), markerIcon, layer]
        }
        , "VSP": function(arrElement, set, settings) {
            var popupString= [];
            var markerIcon= undefined;
            var layer= 'VSP';
//            if (set.has('VSP')) {
                popupString = [
                    "<i class='icon fa-bank icon-white'> <b>ВСП</b> " + arrElement.subbranch_name
                    , " id - " + arrElement.subbranch_id
                    , " Кол-во клиентов - " + arrElement.count
        		    , " Адрес " + arrElement.address
                ];
                markerIcon = L.AwesomeMarkers.icon({icon: 'bank', prefix: 'fa', markerColor: "green"});
//            }
            [popupString, markerIcon, layer]= markerHelper.due(arrElement, set, popupString, markerIcon, layer)
            [popupString, markerIcon, layer]= markerHelper.overdue(arrElement, set, popupString, markerIcon, layer)
            return [_.join(_.uniq(popupString), "<br>"), markerIcon, layer]
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
                markerIcon = L.AwesomeMarkers.icon({icon: 'icon-home', markerColor: "darkred"});
            }
            return [popupString, markerIcon, 'RENT']
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
                markerIcon = L.AwesomeMarkers.icon({icon: 'icon-home', markerColor: "orange"});
            }
            return [popupString, markerIcon, 'MARKETRENT']
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

    markerHelper.pieChart= function (arrElement) {
        var due= Number(arrElement.due);
        var overdue= Number(arrElement.overdue);
        var nocredit= 1-due;
        var data= [
            { name: 'due', value: due*100 }
            , { name: 'overdue', value: overdue*100 }
            , { name: 'nocredit', value: nocredit*100 }
        ];
        return L.piechartMarker(L.latLng(arrElement.lat, arrElement.lng), { radius: 25, data: data });
    }

    markerHelper.pieChartMarker= function (arrElement) {
		var colorValue = Math.random() * 360;
		var options = {
			color: '#000',
			weight: 1,
			fillColor: 'hsl(' + colorValue + ',100%,50%)',
			radius: 20,
			fillOpacity: 0.7,
			rotation: 0.0,
			position: {
				x: 0,
				y: 0
			},
			offset: 0,
			numberOfSides: 50,
			barThickness: 10
		};
        var due= Number(arrElement.due);
        var overdue= Number(arrElement.overdue);
        var nocredit= 1-due;
//        console.log(due, overdue, nocredit);
        options.data = {
            'due': due*100
            , 'overdue': overdue*100
            , 'nocredit': nocredit*100
        };

        options.chartOptions = {
            'due': {
                fillColor: '#880000',
                minValue: 0,
                maxValue: 100,
                maxHeight: 20,
                displayText: function (value) {
                    return "Кредиты: "+value.toFixed(2);
                }
            }
            , 'overdue': {
                fillColor: '#FF0000',
                minValue: 0,
                maxValue: 100,
                maxHeight: 20,
                displayText: function (value) {
                    return "Просроченные кредиты: "+value.toFixed(2);
                }
            }
            , 'nocredit': {
                fillColor: '#00FF00',
                minValue: 0,
                maxValue: 100,
                maxHeight: 20,
                displayText: function (value) {
                    return "Нет кредитов: "+value.toFixed(2);
                }
            }
        };

        var marker= new L.PieChartMarker(L.latLng(arrElement.lat, arrElement.lng), options);
/*
        var animation = new L.Animation(function (time) {
            return (time % 60000)/10;
        }, function (progress) {
            angle = progress % 360;
            this._el.setStyle({
                rotation: angle
            });
            this._el.redraw();
        });
        marker.on('click', function () {
            console.log('click', this, marker, animation);
//            animation.run(marker);
            var radius = Math.random() * 20 + 10;
            L.AnimationUtils.animate(marker, {
                duration: 1000,
                easing: L.AnimationUtils.easingFunctions.easeOut,
                from: marker.options,
                to: L.extend({}, options, {
//                    fillColor: 'hsl(' + Math.random() * 360 + ',100%,50%)',
                    radius: radius
//                    innerRadius: radius/2,
//                    rotation: Math.random() * 360
                })
            });
*/
/*
            var radius = Math.random() * 70 + 10;
            L.AnimationUtils.animate(marker, {
                duration: 1000,
                easing: L.AnimationUtils.easingFunctions.easeOut,
                from: marker.options,
                to: L.extend({}, options, {
                    fillColor: 'hsl(' + Math.random() * 360 + ',100%,50%)',
                    radius: radius,
                    innerRadius: radius/2,
                    rotation: Math.random() * 360
                })
            });
        });
*/
        return marker;
    };
})(window);
