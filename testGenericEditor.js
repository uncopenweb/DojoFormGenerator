dojo.require('unc.GenericEditor');
dojo.require('dojox.json.schema');
dojo.require('dojox.data.JsonRestStore');
dojo.require('dojox.grid.DataGrid');

var gridLayout = [
    { name: 'Name', field: 'name', width: "50%" },
    { name: 'Id', field: '_id', width: "50%" } ];

function main() {
    var store = new dojox.data.JsonRestStore({
        //target: "/data/BigWords/SpellBinder/",
        target: "/data/BigWords/textTilesLessons/",
        idAttribute: '_id' });
    //store.newItem(WordBuilderData);
    //store.save();
    //return;
    var editor = new unc.GenericEditor({
        store: store,
        //schema: SpellBinderSchema,
        schema: TextTilesSchema,
        gridLayout: gridLayout});
//    dojo.place(editor.domNode, dojo.body());
    editor.startup();
}

dojo.ready(main);

