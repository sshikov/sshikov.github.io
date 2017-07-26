'use strict';

(function (window) {
    'use strict';
    window.heatmapHelper = {};

    heatmapHelper.addHeatmapLayer= function (mode) {
        var heatmapData = { max: 100, data: [] };
        var coefficient;
        for (var i = 0; i < globals.inputData.length; i++) {
            if (!mode || globals.inputData[i].type === mode) {
                coefficient = globals.inputData[i].coefficient;
                if (mode === 'asun') {
                    var surroundingSquare = globals.gridGeoJson.features.find(function (el) {
                        var poly = el.geometry.coordinates[0].map(function (el) {
                            return { 'lng': el[0], 'lat': el[1] };
                        });
                        return markerHelper.ifMarkerInPolygon(poly, globals.inputData[i]);
                    });
                    if (surroundingSquare && surroundingSquare.properties.coefficient !== 0) {
                        coefficient = parseFloat(globals.inputData[i].cost) / globals.maxValuesASUN.costMax * 100 / surroundingSquare.properties.coefficient;
                    } else continue;
                }

                heatmapData.data.push({
                    lat: globals.inputData[i].lat,
                    lng: globals.inputData[i].lng,
                    count: coefficient
                });
            }
        }
        var cfg = {
            "radius": globals.heatmap.radius, //0.004-0.016
            "maxOpacity": .8,
            "scaleRadius": true,
            "useLocalExtrema": true,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count'
        };
        globals.heatmapLayer = new HeatmapOverlay(cfg);
//        globals.map.map.addLayer(globals.heatmapLayer);
        globals.heatmapLayer.setData(heatmapData);
        globals.layers['HEATMAP']= globals.heatmapLayer;
    };

    heatmapHelper.refreshHeatmapLayer= function (mode) {
        var visibility= $("#visibility")[0].get("selected");
        if(globals.activeMarkerSet.has('HEATMAP')) {
            if (visibility=="heatmap" || visibility=="heatmapRent") {
    //            if (globals.map.map.hasLayer(globals.heatmapLayer)) {
    //                globals.map.map.removeLayer(globals.heatmapLayer);
    //            }
                heatmapHelper.addHeatmapLayer(mode);
            } else {
    //            if (globals.map.map.hasLayer(globals.heatmapLayer)) {
    //                globals.map.map.removeLayer(globals.heatmapLayer);
            }
        }
    };
})(window);
