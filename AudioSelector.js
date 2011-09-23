dojo.provide("unc.AudioSelector");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require('dijit.form.Button');
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.ValidationTextBox');
dojo.require('dojox.form.FileInput');
dojo.require('dijit.form.Form');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout.TabContainer');
dojo.require('dojox.grid.DataGrid');
dojo.require('dijit.Dialog');

// a store singleton for use by all of these
dojo.ready(function() {
    unc._AudioMediaStore = uow.getDatabase({
        database: 'Media',
        collection: 'Audio',
        mode: 'rc'
    });
});

dojo.declare("unc.AudioSelector", [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl('unc', 'AudioSelector.html'),
    widgetsInTemplate: true,
    
    name: '', // the name of this variable
    value: '', //this is the URL
    disabled: false,
    
    tags: '',
    duration: '',
    
    postCreate: function() {
        
        this.handle1 = this.connect(this.at_addSoundButton, 'onClick', "showDialog");
        this.handle2 = this.connect(this.at_playCurrentSoundButton, 'onClick', "playSound");
        
        //this should set the init value
        this.set('value', this.value);
    
    },
    
    showDialog: function() {
    
        console.log('about to create dialog');

        var dialog = new unc.AudioSearchUpload();
        console.log('created dialog');
        dojo.connect(dialog, 'onOK', dojo.hitch(this, function() {
            
            var sound = dialog.selected;
            dialog.hide();
            dialog.destroyRecursive();
            
            this.setSoundValue(sound.URL, sound.tags, sound.duration);
            
            //set sound to value
            this.value = sound.URL;
            this.onChange(this.value);
            
        }));
        console.log('about to show');
        dialog.show();
        console.log('show returns');
    },
    
    setSoundValue: function(url, tags, duration) {
        console.log(url, ",", tags, ",", duration);
        this.value = url;
        this.at_soundTextBox.attr('value', tags.join(' ') + ", " + duration );
    },
    
    playSound: function() {
        console.log('this should play', this.value);
        if(this.value) {
            uow.getAudio().then(dojo.hitch(this, function(a) {
                a.play({url : this.value});  
            }));
        }
    },
    
    onChange: function(value) {
        //this is the onChange method holder
    },
    
    _setDisabledAttr: function(value) {
        console.log('AS disable', value);
        dojo.query("[widgetId]", this.domNode).forEach(function(childNode) {
            var child = dijit.byId(dojo.attr(childNode, 'widgetid'));
            child.set('disabled', value);
        });
    },

    _setValueAttr: function(value) {
        this.value = value;
        if(this.value) {
            console.log("starting set Value");
        
            dojo.when(unc._AudioMediaStore, dojo.hitch(this, function(db) {
                db.fetch({
                    query:{'URL':this.value}, 
                    onComplete: dojo.hitch(this, function(items) {
                        if(items.length > 0) {
                            this.tags = items[0].tags;
                            this.duration = items[0].duration;
                        }
                        
                        this.setSoundValue(this.value, this.tags, this.duration);
                    })
                });
            }));
        }
    }

});

function formatTags(tags) {
    return tags.join(' ');
}

function formatTime(t) {
    return t.toFixed(2);
}

