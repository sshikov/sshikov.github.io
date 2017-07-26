'use strict';

(function (window) {
    window.gridHelper = {};

    window.gridHelper.refreshGridScale= function (map) {
        console.debug("refreshGridScale", map);
        var cellSize= globals.cellSizeAuto ? (17 - Math.max(12, Math.min(16, map.getZoom()))) : window.config['cell.size'];
        globals.cellSize= cellSize;
        var zoomCoefficient = Math.pow(2, globals.cellSize - 1);
        globals.gridCellSizeLng = globals.minGridCellSizeLng * zoomCoefficient;
        globals.gridCellSizeLat = globals.minGridCellSizeLat * zoomCoefficient;
        return zoomCoefficient;
    }

    window.gridHelper.onEachFeature= function onEachFeature(feature, layer) {
        var highlightFeature= function highlightFeature(e) {
            var layer = e.target;
/*
            layer.setStyle({
                weight: 1,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.7
            });
*/
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
            globals.mapInfoControl.update(layer.feature.properties);
            globals.mapInfoControl.detail("");
        };
        var resetHighlight = function resetHighlight(e) {
            globals.gridLayer.resetStyle(e.target);
            globals.mapInfoControl.update();
            globals.mapInfoControl.detail("");
        };
        var clickLayer= function clickLayer(e) {
            var layer = e.target;
//            var childs= layer.feature.properties.childs;
            var total= layer.feature.properties.total;
            var gt= layer.feature.properties.gt;
            var div= '<div><google-chart type="pie"'
                +' options=\'{"title": null, "legend": "right", "backgroundColor": "transparent" }\''
                +' cols=\'[{"label": "Month", "type": "string"},{"label": "Days", "type": "number"}]\''
                +' rows=\'[["Кредиты", '+(total.due/gt*100)+'],["Просроченные кредиты", '+(total.overdue/gt*100)+'],["Нет кредитов", '+(total.nocredit/gt*100)+']]\'>'
                +'</google-chart></div>';
            ;
            globals.mapInfoControl.detail(div);
        };

        layer.on({
            mouseover: highlightFeature
            , mouseout: resetHighlight
            , click: clickLayer
        });
    };

    window.gridHelper.refreshGrid= function (map) {
        console.debug("refreshGrid", map);
//     if (settings) {
//          this.set("settings", settings);
//     }
        if (this.map.map.hasLayer(globals.gridLayer)) {
            this.map.map.removeLayer(globals.gridLayer);
        }

        if(globals.activeMarkerSet.has('GRID')) {
            if (this.map.map.getZoom() >= 12) {
                globals.gridGeoJson= this.getGridGeoJson(this.settings);
                globals.gridLayer= L.geoJson(globals.gridGeoJson, {
                    style: window.gridHelper.style
                    , onEachFeature: window.gridHelper.onEachFeature
                    , id: 'GRID'
                });
                globals.layers['GRID']= globals.gridLayer;
                this.map.map.addLayer(globals.gridLayer);
            }
        }
    }

    window.gridHelper.getGridGeoJson= function(settings) {
        if (!settings) settings = { beelineC: 0.5, sberbankC: 0.5 };

        var geoJson = { "type": "FeatureCollection", "features": [] };
        var currentMapLeft = this.map.map.getBounds().getWest();
        var currentMapRight = this.map.map.getBounds().getEast();
        var currentMapDown = this.map.map.getBounds().getSouth();
        var currentMapUp = this.map.map.getBounds().getNorth();

        var currentMapLeft = currentMapLeft - currentMapLeft % globals.gridCellSizeLng;
        var currentMapRight = currentMapRight - currentMapRight % globals.gridCellSizeLng + globals.gridCellSizeLng;
        var currentMapDown = currentMapDown - currentMapDown % globals.gridCellSizeLat;
        var currentMapUp = currentMapUp - currentMapUp % globals.gridCellSizeLat + globals.gridCellSizeLat;

        var inputDataTemp = $.grep(globals.inputData, function (n) {
            return n.lng >= currentMapLeft && n.lng <= currentMapRight && n.lat >= currentMapDown && n.lat <= currentMapUp;
        });

        var index = 0;
        var maxCellCoefficient= globals.maxCellCoefficients["" + this.get("gridScale") * 100];

        for (var i = 0; i < 100; i++) {
            var shiftedLng = currentMapLeft + globals.gridCellSizeLng * i;
            var filteredByLng = $.grep(inputDataTemp, function (n) {
                return n.lng >= shiftedLng && n.lng < shiftedLng + globals.gridCellSizeLng;
            });
            for (var j = 0; j < 100; j++) {
                index++;
                var shiftedLat = currentMapDown + globals.gridCellSizeLat * j;
                var filteredByLngLat= $.grep(filteredByLng, function (n) {
                    return n.lat >= shiftedLat && n.lat < shiftedLat + globals.gridCellSizeLat;
                });

                var total= _.reduce(filteredByLngLat, function(sum, m) {
                    var data= m;
                    return {
                        'due': sum.due + Number(data.due||0)
                        , 'overdue': sum.overdue + Number(data.overdue||0)
                        , 'nocredit': sum.nocredit+1-Number(data.due||0)
                    };
                }, {due: 0, overdue: 0, nocredit: 0});
                var gt= total.due+total.nocredit+total.overdue

                var feature = {
                    "type": "Feature",
                    "id": "" + i * j,
                    "properties": {
                        "name": "" + index
                       , "coefficient": this.calculateCellCoefficient(filteredByLngLat, shiftedLng, shiftedLat, settings, maxCellCoefficient)
                       , "total": total
                       , "gt": gt
                    },
                    "geometry": {
                        "type": "Polygon", "coordinates": [[[shiftedLng, shiftedLat], [shiftedLng + globals.gridCellSizeLng, shiftedLat], [shiftedLng + globals.gridCellSizeLng, shiftedLat + globals.gridCellSizeLat], [shiftedLng, shiftedLat + globals.gridCellSizeLat]]]
                    }
                };

//                        console.debug("grid cell", feature)
                geoJson.features.push(feature);

                if (shiftedLat > currentMapUp) {
                    break;
                }
            }
            if (shiftedLng > currentMapRight) {
                break;
            }
        }

        return geoJson;
    }

    window.gridHelper.calculateCellCoefficient= function calculateCellCoefficient(points, topLeftLng, topLeftLat, settings, maxCellCoefficient) {
        // console.assert(maxCellCoefficient>0 && maxCellCoefficient<=100, calculateCellCoefficient)

        if(points.length>0) {
            console.debug("calculateCellCoefficient", topLeftLng, topLeftLat, JSON.stringify(points))
        }
        var cellCoefficient = 0;
        for (var k = 0; k < points.length; k++) {
            cellCoefficient += points[k].coefficient || 0;
        }
        var beelineCoefficient = 0; //calculateBeelineCoefficient(topLeftLng, topLeftLat, topLeftLng + globals.gridCellSizeLng, topLeftLat + globals.gridCellSizeLat);
//	    cellCoefficient =
//		(
//			settings.beelineC * (beelineCoefficient / (maxBeelineCoefficient||1))
//			+ settings.sberbankC * (cellCoefficient / (maxCellCoefficient||1))
//		) * 100;
        cellCoefficient= settings.sberbankC * (cellCoefficient / (maxCellCoefficient||1)) * 100;

        console.assert(cellCoefficient>=0 && cellCoefficient<=100, calculateCellCoefficient)
        return cellCoefficient;
    }

    window.gridHelper.style= function style(feature) {
        /*http://colorbrewer2.org/#type=sequential&scheme=Blues&n=9 #f7fbff, #deebf7, #c6dbef, #9ecae1, #6baed6, #4292c6, #2171b5, #08519c, #08306b*/
        // "красная" палитра
/*
        var getColor= function getColor(d) {
            return d > 90 ? '#800026' : d > 64 ? '#BD0026' : d > 32 ? '#E31A1C' : d > 16 ? '#FC4E2A' : d > 8 ? '#FD8D3C' : d > 4 ? '#FEB24C' : d > 2 ? '#FED976' : d > 0 ? '#FFEDA0' : null;
        };
        // "синяя" палитра
        var getBlueColor= function getColor(d) {
            return d > 90 ? '#f7fbff' : d > 64 ? '#deebf7' : d > 32 ? '#c6dbef' : d > 16 ? '#9ecae1' : d > 8 ? '#6baed6' : d > 4 ? '#4292c6' : d > 2 ? '#2171b5' : d > 0 ? '#08519c' : null;
        };
        var getChromaColor= function(d) {
            return chroma.scale(['#800026', '#FFEDA0']).mode('lch').domain([0, 100])(d).hex();
        }
        http://colorbrewer2.org/#type=sequential&scheme=Blues&n=9 #f7fbff, #deebf7, #c6dbef, #9ecae1, #6baed6, #4292c6, #2171b5, #08519c, #08306b
*/
        var colorFn= window.gridHelper.palette[window.config['palette']]||window.gridHelper.getColor;
        return {
            stroke: false
            , fillColor: colorFn(feature.properties.coefficient * 5 / globals.cellSize)
            , weight: 1
            , opacity: 0.1
            , color: 'white'
            , dashArray: ''	// 3
            , fillOpacity: 0.3
        };
    };

    window.gridHelper.palette= {
        "red": function(d) {
            return d > 90 ? '#800026' : d > 64 ? '#BD0026' : d > 32 ? '#E31A1C' : d > 16 ? '#FC4E2A' : d > 8 ? '#FD8D3C' : d > 4 ? '#FEB24C' : d > 2 ? '#FED976' : d > 0 ? '#FFEDA0' : null;
        }
        , "blue": function(d) {
            return d > 90 ? '#f7fbff' : d > 64 ? '#deebf7' : d > 32 ? '#c6dbef' : d > 16 ? '#9ecae1' : d > 8 ? '#6baed6' : d > 4 ? '#4292c6' : d > 2 ? '#2171b5' : d > 0 ? '#08519c' : null;
        }
        , "chroma": function(d) {
            return chroma.scale([window.config['palette.start'], window.config['palette.stop']]).mode('lch').domain([0, 100])(d).hex();
        }
    }

    window.gridHelper.getColor= function getColor(d) {
        return d > 90 ? '#800026' : d > 64 ? '#BD0026' : d > 32 ? '#E31A1C' : d > 16 ? '#FC4E2A' : d > 8 ? '#FD8D3C' : d > 4 ? '#FEB24C' : d > 2 ? '#FED976' : d > 0 ? '#FFEDA0' : null;
    };
})(window);
//                function getGoogleUrl(cell) {
//                    return cell.yMin + ',' + cell.xMin + '/' + cell.yMin + ',' + cell.xMax + '/' + cell.yMax + ',' + cell.xMin + '/' + cell.yMax + ',' + cell.xMax;
//                }