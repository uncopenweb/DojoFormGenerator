dojo.provide('unc.FormGenerator');

dojo.require('dijit._Templated');
dojo.require('dijit._Widget');
dojo.require('dijit._Container');
dojo.require('dijit.layout._LayoutWidget');
dojo.require('unc.SayOrPlaySelector');
dojo.require('unc.AudioSelector');
dojo.require('unc.ImageSelector');
dojo.require('dijit.form.Form');
dojo.require('dijit.form.Textarea');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.form.NumberTextBox');
dojo.require('dijit.form.CheckBox');
dojo.require('dijit.form.Select');
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');
dojo.require('dijit.Editor');
dojo.require('dijit.Tooltip');
dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');

function EditRemove(text, start, stop) {
    while (true) {
        var i1 = text.indexOf(start);
        if (i1 < 0) {
            break;
        }
        var i2 = text.indexOf(stop, i1);
        if (i2 > i1) {
            text = text.slice(0, i1) + text.slice(i2+stop.length);
        }
    }
    return text;
}

/* pasting from MS Word produces HORRIBLY huge html. This filter tries to fix that. */
function EditorFilter(text) {
    // get rid of comment
    text = EditRemove(text, '<!--', '-->');
    
    // get rid of meta content
    text = EditRemove(text, '<meta content', '/>');
    
    // get rid of style
    text = EditRemove(text, '<style>', '</style>');
    
    // get rid of link
    text = EditRemove(text, '<link', '</link>');
    
    // bash class tags
    var pat = new RegExp(' class="[^"]*"', 'g');
    text = text.replace(pat, '');
    
    // bash the o:p tags
    text = text.replace(/<o:p>/g, '').replace(/<\/o:p>/g, '');
    
    return text;
}

