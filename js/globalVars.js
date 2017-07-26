'use strict';

(function (window, document) {

    'use strict';

    window.globals = {
        activeMarkerSet: new Set([])    //'ATMPOS', 'PLACES', 'RENT', 'MARKETRENT', 'GRID'
        , roles: ""
    	, layers: {}
        , regionLayers: {}
        , regionRequests: {}    // promices
        , regionsSelected: {}
        , inputData: []
        , maxValuesASUN: { areaMax: 0, costMax: 0 }
        , map: null
        , heatmapLayer: null
        , editableLayers: null
        , markerClusterLayer: null
        , gridLayer: null
        , gridGeoJson: null
        , mapInfoControl: null
        , layersControl: null
        , minGridCellSizeLat: 0.00089
        , minGridCellSizeLng: 0.0016
        , cellSizeAuto: true
        , gridCellSizeLat: 0.00089 * 16
        , gridCellSizeLng: 0.0016 * 16
        , heatmap: { radius: 0.002, initRadius: 0.002 }
        , maxCellCoefficients: { "100": null, "200": null }

        , currentCity: "6301700100000"
        , cityCenters: {}
        , realtyStats: {
            count: 0
            , minArea: Infinity
            , maxArea: -Infinity
            , minFloor: Infinity
            , maxFloor: -Infinity
            , type: new Set()
        }
    };

        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.split(search).join(replacement);
        };
})(window, document);
