/* This is intended to be a composite control to allow saying some text or playing a sound */

dojo.provide("unc.SayOrPlaySelector");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.RadioButton');
dojo.require('unc.AudioSelector');

dojo.declare("unc.SayOrPlaySelector", [ dijit._Widget, dijit._Templated ], {
    templatePath: dojo.moduleUrl('unc', 'SayOrPlaySelector.html'),
    widgetsInTemplate: true,
    
    name: '', // name of this control
    value: '', //this is the text to say or the URL
    disabled: false,
    
    tags: '',
    duration: '',
    
    postCreate: function() {

        this.connect(this.SPsaybutton, 'onChange', function(v) {
            this.radioChange('say', v); });
        this.connect(this.SPplaybutton, 'onChange', function(v) {
            this.radioChange('play', v); });
        var say = this.checkType(this.value) == 'say';
        this.SPsaybutton.set('value', say);
        this.SPplaybutton.set('value', !say);
        //console.log('postCreate', say, this.value);
        if (say) {
            this.SPsay.set('value', this.value);
            this.SPplay.set('value', '');
        } else {
            this.SPsay.set('value', '');
            this.SPplay.set('value', this.value);
        }

        this.connect(this.SPsay, 'onChange', 'onChange');
        this.connect(this.SPplay, 'onChange', 'onChange');
    },

    checkType: function(str) {
        if (/^\/Media\/Audio.*$/.test(str)) { // URL
            return 'play';
        } else {
            return 'say';
        }
    },

    radioChange: function(which, v) {
        //console.log('radioChange', which, v);
        var ctrl = { say: this.SPsay, play: this.SPplay }[which];
        //console.log('ctrl', ctrl);
        if (v) {
            dojo.style(ctrl.domNode, 'display', '');
        } else {
            dojo.style(ctrl.domNode, 'display', 'none');
        }
        this.onChange(this._getValueAttr());
    },

    _getValueAttr: function() {
        if (this.SPsaybutton.get('value')) {
            return this.SPsay.get('value');
        } else {
            return this.SPplay.get('value');
        }
    },

    _setDisabledAttr: function(value) {
        //console.log('SP disable', value);
        dojo.query("[widgetId]", this.domNode).forEach(function(childNode) {
            var child = dijit.byNode(childNode);
            //console.log('child', child, childNode);
            child.set('disabled', value);
        });
    },

    onChange: function() {
    }
});
