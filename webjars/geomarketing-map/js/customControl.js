    var cust= L.control.custom({
        position: 'topleft'
        , content:
//                            '<div class="leaflet-bar leaflet-bar-vertical leaflet-control toolbar-leaflet-control leaflet-zoom-hide">'
                 '<paper-icon-button size="18" title="Меню" id="menu" icon="menu" noink></paper-icon-button>'
                +'<paper-icon-button size="18" title="Увеличить" id="zoom-in" icon="zoom-in" noink>+</paper-icon-button>'
                +'<paper-icon-button size="18" title="Уменьшить" id="zoom-out" icon="zoom-out" noink>-</paper-icon-button>'
                +'<paper-icon-button size="18" title="Вход" id="login" icon="account-box" noink></paper-icon-button>'
                +'<paper-icon-button size="18" title="Мое положение" id="whereami" icon="maps:my-location" noink></paper-icon-button>'
                +'<paper-icon-button size="18" title="Настройки" id="settings" icon="settings" noink></paper-icon-button>'
//                                +'<paper-icon-button title="Слои" id="layers" icon="maps:layers" noink></paper-icon-button>'
//                                +'<paper-icon-button title="Поиск по адресу" id="search" icon="search" noink></paper-icon-button>'
//                                +'<paper-icon-button title="Меню" id="build" icon="build" noink></paper-icon-button>'
//                            +'</div>'
        , classes: 'layout vertical leaflet-control leaflet-bar toolbar-leaflet-control leaflet-zoom-hide'
        , style: {
            margin: '2px'
            , padding: '0px 0 0 0'
            , cursor: 'pointer'
            , 'background-color': 'white'
            , 'border': '0px'
        }
        , datas: {
            'foo': 'bar',
        }
        , events: {
            click: function(data) {
                console.log(data);
                var button= _.find(data.path, (e) => "PAPER-ICON-BUTTON"==e.tagName)
                console.log('wrapper div element clicked', button.id);
                switch(button.id) {
                    case 'build':
                        break;
                    case 'setings':
                        break;
                    case 'login':
                        _.find(data.path, (e) => "LEAFLET-MAP"==e.tagName).fire("login", {'id': button.id});
                        break;
                    case 'whereami':
                        _.find(data.path, (e) => "LEAFLET-MAP"==e.tagName).map.locate({'watch': false, 'setView': true});
                    case 'layers':
                        _.find(data.path, (e) => "LEAFLET-MAP"==e.tagName).fire("layers", {'id': button.id});
                        break;
                    case 'search':
                        break;
                    case 'menu':
                        _.find(data.path, (e) => "LEAFLET-MAP"==e.tagName).fire("menu", {'id': button.id});
                        break;
                    case 'zoom-in':
                        globals.map.map.zoomIn();
                        break;
                    case 'zoom-out':
                        globals.map.map.zoomOut();
                        break;
                    default:
                        _.find(data.path, (e) => "LEAFLET-MAP"==e.tagName).fire("menu", {'id': button.id});
                        break;
                }
            }
//                            , dblclick: function(data) {
//                                console.log('wrapper div element dblclicked');
//                                console.log(data);
//                            }
//                            , contextmenu: function(data) {
//                                console.log('wrapper div element contextmenu');
//                                console.log(data);
//                            }
        }
    });
    console.log(cust);
// cust.addTo(this.map.map);
