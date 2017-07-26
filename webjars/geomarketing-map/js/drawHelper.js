'use strict';

window.drawHelper = {};

drawHelper.addDrawLayers = function () {
    globals.editableLayers = new L.FeatureGroup();
    globals.map.addLayer(globals.editableLayers);
    var options = {
        position: 'topleft',
        draw: {
            polygon: {
                allowIntersection: false,
                drawError: {
                    color: '#e1e100',
                    message: '<strong>Ошибка!<strong> Линии не должны пересекаться!'
                },
                shapeOptions: {
                    color: '#4d88ff'
                }
            },
            polyline: false,
            circle: false,
            marker: false,
            rectangle: {
                shapeOptions: {
                    clickable: false,
                    color: '#4d88ff'
                }
            }
        },
        edit: {
            featureGroup: globals.editableLayers,
            edit: false,
            remove: false
        }
    };

    var drawControl = new L.Control.Draw(options);
    L.drawLocal.draw.toolbar.buttons.polygon = 'Веделение произвольной области';
    L.drawLocal.draw.toolbar.buttons.rectangle = 'Веделение прямоугольной области';
    globals.map.addControl(drawControl);
};