dojo.declare('unc.FormGenerator', [ dijit.form.Form ], {
    schema: {}, // object describing the JSON schema for the object this form is to edit,
    initValue: {}, // object giving the initial value for the object

    /**
     * Called to initialize the FormGenerator. The content is generated and linked into the DOM.
     */
    postCreate: function() {
        this.inherited(arguments);

        var w = this.generate('formContent', this.schema, this.initValue);
        dojo.addClass(this.containerNode, 'uncFormGenerator');
        dojo.place(w.domNode, this.containerNode);
        w.startup();
    },

    /**
     * Sorts an flat object based on a "position" attribute
     */
    sort: function(obj){
        var tmp = [], x;
        for( x in obj.properties)
            tmp.push([x,obj.properties[x].position]);
        tmp.sort(function(a,b) {return a[1]-b[1];});
        var neworder = {}, l = tmp.length, i;
        for( i=0; i<l; i++) neworder[tmp[i][0]] = obj.properties[tmp[i][0]];
        obj.properties = neworder;
    },

    /**
     * Generate controls for the given schema initialized with value, called recursively
     */
    generate: function(name, schema, value) {
        //console.log('generate', name, schema, value);
        // Sort pased on 'position' attr
        if(schema.type == 'object')
            this.sort(schema);
        // determine the method to call by introspection
        var type = schema.type;
        var method = 'generate_' + type;
        if (method in this) {
            var r = this[method](name, schema, value);
            return r;
        } else {
            console.log('FormGenerator: no method', method);
        }
    },

    /**
     * Generate fieldset for an object schema
     */
    generate_object: function(name, schema, value) {
        var title = schema.title || name;
        var manager = new unc.ObjectManager({
            name: name,
            theTitle: title,
            description: schema.description || ''
        });

        for(var propertyName in schema.properties) {
            var propertySchema = schema.properties[propertyName];
            var propertyValue = null;
            if (value && value[propertyName] !== undefined) {
                propertyValue = value[propertyName];
            }
            manager.addChild(this.generate(propertyName, propertySchema, propertyValue));
        }
        return manager;
    },

    /**
     * Generate a string input control
     */
    generate_string: function(name, schema, value) {
        //console.log('generate_string', name, schema, value);
        var title = schema.title || name;
        var format = schema.format || 'text';
        var init = value || schema['default'] || '';
        var description = schema.description || '';
        var control;
        var filter = null;
        if (format == 'html') {
            control = new dijit.Editor({
                name: name,
                value: init
            });
            filter = EditorFilter;

        } else if(format == 'audioMedia') {
            control = new unc.AudioSelector({
                name: name,
                value: init 
            });

        } else if(format == 'audio') {
            control = new unc.SayOrPlaySelector({
                name: name,
                value: init
            });

        } else if(format == 'imageMedia') {
            control = new unc.ImageSelector({
                name: name,
                value: init
            });

        } else {
            if ('enum' in schema) {
                var options = dojo.map(schema['enum'], function(e, i) {
                    return { 
                        value: e,
                        label: e,
                        selected: e == init,
                        disabled: false
                    };
                });
                control = new dijit.form.Select({
                    name: name,
                    options: options
                });
            } else {
                //console.log(1, name, init);
                control = new dijit.form.Textarea({
                    name: name,
                    value: init,
                    readOnly: 'readonly' in schema && schema['readonly'],
                    baseClass: 'dijitTextBox dijitTextArea' // why do I need this?
                });
                //console.log(2);
            }
        }
        //console.log('creating FieldManager');
        var manager = new unc.FieldManager({
            theTitle: title,
            control: control,
            description: description,
            filter: filter
        });
        //console.log('generate_string returns', manager);
        return manager;
    },

    /**
     * Generate an integer input control
     */
    generate_integer: function(name, schema, value) {
        var title = schema.title || name;
        var format = schema.format || 'text';
        var init = value || schema['default'] || 0;
        var constraints = {places: 0};
        var description = schema.description || '';
        if ("minimum" in schema) {
            constraints.min = schema.minimum;
        }
        if ("maximum" in schema) {
            constraints.max = schema.maximum;
        }
        var control = new dijit.form.NumberSpinner({
            name: name,
            value: init,
            constraints: constraints
        });
        manager = new unc.FieldManager({
            theTitle: title,
            control: control,
            description: description
        });
        return manager;
    },

    /**
     * Generate a number input control
     */
    generate_number: function(name, schema, value) {
        var title = schema.title || name;
        var format = schema.format || 'text';
        var init = value || schema['default'] || 0;
        var constraints = { };
        var description = schema.description || '';
        if ("minimum" in schema) {
            constraints.min = schema.minimum;
        }
        if ("maximum" in schema) {
            constraints.max = schema.maximum;
        }
        var control = new dijit.form.NumberSpinner({
            name: name,
            value: init,
            constraints: constraints
        });
        manager = new unc.FieldManager({
            theTitle: title,
            control: control,
            description: description
        });
        return manager;
    },
    
    /**
     * Generate a boolean input control
     */
    generate_boolean: function(name, schema, value) {
        var title = schema.title || name;
        var init = value || schema['default'] || 0;
        var description = schema.description || '';
        var control = new dijit.form.CheckBox({
            name: name,
            checked: init
        });
        manager = new unc.FieldManager({
            theTitle: title,
            control: control,
            inline:true,
            description: description
        });
        return manager;
    },

    /**
     * Generate an array manager
     */
    generate_array: function(name, schema, value) {
        var title = schema.title || name;
        var default_value = schema['default'] || [];
        var init = value || default_value;
        var description = schema.description || "";
        var format = schema.format || 'list';
        var minItems = schema.minItems || 0;
        var managerClass = format == 'grid' ? unc.ArrayGridManager : unc.ArrayManager;
        //console.log('generate_array', name, schema, default_value, init);
        var manager = new managerClass({
            name: name,
            theTitle: title,
            description: description,
            generator: dojo.hitch(this, function(init) {
                return this.generate(title, schema.items, init);
            }),
            init: init,
            minItems: minItems
        });
        return manager;
    },

    /**
     * Return the value of the object represented by the form
     */
    _getValueAttr: function() {
        var children = this.getChildren();
        var result = dojo.map(children, function(child) { return child.attr('value'); });
        // I expect only one child here at the top level
        if (result.length == 1) {
            result = result[0];
        }
        return result;
    },
    
    /**
     * Signal any of the contained controls changing value
     */
     onChange: function() {
         //console.log('onChange called');
     }

});

