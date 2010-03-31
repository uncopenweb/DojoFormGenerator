dojo.provide('unc.ArrayManager');

dojo.require('dijit._Templated');
dojo.require('dijit._Widget');
dojo.require('dijit._Container');

dojo.declare('unc.ArrayManager', [ dijit._Widget, dijit._Templated, dijit._Container ], {
    templatePath: dojo.moduleUrl("unc", "ArrayManager.html"),
    widgetsInTemplate: true,

    generator: null,
    schema: {},
    name: "",
    title: "",
    init: [],
    description: "",

    postCreate: function() {
        this.inherited(arguments);

        //console.log('startup ArrayManager', this.containerNode, this.init);
        var last;
        for(var i=0; i <= this.init.length; i++) {
            last = this.generator('['+(i+1)+']', this.schema, this.init[i], this.containerNode);
            var b = new dijit.form.Button({label:'-'});
            dojo.place(b.domNode, this.containerNode);
        }
        last.attr('disabled', true);
        this.connect(this.add, 'onClick', 'addItem');
    },

    addItem: function() {
        var children = this.getChildren();
        children[children.length-1].attr('disabled', false);
        var w = this.generator('['+(children.length+1)+']', this.schema, null, this.containerNode);
        w.attr('disabled', true);
    },

    itemClick: function(e) {
        console.log(e);
    },

    _getValueAttr: function() {
        var children = this.getChildren();
        children.pop();
        var result = [];
        dojo.forEach(children, function(child) {
            result.push(child.attr('value'));
        }, this);
        return result;
    }

});

        