dojo.provide('unc.AudioBrowser');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.Toolbar');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.TextBox');
dojo.require('dojox.grid.DataGrid');

dojo.require('unc.AudioUpload');

function formatTags(tags) {
    return tags.join(' ');
}

function formatTime(t) {
    return t.toFixed(2);
}

dojo.declare('unc.AudioBrowser', [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl("unc", "AudioBrowser.html"),
    widgetsInTemplate: true,
    
    url: '',   // base URL without the extension for the sound
    
    selected: '',
    
    postCreate: function(self) {
        this.inherited(arguments);
        uow.getDatabase({
            database: 'Media',
            collection: 'Audio',
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
                    name: 'Duration',
                    field: 'duration',
                    formatter: formatTime,
                    width: '5em'
                }
                ]
            }, this.gridGoesHere);
            this.grid.startup();
            this.connect(this.grid, 'onSelected', 'lightSelect');
            this.connect(this.grid, 'onRowDblClick', 'hardSelect');
            
            this.connect(this.query, 'onKeyDown', function(e) {
                if (e.keyCode == dojo.keys.ENTER) {
                    this.grid.setQuery({ tags: { '$all': this.query.attr('value').split(' ') }});
                }
            });
            
            this.connect(this.select, 'onClick', this.soundSelected);
            this.connect(this.play, 'onClick', this.playSelected);
            this.connect(this.upload, 'onClick', this.uploadAudio);
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
    },
    
    soundSelected: function() {
        return this.selected;
    },
    
    playSelected: function() {
        uow.getAudio().then(dojo.hitch(this, function(a) {
            a.play({url : this.selected.URL});  
        }));
    },
    
    uploadAudio: function() {
    
        var theUploader = new unc.AudioUpload();
        
        console.log("The uploader:", theUploader);
        
        var dialog = new dijit.Dialog({
            title: "Upload a sound!",
            content: [theUploader.domNode]
        });
        
        dojo.subscribe('close uploader', function() {
            dialog.hide();
            dialog.destroyRecursive();
            console.log('closed uploader');
        });
        
        dialog.show();
    
    }
    
});
