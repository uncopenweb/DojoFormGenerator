dojo.provide("unc.ImageSelector");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.Button');
dojo.require('dojox.image.Lightbox');

dojo.require('unc.ImageBrowser');

// a store singleton for use by all of these
dojo.ready(function() {
    unc._ImageMediaStore = uow.getDatabase({
        database: 'Media',
        collection: 'Image',
        mode: 'rc'
    });
});

dojo.declare("unc.ImageSelector", [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl('unc', 'ImageSelector.html'),
    widgetsInTemplate: true,

    name: '', // name of the control
    value: '', //this is the URL
    disabled: false,
    
    title: '',
    tags: '',
    
    postCreate: function() {
    
        this.connect(this.add, 'onClick', this.showBrowseDialog);  
        this.connect(this.preview, 'onClick', this.previewImage);
    
        if(this.value) {
            console.log("starting init");
        
            dojo.when(unc._ImageMediaStore, dojo.hitch(this, function(db) {
                db.fetch({
                    query:{'URL':this.value}, 
                    onComplete: dojo.hitch(this, function(items) {
                        if(items.length > 0) {
                            this.tags = items[0].tags;
                            this.title = items[0].title;
                        }
                        
                        this.setImageValue(this.value, this.tags, this.title);
                    })
                });
            }));
        }
    
    },
    
    showBrowseDialog: function() {
        
        var imageBrowser = new unc.ImageBrowser();
    
        var dialog = new dijit.Dialog({
            title: "Select an Image",
            content: [imageBrowser.domNode]
        });
        
        dojo.connect(imageBrowser, 'imageSelected', dojo.hitch(this, function() {
            
            var image = imageBrowser.selected;
            dialog.hide();
            dialog.destroyRecursive();
            
            this.setImageValue(image.URL, image.tags);
            
            //set sound to value
            this.value = image.URL;
            this.onChange(this.value);
            })
        );
        
        dialog.show();
        
    }, 
    
    setImageValue: function(url, tags, title) {
        
        this.value = url;
        this.title = title;
        this.at_imageTextBox.attr('value', url + tags.join(' ')); 
        
    },
    
    previewImage: function() {
    
        if(this.value) {
            var dialog = new dojox.image.LightboxDialog({});
            dialog.startup();
            dialog.show({ title:this.title, href:this.value });
        } else {
            var dialog = new dojox.image.LightboxDialog({});
            dialog.startup();
            dialog.show({ title:'Default Image', href:'images/test.jpg' });
        }
    
    },
    
    onChange: function(value) {
        //this is the onChange method holder
    },
    
    _setDisabledAttr: function(value) {
        dojo.query("[widgetId]", this.domNode).forEach(function(childNode) {
            var child = dijit.byId(dojo.attr(childNode, 'widgetid'));
            child.set('disabled', value);
        });
    }
    
});
