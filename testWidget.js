dojo.provide('unc.testWidget');

dojo.require('dijit._Widget');
dojo.require('dijit._Templated');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.layout._LayoutWidget');
dojo.require('dijit._Container');

dojo.declare('unc.testWidget', [ dijit.layout._LayoutWidget, dijit._Templated, dijit._Container ],  {
    templateString : dojo.cache('unc', 'testWidget.html'),
    widgetsInTemplate: true,
    
    postCreate: function() {
        this.inherited(arguments);
    }
    
});