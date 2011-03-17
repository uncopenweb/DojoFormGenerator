dojo.provide("unc.ImageUpload");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require('dojo.io.iframe');

dojo.require("dojox.form.FileInput");

dojo.declare("unc.ImageUpload", [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl('unc', 'ImageUpload.html'),
    widgetsInTemplate: true,
    
    postCreate: function() {
        this.inherited(arguments);
    
        this.connect(this.at_confirm, 'onClick', this.uploadConfirmed);
        this.connect(this.at_cancel, 'onClick', this.theCloseFunction);
    
    },
    
    uploadConfirmed: function() {
        console.log('upload func start');
        
        var form = dojo.byId('upload_form');
        if (!form.file.value) {
            return;
        }
        var fileName = dojo.byId('file').value;
        console.log("fileName:", fileName);
        
        console.log("form:", form);
        var tags = form.tags.value.replace(/^\s+|\s+$/g, '');
        if (tags.length === 0) {
            return;
        }
        var uploadComplete = dojo.hitch(this, function() {
            this.theCloseFunction();
        });
        
        var def = uow.getDatabase({
            database: 'Media',
            collection: 'Image',
            mode: 'c' });
        def.addCallback(function(db) {
            db.upload({
                form: form,
                load: function(data, ioArgs) {
                    console.log('load', data);
                    //dojo.byId('messages').innerHTML = dojo.toJson(data);
                    console.log("Upload has been confirmed!");
                    uploadComplete();
                },
                error: function(msg, ioArgs) {
                    console.log('error', msg);
                    //dojo.byId('messages').innerHTML = msg;
                }
            });
        });
        def.addErrback(function(msg) {
            console.log('upload failed');
        });
        
        console.log('upload func end');
    
    },
    
    //just an empty wrapper that gets called on a successful upload and to connect a kill-dialog call
    //this is because for some reason i can't connect to a function call in the nested dialog thing
    theCloseFunction: function() {
        console.log('close function');
        dojo.publish('close uploader', []);
    }

});
