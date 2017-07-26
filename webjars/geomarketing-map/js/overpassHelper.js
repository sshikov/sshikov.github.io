'use strict';

(function (window) {
    window.overpassHelper= {};

    var baseUrl= 'http://www.overpass-api.de/api/interpreter';

    var highwayStyle= {
        fill: false
        , stroke: true
        , color: '#000088'
        , weight: 2
        , opacity: 0.5
        , dashArray: ''
    };

    var buildingStyle= {
        fill: true
        , stroke: true
        , color: '#000088'
        , weight: 1
        , opacity: 0.5
        , fillOpacity: 0.1
        , fillColor: '#222222'
        , dashArray: ''
    };

    var regionStyle= {
        fill: true
        , stroke: true
        , color: '#000088'
        , weight: 1
        , opacity: 0.5
        , fillOpacity: 0.1
        , fillColor: '#555555'
        , dashArray: ''
    };

    var validEl= function(el) {
        if(!el.type || !(el.geometry || el.nodes || el.members || (el.lat && el.lon))) console.log('invalid', JSON.stringify(el));
        return el.type && (el.geometry || el.nodes || el.members || (el.lat && el.lon));
    };

    var getBbox= function() {
        var bounds= globals.map.map.getBounds()
            , bbox= bounds._southWest.lat.toFixed(3)+","+bounds._southWest.lng.toFixed(3)+","+bounds._northEast.lat.toFixed(3)+","+bounds._northEast.lng.toFixed(3);
        return bbox;
    }

    var coords2geom= function coords2geom(el) {
        // type=="way", nodes= [id, id...]
        if(el.type=="node") {
            return {
                "type": "Point"
                , "coordinates": [el.lon, el.lat]
            }
        }
        if(el.type=="way") {
            if(el.geometry) {
                var coordinates= _.map(el.geometry, function(g) { return [g.lon, g.lat]; });
/*
                _.forEach(el.geometry, function(g) {
                    var pair= [];
                    pair.push(g.lon);
                    pair.push(g.lat);
                    coordinates.push(pair);
                });
*/
                return {
                    "type": "LineString"
                    , "coordinates": coordinates
                }
            }
            if(el.nodes) {
                return {};
            }
        }
        if(el.type=="relation") {
//            console.log("relation", el.members);
            var coordinates= _.map(el.members, function(m) { return _.map(m.geometry, function(g) { return [g.lon, g.lat]; }); });
//            console.log("coordinates", coordinates);
            return {
                "type": "MultiLineString"
                , "coordinates": coordinates
            }
        }
        //"bounds":{"minlat":55.7524024,"minlon":37.5972868,"maxlat":55.7526917,"maxlon":37.5978164}
//        ,"members":[
//            {"type":"way","ref":160232800,"role":"outer","geometry":[{"lat":55.7526886,"lon":37.5973761},{"lat":55.7526917,"lon":37.597309},{"lat":55.7525411,"lon":37.5972868},{"lat":55.752538,"lon":37.5973539}]}
//            ,{"type":"way","ref":160232730,"role":"outer","geometry":[{"lat":55.752538,"lon":37.5973539},{"lat":55.7524474,"lon":37.5973427},{"lat":55.7524054,"lon":37.5974142},{"lat":55.7524024,"lon":37.5975898},{"lat":55.7525261,"lon":37.5976094},{"lat":55.7525172,"lon":37.5978164},{"lat":55.7526694,"lon":37.5977869},{"lat":55.7526886,"lon":37.5973761}]}]
//,"tags":{"addr:city":"Москва","addr:country":"RU","addr:housenumber":"7 с1","addr:street":"улица Новый Арбат","building":"yes","building:levels":"6","type":"multipolygon"}}
        return {};
    };

    var tags2props= function(tags) { return _.join(_.map(tags, function(v, k) { return k+": "+v; }), "<br>"); };
    var tags2addr= function(tags) {
        return tags ? _.join(_.filter([tags['addr:postcode'], tags['addr:country'], tags['addr:city'], tags['addr:street'], tags['addr:housenumber']], function(part) { return !!part; }), ', ') : "";
    };

    window.overpassHelper.relations= {};

    window.overpassHelper.highways= function buildings() {
        var zoom= globals.map.map.getZoom();
        if(zoom < 14) return;
        if(!globals.activeMarkerSet.has('HIGHWAYS')) return;
        var group= globals.layers['HIGHWAYS'];
        var bbox= getBbox();
        var query= '[out:json][timeout:60];'
            +'('
                +'way["highway"]["name"]('+bbox+');'
                +'relation["highway"]["name"]('+bbox+');'
            +');'
            +'out 100 meta geom;'
            +'>;'
            +'out skel qt;'
        ;

        $.getJSON(baseUrl, { 'data': query, 'bbox': bbox }).done(function(result) {
			console.log("highways done", result.elements.length, result.remark);
			var ids= {};
            _.forEach(result.elements, function(el) {
                if(ids[el.id]) return;
                ids[el.id]= true;
                if(!validEl(el)) return;
//				console.log(el.type, JSON.stringify(el.geometry));	//, "tags", JSON.stringify(el.tags)
                coords2geom(el);
                var addr= tags2addr(el.tags);
                var name= el.tags['name']||'';
                delete el.tags['addr:country']; delete el.tags['addr:city']; delete el.tags['addr:street']; delete el.tags['addr:postcode'];
                delete el.tags['name'];
                var tags= tags2props(el.tags);
//                console.log(JSON.stringify(coordinates));
                var properties= _.assign({
                    "id": el.id
                     , "name": name
                     , "addr": addr
                     , "link": "http://www.openstreetmap.org/"+el.type+"/"+el.id
                     , "tags": tags
                }, el.tags);

                var feature= {
                    "type": "Feature"
                    , 'properties': properties
                    , "geometry": coords2geom(el)
                };
//						console.log(feature);
                var style= function(feature) { return highwayStyle; };
                var layer= L.geoJson(feature, {
                    style: style
                    , onEachFeature: function onEachFeature(feature, layer) {
                        layer.bindPopup("<a href='"+feature.properties.link+"'>: "+feature.properties.name+" "+feature.properties.addr+"</a><br>"+feature.properties.tags);
                        layer.on({
                            mouseover: function highlightFeature(e) {
                                var st= style(feature);
                                st.color= '#0000ff';
                                layer.setStyle(st);
                            }
                            , mouseout: function resetHighlight(e) {
                                layer.setStyle(style(feature));
                            }
                        });
                    }
                }).addTo(group);
            });
            group.addTo(globals.map.map);
    		console.log("ids", ids);
            return result;
        }).fail(function(error) {
            console.log(error);
        });
    }

	window.overpassHelper.buildings= function() {
        var zoom= globals.map.map.getZoom();
        if(zoom < 16) return;
        if(!globals.activeMarkerSet.has('BUILDINGS')) return;
        var group= globals.layers['BUILDINGS'];
        var bbox= getBbox();
        var query= '[out:json][timeout:60];'
            +'('
                +'node["building"][~"^addr:.*$"~"."]('+bbox+');'
                +'way["building"][~"^addr:.*$"~"."]('+bbox+');'
                +'relation["building"][~"^addr:.*$"~"."]('+bbox+');'
//						+'way["claddr"][~"^addr:.*$"~"."]('+bbox+');'
            +');'
            +'out 100 meta geom;'
            +'>;'
            +'out skel qt;'
        ;

        $.getJSON(baseUrl, { 'data': query, 'bbox': bbox }).done(function(result) {
    		console.log("buildings done", result.elements.length, result.remark);
			var ids= {};
            _.forEach(result.elements, function(el) {
                if(ids[el.id]) return;
                ids[el.id]= true;
                if(!validEl(el)) return;
//                console.log(el.type, JSON.stringify(el.geometry));	//, "tags", JSON.stringify(el.tags)
                var addr= tags2addr(el.tags);
                var name= el.tags['name']||'';
                delete el.tags['addr:country']; delete el.tags['addr:city']; delete el.tags['addr:street']; delete el.tags['addr:housenumber']; delete el.tags['building']; // todo
                delete el.tags['name'];
                var tags= tags2props(el.tags);
//						console.log(JSON.stringify(coordinates));
                var properties= _.assign({
                    "id": el.id
                    , "name": name
                    , "addr": addr
                    , "link": "http://www.openstreetmap.org/"+el.type+"/"+el.id
                    , "tags": tags
                }, el.tags);
                var feature= {
                    "type": "Feature"
                    , 'properties': properties
                    , "geometry": coords2geom(el)
                };
//						console.log(feature);
                var style= function(feature) { return buildingStyle; };
                var layer= L.geoJson(feature, {
                    style: style
                    , onEachFeature: function onEachFeature(feature, layer) {
                        layer.bindPopup("<a href='"+feature.properties.link+"'>"+feature.properties.addr+"</a><br>"+feature.properties.name+"<br>"+feature.properties.tags);
                        layer.on({
                            mouseover: function highlightFeature(e) {
                                var st= style(feature);
                                st.color= '#00ff00';
                                layer.setStyle(st);
                            }
                            , mouseout: function resetHighlight(e) {
                                layer.setStyle(style(feature));
                            }
                        });
                    }
                }).addTo(group);
            });
            group.addTo(globals.map.map);
/*
            _.forEach(result.elements, function(el) {
                if(el.nodes) {
                    _.forEach(el.nodes, function(node) {
                        if(!ids[node])
                            console.log("no node", node);
                    });
                }
            });
*/
//    		console.log("ids", ids);
            return result;
        }).fail(function(error) {
            console.log(error);
        });
    }

	window.overpassHelper.boundaries= function(level, latlng) {
        var bbox= getBbox()
            , center= latlng ? latlng : globals.map.map.getCenter()
        ;

        var query= '[out:json][timeout:60];'
            +'is_in('+center.lat+','+center.lng+')->.areas;'
            +'rel(pivot.areas)[boundary=administrative][admin_level~".*"];'
            +'out meta geom;'
        ;

/*
        var query= '[bbox:'+bbox+'][out:json][timeout:60];'
            +'rel[boundary=administrative][admin_level~"['+level+']"];'
            +'(._;>;);'
            +'out 100 meta geom;'
            +'>;'
            +'out skel qt;'
        ;
*/
        // todo admin_level -> layer + map pane
        //	, pane: regionName=='Россия' ? 'pane400' : 'pane600'
        // this.map.map.createPane('pane600').style.zIndex = 600;
        // this.map.map.createPane('pane400').style.zIndex = 420+admin_level;

    	if(!globals.layers['BOUNDARIES'])
    	    globals.layers['BOUNDARIES']= L.layerGroup([]);
        var group= globals.layers['BOUNDARIES'];
        group.clearLayers();
        $.getJSON(baseUrl, { 'data': query, 'bbox': bbox }).done(function(result) {
    		console.log("boundary=administrative done", result.elements.length, result.remark);
    		var html= [];
    		var sorted= _.sortBy(result.elements, function(el) { return Number(el.tags['admin_level']); });
    		// todo сортировать по el.tags['admin_level']
            _.forEach(sorted, function(el) {
                console.log(el.tags);
//                var geojson= osmtogeojson(el);
                var tags= tags2props(el.tags);
                var name= el.tags['name']||'';
                var addr= tags2addr(el.tags);
                var properties= _.assign({
                    "id": el.id
                    , "name": name
                    , "addr": addr
                    , "link": "http://www.openstreetmap.org/"+el.type+"/"+el.id
//                    , "tags": tags
                }, el.tags);
                var feature= {
                    "type": "Feature"
                    , 'properties': properties
                    , "geometry": coords2geom(el)
                };
                var style= function(feature) { return regionStyle; };
                var level= 410+Number(el.tags['admin_level']);
                if(!globals.map.map.getPane('pane'+level))
                    globals.map.map.createPane('pane'+level).style.zIndex = level;

                var layer= L.geoJson(feature, {
                    style: style
                    , pane: "pane"+level
                    , onEachFeature: function onEachFeature(feature, layer) {
                        layer.bindPopup("<a href='"+feature.properties.link+"'>"+feature.properties.addr+"</a><br>"+feature.properties.name+"<br>"+tags);
                        layer.on({
                            mouseover: function highlightFeature(e) {
                                console.log('mouseover', feature.properties.name);
                                var layer= e.target;
                                var st= style(feature);
                                st.fillOpacity= st.fillOpacity*4;
                                st.color= '#ff0000';
//                                st.fillColor= chroma(st.fillColor).darken().hex();
//                                st.color= '#00ff00';
//                                st.fillColor= '#000088';
                                layer.setStyle(st);
                            }
                            , mouseout: function resetHighlight(e) {
                                console.log('mouseout', feature.properties.name);
                                var layer= e.target;
                                var st= style(feature)
                                st.fillOpacity= st.fillOpacity/4;
                                layer.setStyle(st);
                            }
                        });
                    }
                }).addTo(group);
                html.push("<a href='"+feature.properties.link+"'>"+feature.properties.addr+" "+feature.properties.name+"</a>");
            });
            group.addTo(globals.map.map);
            $(globals.mapInfoControl._detail).html($(globals.mapInfoControl._detail).html()+"<br>"+(_.join(html, "<br>")));
        }).fail(function(error) {
            console.log(error);
        });
    }

	window.overpassHelper.relation= function(id) {
        var query= '[out:json][timeout:60];'
            +'relation('+id+');'
            +'out meta geom;'
        ;

        return $.getJSON(baseUrl, { 'data': query }).then(function(result) {
    		console.log("relation done", result.elements);
            var layer= L.geoJson(osmtogeojson(result), {}).addTo(globals.map.map);
            window.overpassHelper.relations[id]= result.elements[0].tags.name;
            return _.filter(result.elements[0].members, function(el) {
                return el.type=="relation" &&  el.role=="subarea";
            });
        }).fail(function(error) {
            console.log(error);
            return [];
        });
    }

	window.overpassHelper.nominatim= function(id) {
        $.getJSON('/json/nominatim/'+id).done(function(json, status, xhr) {
            console.log(json, xhr);
            console.log(json, xhr.getAllResponseHeaders());
            var feature= {
                "type": "Feature"
                , 'properties': {
                    "place_id": json['place_id']
                    , "licence": json['licence']
                    , "osm_type": json['osm_type']
                    , "lat": json['lat']
                    , "lng": json['lon']
                    , "display_name": json['display_name']
                    , "address": json['address']
                    , "boundingbox": json['boundingbox']
                }
                , "geometry": json.geojson
            };

            L.geoJson(feature, {}).addTo(globals.map.map);
        });
    }

	window.overpassHelper.osm= function(id) {
        return $.getJSON('/json/osm/'+id).then(function(json, status, xhr) {
            console.log(json);
            var feature= {
                "type": "Feature"
                , 'properties': {
                    "place_id": json['place_id']
                    , "licence": json['licence']
                    , "osm_type": json['osm_type']
                    , "lat": json['lat']
                    , "lng": json['lon']
                    , "display_name": json['display_name']
                    , "address": json['address']
                    , "boundingbox": json['boundingbox']
                }
                , "geometry": json.geojson
            };
            feature.subareas= _.map(json.members, function(member) {
                return _.filter(json.members, function(member) {return "RELATION"==member.type && "subarea"==member.role; });
            });
            console.log(feature);
//            L.geoJson(feature, {}).addTo(globals.map.map);
            return feature;
        });
    }
})(window);

/*
[out:json];
is_in(55.753, 37.629)->.areas;
rel(pivot.areas)[boundary=administrative][admin_level~".*"]({{bbox}});
out meta geom;

area[name="Москва"];is_in(55.75,37.6);

[out:csv(name, is_in)];node({{bbox}})[place~".*"];
  foreach(
    is_in->.a;
    area.a[name][boundary=administrative][admin_level~"^[2-4]$"] -> .a;
    convert node ::=::,
              ::id = id(),
              is_in=a.set("{" + t[admin_level] + ":" + t[name] + "}");

    out;
  );
  */