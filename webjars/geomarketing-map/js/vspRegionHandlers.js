'use strict';

(function (window) {
    var style= function(feature) {
        return {
            fill: true
            , stroke: true
            , color: '#333366'
            , weight: 3
            , opacity: 0.5
            , dashArray: ''
            , fillColor: '#222222'
            , fillOpacity: 0.1
        }
    };
    window.vspRegionHandlers= {
        onEachFeature: function onEachFeature(feature, layer) {
//            highlight= _.throttle(highlight, 100);
            layer.on({
                mouseover: function highlightFeature(e) {
                    console.log('mouseover: '+feature.properties.name);
                    var layer = e.target;
                    var latlng= e.latlng;
                    layer.setStyle({ weight: 1, color: '#666', dashArray: '', fillOpacity: 0.7 });
                    if (!L.Browser.ie && !L.Browser.opera) { layer.bringToFront(); }
                    globals.mapInfoControl.detail(feature.properties.name);
                }
                , mouseout: function resetHighlight(e) {
                    var layer = e.target;
                    layer.setStyle(style(feature));
                }
                , click: function click(e) {
                    var layer = e.target;
                    var region= feature.properties.regionName;
                    var st= style(layer);
                    var selected= !!feature.properties.selected;
                    console.log('click', e, feature.properties.regionName, selected);
                    if(e.originalEvent.ctrlKey) {
                        if(!selected) {	// выбор
                            st.color= '#660000';
                            st.fillOpacity= 0.3;
                            globals.regionsSelected[region]= {region: feature.properties.regionName, values: feature.properties.values}
                        } else {	// отмена
                            st.color= '#333366';
                            st.fillOpacity= 0.1;
                            delete globals.regionsSelected[region];
                        }
                        feature.properties.selected= !selected;
                    }
                    layer.setStyle(st);
                    highlight(e, feature);
                }
            });
        }
    };
})(window);
