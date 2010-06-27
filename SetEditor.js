dojo.provide('unc.SetEditor');

dojo.declare('unc.SetEditor', [dijit._Widget, dijit._Templated, dijit._Container ], {
    templatePath: dojo.moduleUrl('unc', 'SetEditor.html'),
    widgetsInTemplate: true,
    
    postCreate: function() {
        this.inherited(arguments);
    }
    
});