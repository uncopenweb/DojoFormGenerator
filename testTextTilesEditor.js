dojo.require('unc.TextTilesEditor');
dojo.require('dojox.json.schema');
dojo.require('dojox.data.JsonRestStore');
dojo.require('dojox.grid.DataGrid');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.BorderContainer');
dojo.require('unc.HintGen');

var gridLayout = [
    { name: 'Lesson', field: 'name', width: "50%" },
    { name: 'Id', field: '_id', width: "50%" } ];

function main() {
    var store = new dojox.data.JsonRestStore({
        target: "/data/BigWords/lessonsTextTiles/",
        idAttribute: '_id' });
    
    var editor = new unc.TextTilesEditor({
        store: store,
        schema: TextTilesSchema,
        gridLayout: gridLayout});
    dojo.place(editor.domNode, dojo.body());
    editor.startup();
}

dojo.ready(main);
