dojo.require('unc.TextTilesEditor');
dojo.require('dojox.json.schema');
dojo.require('dojox.data.JsonRestStore');
dojo.require('dojox.grid.DataGrid');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.BorderContainer');
dojo.require('unc.HintGen');

var lessonGridLayout = [
    { name: 'Lesson', field: 'name', width: "50%" },
    { name: 'Id', field: '_id', width: "50%" } ];

var templateGridLayout = [
    { name: 'Template', field: 'name', width:"50%" },
    { name: 'Id', field: '_id', width: '50%' } ];

function main() {
    var store = new dojox.data.JsonRestStore({
        target: "/data/BigWords/TextTilesTemplates/",
        idAttribute: '_id' });
    var lessonStore = new dojox.data.JsonRestStore({
        target: "/data/BigWords/TextTilesLessons/",
        idAttribute: '_id' });
    
    var editor = new unc.TextTilesEditor({
        store: store,
        lessonStore: lessonStore,
        schema: TextTilesSchema,
        lessonGridLayout: lessonGridLayout,
        gridLayout: templateGridLayout
        });
    dojo.place(editor.domNode, dojo.body());
    editor.startup();
}

dojo.ready(main);