dojo.declare('unc.AudioSearchUpload', [ dijit._Widget ], {
    // I can't make templated creation work so I'll have to do it programmatically. yuk.

    popup: null, // the dialog goes here
    
    url: '',   // base URL without the extension for the sound
    
    selected: '',

    postCreate: function(self) {
        console.log('postCreate starts');
        this.inherited(arguments);

        // wait on the database
        dojo.when(unc._AudioMediaStore, dojo.hitch(this, function(store) {
            this.store = store;

            this.tabc = new dijit.layout.TabContainer({
                style: 'width:600px; height:400px',
                'class': 'AudioSearchUpload'
            });

            var d = dojo.create('div');
            var t1 = new dijit.layout.ContentPane({
                title: 'Search',
                content: d
            });
            var l = dojo.create('label', {innerHTML: 'Query: '}, d);
            this.query = new dijit.form.TextBox();
            dojo.place(this.query.domNode, l);
            this.search = new dijit.form.Button({label: 'Search'});
            dojo.place(this.search.domNode, d);
            this.connect(this.search, 'onClick', function() {
                this.grid.setQuery({ tags: { '$all': this.query.get('value').split(' ') }});
            });

            dojo.create('br', {}, d);
            // create grid placeholder
            // if I don't specify a height the grid will have only one line
            this.gridGoesHere = dojo.create('div', {style: "height:300px;"}, d);
            this.grid = new dojox.grid.DataGrid({
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
                           ],
                store: store
            }, this.gridGoesHere);

            this.connect(this.grid, 'onSelected', 'lightSelect');
            this.connect(this.grid, 'onRowDblClick', 'hardSelect');

            this.select = new dijit.form.Button({label: 'OK'});
            dojo.place(this.select.domNode, d);
            this.connect(this.select, 'onClick', 'onOK');

            this.play = new dijit.form.Button({label: 'Preview'});
            dojo.place(this.play.domNode, d);
            this.connect(this.play, 'onClick', 'onPlay');

            this.cancel = new dijit.form.Button({label: 'Cancel'});
            dojo.place(this.cancel.domNode, d);
            this.connect(this.cancel, 'onClick', 'onCancel');

            this.tabc.addChild(t1);

            var d2 = dojo.create('div');
            var t2 = new dijit.layout.ContentPane({
                title: 'Upload',
                content: d2
            });
            this.uploadForm = dojo.create('form', { method:"POST",
                                                    enctype:"multipart/form-data" });
            dojo.place(this.uploadForm, d2);
            var f = this.uploadForm;

            l = dojo.create('label', {innerHTML: 'Title: '}, f);
            this.title = new dijit.form.TextBox({ name: 'title' });
            dojo.place(this.title.domNode, l);
            dojo.create('br', {}, f);

            l = dojo.create('label', {innerHTML: 'Tags: '}, f);
            this.tags = new dijit.form.TextBox({ name: 'tags' });
            dojo.place(this.tags.domNode, l);
            dojo.create('br', {}, f);

            l = dojo.create('label', {innerHTML: 'Description: '}, f);
            this.description = new dijit.form.TextBox({ name: 'description' });
            dojo.place(this.description.domNode, l);
            dojo.create('br', {}, f);

            l = dojo.create('label', {innerHTML: 'Credit URL: '}, f);
            this.credit = new dijit.form.TextBox({ name: 'creditURL' });
            dojo.place(this.credit.domNode, l);
            dojo.create('br', {}, f);

            l = dojo.create('label', {innerHTML: 'Choose File: '}, f);
            this.file = new dojox.form.FileInput({ name: 'file' });
            dojo.place(this.file.domNode, l);
            dojo.create('br', {}, f);

            this.messages = dojo.create('p', {}, f);

            this.submit = new dijit.form.Button({ type:'button',
                                                  label: 'Submit' });
            dojo.place(this.submit.domNode, d2);
            this.connect(this.submit, 'onClick', 'onSubmit');

            this.cancel2 = new dijit.form.Button({ type:'button',
                                                   label: 'Cancel' });
            this.connect(this.cancel2, 'onClick', 'onCancel');
            dojo.place(this.cancel2.domNode, d2);

            //this.uploadForm.startup();

            this.tabc.addChild(t2);
            
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
    
    onOK: function() {
    },
    
    onPlay: function() {
        uow.getAudio().then(dojo.hitch(this, function(a) {
            a.play({url : this.selected.URL});  
        }));
    },
    
    onCancel: function() {
        this.hide();
    },

    onSubmit: function() {
        console.log('submit', this.uploadForm.value);
        var f = this.uploadForm;
        theForm = this.uploadForm;

        if (!f.file.value) {
            this.showMessage('You must specify a file to upload.');
            return;
        }
        if (!f.title.value) {
            this.showMessage('Please give your sound a title so others can find it');
            //return;
        }
        if (!f.tags.value) {
            this.showMessage('Please give your sound some descriptive tags so others can find it.');
            //return;
        }
        dojo.when(unc._AudioMediaStore, dojo.hitch(this, function(db) {
            db.upload({
                form: this.uploadForm,
                load: dojo.hitch(this, function(data, ioArgs) {
                    console.log('load', data);
                    this.selected = data;
                    this.onOK();
                    console.log("Upload has been confirmed!");
                }),
                error: dojo.hitch(this, function(msg, ioArgs) {
                    console.log('error', msg);
                    this.showMessage(msg);
                    //dojo.byId('messages').innerHTML = msg;
                })
            });
        }));

    },

    showMessage: function(msg) {
        this.messages.innerHTML = msg;
    },
    
    show: function() {
        this.popup = new dijit.Dialog({
            content: this.tabc
        });
        this.popup.show();
        this.tabc.startup();
        this.grid.startup();
    },

    hide: function() {
        this.popup.destroy();
    }
    
});
