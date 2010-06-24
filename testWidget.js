dojo.provide('unc.testWidget');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');

dojo.declare('unc.testWidget', [ dijit._Widget, dijit._Templated],  {
    templatePath: dojo.moduleUrl('unc', 'testWidget.html'),
    widgetsInTemplate: true,
    
    postCreate: function() {
        this.inherited(arguments);
    }
    
});