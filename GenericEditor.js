dojo.provide('unc.GenericEditor');

dojo.require('unc.FormGenerator');
dojo.require('dijit._Templated');
dojo.require('dijit._Widget');
dojo.require('dijit._Container');
dojo.require('dijit.form.Button');
dojo.require('dijit.Dialog');
dojo.require('dojox.grid.DataGrid');

dojo.declare('unc.GenericEditor', [dijit._Widget, dijit._Templated, dijit._Container ], {
    templatePath: dojo.moduleUrl('unc', 'GenericEditor.html'),
    widgetsInTemplate: true,

    schema: {},
    store: {},
    gridLayout: {},
    _default: {},

    current: null, //item being edited if it is from the collection
    form: null, // form control if it has been created

    postCreate: function() {
        this.inherited(arguments);

        this.grid = new dojox.grid.DataGrid({
            store: this.store,
            structure: this.gridLayout});
        dojo.place(this.grid.domNode, this.gridGoesHere);
        this.connect(this.grid, 'onSelected', 'lightSelect');
        this.connect(this.grid, 'onRowDblClick', 'hardSelect');
        this.connect(this.editButton, 'onClick', 'hardSelect');
        this.connect(this.deleteButton, 'onClick', 'deleteItem');
        this.deleteButton.attr('disabled', true);
        this.connect(this.newButton, 'onClick', 'newItem');
        this.connect(this.saveButton, 'onClick', 'save');
        this.saveButton.attr('disabled', true);        
        this.connect(this.saveNewButton, 'onClick', 'saveAsNew');
        this.saveNewButton.attr('disabled', true);

        this.store.fetch({query: {name:"default"}, onComplete: dojo.hitch(this, function(items) {
            if(items.length > 0)
                this._default = items[0];        
            console.log(this._default);
        })
        });

        console.log(this.schema);
    },

    lightSelect: function(idx) {
        this.selected = this.grid.getItem(idx);
        console.log("Light selected: " + this.selected);
        this.deleteButton.attr('disabled', false);
        this.editButton.attr('disabled', false);
    },

    hardSelect: function(evt) {
        var selected = this.grid.selection.getSelected();
        console.log("Hard selected: " + selected);
        //prompt for save?
        this.current = selected[0];
        this.selectedGoesHere.innerHTML = "<h1><b>Currently Open: " + this.current.name + "</b></h1>";
        this.editItem();
    },

    startup: function() {
        this.grid.startup();
    },

    editItem: function() {
        console.log('editItem');
        this.newForm(this.current);
        this.saveButton.attr('disabled', false);
        this.saveNewButton.attr('disabled', false);
        console.log('editItem ends');
    },

    //Note: Does not fire through 'hardSelect', but follows same behavior
    newItem: function(evt) {
        this.current = this.store.newItem();
        this.grid.selection.select(this.grid.getItemIndex(this.current));
        this.newForm(this._default);
        this.saveButton.attr('disabled', false);
        this.saveNewButton.attr('disabled', true);
    },

    //save 'current', not selected
    save: function() {
        var value = this.form.attr('value');

        this.store.changing(this.current);
        dojo.mixin(this.current, value);
        var a = this.store.save({
            onComplete: function() {
            console.log('save complete, does grid update?');
            // apparently they don't trigger this when changing is used.
            this.store.onSet(this.current);
        },
        scope: this
        });
        console.log('actions=', a);
    },

    saveAsNew: function() {
//      console.log('::: Save as new not currently implemented :::');
//      return; //what does this do? unexpected behavior here, definitly
//      delete this.current._id;
//      this.save();
    },

    deleteItem: function() {
        var deleteCallback = dojo.hitch(this, function(del) {
            if(del) {
                this.store.deleteItem(this.selected);
                this.store.save();
                this.deleteButton.attr('disabled', true);
            }
            else {
                console.log("delete canceled");
            }
        });
        this.yesNoDialog("Delete Item?", dojo.replace("Are you sure you want to delete {0}?", 
                [this.selected.name]), deleteCallback);
    },

    //Util

    newForm: function(item) {
        if(this.form) this.form.destroyRecursive();

        this.form = new unc.FormGenerator({
            schema: this.schema,
            initValue: item
        });

        dojo.place(this.form.domNode, this.formGoesHere, 'only');
    },

    yesNoDialog: function(title, content, callback) {

        var dialog = new dijit.Dialog({id: 'yesNoDialog', title:title });

        var callbackwrapper = function(mouseEvent) {
            dialog.hide();
            dialog.destroyRecursive();
            if(mouseEvent.explicitOriginalTarget.id == 'yesButton') {
                callback(true);
            } else {
                callback(false);
            }
        };

        var questionDiv = dojo.create('div', { innerHTML: content });
        var yesButton = new dijit.form.Button(
                { label: 'Yes', id: 'yesButton', onClick: callbackwrapper });
        var noButton = new dijit.form.Button(
                { label: 'No', id: 'noButton', onClick: callbackwrapper });

        dialog.containerNode.appendChild(questionDiv);
        dialog.containerNode.appendChild(yesButton.domNode);
        dialog.containerNode.appendChild(noButton.domNode);

        dialog.show();

    }

});
