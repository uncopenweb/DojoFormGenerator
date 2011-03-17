dojo.provide('unc.ImageBrowser');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dojox.image.ThumbnailPicker');
dojo.require('dojox.image.Lightbox');

dojo.require('unc.ImageUpload');

function formatTags(tags) {
    return tags.join(' ');
}

function formatTime(t) {
    return t.toFixed(2);
}

dojo.declare('unc.ImageBrowser', [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl("unc", "ImageBrowser.html"),
    widgetsInTemplate: true,
    
    url: '',
    
    selected: '',
    
    uploadDialog: null,
    
    postCreate: function() {
        this.inherited(arguments);
        
        uow.getDatabase({
            database: 'Media',
            collection: 'Image',
            mode: 'r'
        }).then(dojo.hitch(this, function(db) {
        
            this.grid = new dojox.grid.DataGrid({
                store: db,
                structure: [{
                    name: 'Tags',
                    field: 'tags',
                    formatter: formatTags,
                    width: 'auto'
                }, {
                    name: 'Width',
                    field: 'width',
                    width: '5em'
                }, {
                    name: 'Height',
                    field: 'height', 
                    width: '5em'
                    }
                ]}, 
                this.gridGoesHere);
            this.grid.startup();
            this.connect(this.grid, 'onSelected', 'lightSelect');
            this.connect(this.grid, 'onRowDblClick', 'hardSelect');
            
            this.connect(this.query, 'onKeyDown', function(e) {
                if (e.keyCode == dojo.keys.ENTER) {
                    this.grid.setQuery({ tags: { '$all': this.query.attr('value').split(' ') }});
                }
            });
        
            //setup gallery
//            var picker = new dojox.image.ThumbnailPicker({
//                numberThumbs: 4,
//                isClickable: true,
//                thumbHeight: 150,
//                thumbWidth:150
//            });
//            var request= {start:0};
//            
//            var itemNameMap = {imageLargeAttr: "URL", 
//                               imageThumbAttr: "URL"};
//            
//            picker.setDataStore(db, request, itemNameMap);
//            dojo.place(picker.domNode, this.at_picker);
//            console.log("The picker", picker);
//            picker.startup();
//            
//            dojo.subscribe(picker.getClickTopicName(), function(packet) {
//                
//                console.log(packet);
//                var dialog = new dojox.image.LightboxDialog({});
//                dialog.startup();
//                dialog.show({ title:packet.title, href:packet.largeUrl });
//                
//            });
//            
//            //query connect
//            this.connect(this.query, 'onKeyDown', function(e) {
//                if (e.keyCode == dojo.keys.ENTER) {
//                    this.grid.setQuery({ tags: { '$all': this.query.attr('value').split(' ') }});
//                }
//            });
            
            this.connect(this.select, 'onClick', this.imageSelected);
            this.connect(this.upload, 'onClick', this.uploadImage);
        }));
    },
    
    lightSelect: function(idx) {
        this.selected = this.grid.getItem(idx);
        console.log("selected ", this.selected);
    },

    hardSelect: function(evt) {
        var selection = this.grid.selection.getSelected();
        console.log("selected ", this.selected);
        this.selected = selection[0];
        this.previewImage(this.selected.URL);
    },
    
    previewImage: function(url) {
        var dialog = new dojox.image.LightboxDialog({});
        dialog.startup();
        dialog.show({ title:this.selected.title, href:url });
    },
    
    imageSelected: function() {
        return this.selected;
    },
    
    uploadImage: function() {
    
        var theUploader = new unc.ImageUpload();
        
        console.log("The uploader:", theUploader);
        
        var dialog = new dijit.Dialog({
            title: "Upload an image!",
            content: [theUploader.domNode]
        });
        
                
        dojo.subscribe('close uploader', dojo.hitch(this, function() {
            dialog.connect(dialog._fadeOut, 'onEnd', function() {
                this.destroyRecursive();
            });
            dialog.hide();
            //dialog.destroy(); //Recursive(); //for some reason the destroy causes the modality problem.
            dojo.unsubscribe('close uploader');
            console.log('closed uploader');
        }));
        
        dialog.show();
    
    }

});