dojo.declare('unc.ArrayGridManager', [ dijit._Widget  , dijit._Templated ], {
    templatePath: dojo.moduleUrl("unc", "ArrayGridManager.html"),
    widgetsInTemplate: true,

    name: "",
    theTitle: "",
    description: "",
    generator: null,
    minItems: 0,
    init: [],

    postCreate: function() {
        this.inherited(arguments);

        this.store = new dojo.data.ItemFileWriteStore({
            identifier: 'id',
            data: {
                items: []
            }
        });
        this.grid = new dojox.grid.DataGrid({
            store: this.store,
            structure: [ { name: 'Name', field: 'Name', width: '100%' } ],
            sortInfo: 1
        }, this.gridNode);
        // insert the initial content
        for (var i=0; i < this.init.length; i++) {
            var it = this.init[i];
            var n = this.store.newItem({ Name: it.Name, Value: it });
        }
        // connect up the buttons
        this.connect(this.addButton, 'onClick', 'addItem');
        this.connect(this.deleteButton, 'onClick', 'deleteItem');
        this.connect(this.grid, 'onRowClick', dojo.hitch(this, function(e) {
            var selected = this.grid.selection.getSelected()[0];
            this.showEditor(selected);
        }));
        if (this.init.length > 0) {
            var first = this.grid.getItem(0);
            this.showEditor(first);
            this.showItem();
        } else {
            this.addItem();
        }
    },

    addItem: function() {
        //console.log('addItem');
        var item = this.store.newItem({
            Name: '...',
            Value: {}
        });
        //console.log('addItem', item);
        this.showEditor(item);
        this.showItem();
    },
    
    deleteItem: function(){
        this.store.deleteItem(this.toEdit);
        var first = this.grid.getItem(0);
        if(first){
            this.showEditor(first);
            this.showItem();
        }else{
            this.addItem();
        }
    },

    showItem: function() {
        var index = this.grid.getItemIndex(this.toEdit);
        //console.log('showEditor', index);
        this.grid.selection.select(index);
        setTimeout(dojo.hitch(this, function() {
            this.grid.scrollToRow(index);
        }, 100));
    },

    showEditor: function(toEdit) {
        if (this.toEdit === toEdit) {
            return;
        }
        this.toEdit = toEdit;
        myGrid = this.grid;
        var value = this.store.getValue(toEdit, 'Value');

        this.itemEditor = this.generator(value);
        dojo.place(this.itemEditor.domNode, this.editorNode, 'only');
        this.connect(this.itemEditor, 'onChange', 'onChange');
    },

    _getValueAttr: function() {
        //console.log('getValue', this);
        if (!this.hasOwnProperty('store')) return [];

        var res = [];
        this.store.fetch({
            onItem: dojo.hitch(this, function(item) {
                res.push(this.store.getValue(item, 'Value'))
            })
        });
        return res;
    },

    startup: function() {
        this.grid.startup();
    },

    onChange: function() {
        //console.log('array g change', this.name);
        var newValue = this.itemEditor.get('value');
        //console.log('newValue', newValue);
        //console.log('toEdit', this.toEdit);
        var oldName = this.toEdit.Name;
        this.store.setValue(this.toEdit, 'Value', newValue);
        this.store.setValue(this.toEdit, 'Name', newValue.Name);
        if (oldName != newValue.Name) {
            // resort
            this.grid.setSortInfo(1);
            this.showItem();
        }
            
    }

});

