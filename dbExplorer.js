dojo.provide('unc.dbExporer');

dojo.require('dojox.data.JsonRestStore');
dojo.require('unc.GenericEditor');

var limit = 100;

dojo.declare('unc.dbExplorer', [], {
    constructor: function() {
        dojo.connect(dijit.byId('db'), 'onBlur', this, 'listCollection')
        dojo.connect(dijit.byId('openButton'), 'onClick', this, 'open')
        console.log('constructed');
    },
    
    listCollection: function() {
        console.log('listCollection');
        var db = dijit.byId('db').value;
        // using store to get list of collections
        uow.getDatabase({ database: db, collection: '*', mode: 'L' }).addCallback(function(db) {
            var select = dijit.byId('co');
            select.store = db;
            select.searchAttr = '_id';
        }).addErrback(function(err) {
            console.log('list failed', err);
        });
    },
    
    open: function() {
        var db = dijit.byId('db').value;
        var co = dijit.byId('co').value;
        var sh = dijit.byId('schemaName').value;
        console.log(db, co, sh);
        this.schema = null;
        this.store = null;
        dojo.empty('myeditor');
        if (sh) {
            dojo.xhrGet({
                url: sh,
                handleAs: 'json',
                load: dojo.hitch(this, function(data) {
                    this.schema = data;
                    this.initEditor();
                }),
                error: function(err) {
                    console.log(err);
                }
            });
        } else {
            this.schema = false;
        }
        uow.getDatabase({ database: db, collection: co, mode: 'crud' }).addCallback(
            dojo.hitch(this, function(db) {
                this.store = db;
                this.initEditor();
            })).addErrback(function() {
                console.log('error opening db');
            });
        console.log('open done');
    },
    
    initEditor: function() {
        console.log('init', this.schema, this.store);
        if (this.schema === null) {
            console.log('no schema yet');
            return;
        } else if (this.schema === false && this.store !== null) {
            this.store.fetch({ 
                start: 0, 
                count: 1,
                onComplete: dojo.hitch(this, function(i) {
                    console.log('fetch returns', i);
                    this.schema = this.guessSchema(i[0]);
                    console.log('guessed schema', this.schema);
                    this.initEditor();
                }),
            });
            return;
        }
        if (this.store === null) {
            console.log('no db yet');
            return;
        }
        // got both
        dojo.byId('schema').innerHTML = dojo.toJson(this.schema, true);
        var gridLayout = [
            { name: 'Id', field: '_id', width: "100%" } ];
        console.log('creating generic editor');
        var editor = new unc.GenericEditor({ store: this.store, schema: this.schema,
                                             gridLayout: gridLayout });
        dojo.place(editor.domNode, 'myeditor', 'only');
        console.log('done creating');
        editor.startup();
        console.log('done startup');
    },
    
    guessSchema: function(a) {
        if (--limit < 0) return;
        console.log('guess', a);
        if (typeof(a) === 'string') {
            console.log('string');
            return { type: 'string' };
        } else if (dojo.isArray(a)) {
            console.log('array');
            return { type: 'array',
                     items: this.guessSchema(a[0]) };
        } else if (typeof(a) === 'number') {
            console.log('number');
            if (Math.floor(a) === a) {
                return { type: 'integer' };
            } else {
                return { type: 'number' };
            }
        } else if (typeof(a) === 'object') {
            console.log('object');
            var r = { type: 'object',
                      properties: {} };
            for (var p in a) {
                if (!p.match(/_/)) {
                    console.log('property', p);
                    r.properties[p] = this.guessSchema(a[p]);
                    console.log(r.properties);
                }
            }
            return r;
        } else {
            return { type: 'unknown' };
        }
    }
        
});

function main() {
    console.log('main');
    var dbe = new unc.dbExplorer();
}

dojo.ready(main);
