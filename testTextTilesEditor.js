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
    var templateStore;
    var lessonStore;
    var temp1, temp2 = false;
    
    var init = function() {
        if(temp1 && temp2) {
            var editor = new unc.TextTilesEditor({
                store: templateStore,
                lessonStore: lessonStore,
                schema: TextTilesSchema,
                lessonGridLayout: lessonGridLayout,
                gridLayout: templateGridLayout
                });
            dojo.place(editor.domNode, dojo.body());
            editor.startup();
        }
    }
    
    uow.getDatabase({database: 'BigWords',
        collection: 'TextTilesTemplates'}).addCallback(dojo.hitch(this, function(db) {
            templateStore = db;
            temp1 = true;
            init();
        }));
    uow.getDatabase({database: 'BigWords',
        collection: 'TextTilesLessons'}).addCallback(dojo.hitch(this, function(db) {
            lessonStore = db;
            temp2 = true;
            init();
        }));
}

dojo.ready(main);