dojo.declare('unc.ArrayManager', [ dijit._Widget, dijit._Templated, dijit._Container ], {
    templatePath: dojo.moduleUrl("unc", "ArrayManager.html"),
    widgetsInTemplate: true,

    name: "",
    theTitle: "",
    description: "",
    generator: null,
    minItems: 0,
    init: [],

    postCreate: function(args) {
        this.inherited(arguments);

        this.addButton.set('label', 'Add ' + this.theTitle);
        this.connect(this.addButton, 'onClick', function() {
            var item = this.generator(null);
            this.addItem(item);
        });

        // now generate the initial nodes
        for (var i=0; i < Math.max(this.minItems, this.init.length); i++) {
            item = this.generator(this.init[i]);
            this.addItem(item);
        }
    },

    /**
     * Add an item to the array and decorate it with the array controls
     */
    addItem: function(item) {
        var children = this.getChildren();
        var N = children.length;
        var button = dojo.create('img', {src: "images/cross.png", width: "16", height: "16",
            title: "Click to delete this item." }, item.arrayControl);
        this.connect(button, 'onclick', function() {
            item.destroyRecursive();
            this.renumber();
            this.onChange();
        });
        dojo.place(item.domNode, this.containerNode, 'last');
        item.arrayIndex.innerHTML = N;
        this.connect(item, 'onChange', 'onChange');
    },

    /**
     * Renumber the array items after a delete or other reorganization
     */
    renumber: function(item) {
        dojo.forEach(this.getChildren(), function(item, index) {
            item.arrayIndex.innerHTML = index;
        });
    },

    /**
     * Return the value of the array
     */
    _getValueAttr: function() {
        var children = this.getChildren();
        var result = dojo.map(children, function(child) { return child.attr('value'); }, this);
        return result;
    },

    startup: function() {
        dojo.forEach(this.getChildren(), function(child) {
            child.startup(); });
    },

    onChange: function() {
        //console.log('array change', this.name);
    }

});

dojo.declare('unc.ObjectManager', [ dijit._Widget, dijit._Templated, dijit._Container ], {
    templatePath: dojo.moduleUrl("unc", "ObjectManager.html"),
    widgetsInTemplate: true,

    name: "",
    theTitle: "",
    description: "",

    postCreate: function() {
        this.inherited(arguments);
    },

    addChild: function(child) {
        this.inherited(arguments);
        this.connect(child, 'onChange', 'onChange');
    },

    /**
     * Return the object's value
     */
    _getValueAttr: function() {
        var children = this.getChildren();
        var result = {};
        dojo.forEach(children, function(child) {
            result[child.name] = child.attr('value');
        }, this);
        return result;
    },

    /**
     * Set the disabled attribute for all the children
     */
    _setDisabledAttr: function(value) {
        dojo.forEach(this.getChildren(), function(child) {
            child.attr('disabled', value);
        });
    },

    startup: function() {
        dojo.forEach(this.getChildren(), function(child) {
            child.startup();
        });
    },

    onChange: function() {
        //console.log('object Change', this.name);
    }
});

dojo.declare('unc.FieldManager', [ dijit._Widget, dijit._Templated, dijit._Container ], {
    templatePath: dojo.moduleUrl("unc", "FieldManager.html"),
    widgetsInTemplate: true,

    control: null,
    inline: false,
    name: "",
    theTitle: "",
    description: "",
    filter: null, // you can supply a function to filter the value

    /**
     * Initialize the widget and connect up the tooltip
     */
    postCreate: function() {
        this.inherited(arguments);
        dojo.place(this.control.domNode, this.containerNode);
        this.name = this.control.name;
        if (this.description) {
            var tt = new dijit.Tooltip({
                connectId: [ this.control.domNode ], 
                label: this.description});
        }
        this.connect(this.control, 'onChange', 'onChange');
        if(!this.inline)
            dojo.create("br",{},this.label,"after");
    },

    /**
     * Return the value of the enclosed control
     */
    _getValueAttr: function() {
        var value = this.control.attr('value');
        if (this.filter) {
            value = this.filter(value);
        }
        return value;
    },

    /**
     * Set the disabled attribute of the enclosed control
     */
    _setDisabledAttr: function(value) {
        this.control.attr('disabled', value);
    },

    startup: function() {
        this.control.startup();
    }, 

    onChange: function() {
        //console.log('Field change', this.name);
    }
});
