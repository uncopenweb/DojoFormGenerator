dojo.provide("unc.AudioSelector");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require('dijit.form.TextBox');

dojo.require('unc.AudioBrowser');

dojo.declare("unc.AudioSelector", [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl('unc', 'AudioSelector.html'),
    widgetsInTemplate: true,
    
    init: '',
    value: '', //this is the URL
    disabled: false,
    
    tags: '',
    duration: '',
    
    postCreate: function() {
        
        this.handle1 = this.connect(this.at_addSoundButton, 'onclick', this.showDialog);
        this.handle2 = this.connect(this.at_playCurrentSoundButton, 'onclick', this.playSound);
        
        //this should set the init value
        if(this.init) {
            console.log("starting init");
        
            uow.getDatabase({
                database: 'Media',
                collection: 'Audio'
            }).then(dojo.hitch(this, function(db) {
                db.fetch({
                    query:{'URL':this.init}, 
                    onComplete: dojo.hitch(this, function(items) {
                        if(items.length > 0) {
                            this.tags = items[0].tags;
                            this.duration = items[0].duration;
                        }
                        
                        this.setSoundValue(this.init, this.tags, this.duration);
                    })
                });
            }));
        }
    
    },
    
    showDialog: function() {
    
        var audioBrowser = new unc.AudioBrowser();
    
        var dialog = new dijit.Dialog({
            title: "Search for and Select a sound!",
            content: [audioBrowser.domNode]
        });
        
        dojo.connect(audioBrowser, 'soundSelected', dojo.hitch(this, function() {
            
            var sound = audioBrowser.selected;
            dialog.hide();
            dialog.destroyRecursive();
            
            this.setSoundValue(sound.URL, sound.tags, sound.duration);
            
            //set sound to value
            this.value = sound.URL;
            this.onChange(this.value);
            
        }));
        
        dialog.show();
    },
    
    setSoundValue: function(url, tags, duration) {
        console.log(url, ",", tags, ",", duration);
        this.value = url;
        this.at_soundTextBox.attr('value', tags.join(' ') + ", " + duration );
    },
    
    playSound: function() {
    
        if(this.value) {
            dojo.publish('playAudio', [this.value]);
        }
    
    },
    
    onChange: function(value) {
        //this is the onChange method holder
    },
    
    _setDisabledAttr: function(value) {
        if(value) {
            dojo.style(this.at_addSoundButton, {
                'opacity':0.4,
                'cursor':'default'
            });
            dojo.style(this.at_playCurrentSoundButton, {
                'opacity':0.4,
                'cursor':'default'
            });
            
            if(this.handle1)
                this.disconnect(this.handle1);
            if(this.handle2)
                this.disconnect(this.handle2);
            
            console.log('default style done');
        }
    }

});
