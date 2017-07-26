(function (globals) {
    globals.mapInfoControl = L.control({
        options: { position: "topright" }
        , onAdd: function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        }
        , update: function (props) {
            this._div.innerHTML = props ? 'Id ячейки - ' + props.name + '<br />Значение показателя в ячейке - ' + Math.round(props.coefficient * 100) / 100 + "%" : 'Наведите мышку на одну из ячеек';
        }
    });
})(globals);
