dojo.provide('unc.FormGenerator');

dojo.require('dijit.form.Form');
dojo.require('dijit.form.Textarea');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.Editor');

dojo.declare('unc.FormGenerator', [ dijit.form.Form ], {
    schema: {}, // object describing the JSON schema for the object this form is to edit,
    initValue: {}, // object giving the initial value for the object

    startup: function() {
        this.inherited(arguments);

        this.generate_object(this.schema.title || '', this.schema, this.initValue, 
                             this.containerNode, true);
        dojo.addClass(this.containerNode, 'uncFormGenerator');
    },

    generate: function(name, schema, value, parentNode) {
        var type = schema.type;
        var method = 'generate_' + type;
        if (method in this) {
            this[method](name, schema, value, parentNode);
        } else {
            console.log('no method', method);
        }
    },

    generate_object: function(name, schema, value, parentNode, topLevel) {
        console.log('generate_object', name, schema, value, parentNode);
        var title = schema.title || name;
        var node;
        if (!topLevel) {
            node = dojo.create('fieldset', null, parentNode);
            dojo.create('legend', {innerHTML: title}, node);
        } else {
            node = dojo.create('div', null, parentNode);
            dojo.create('h1', {innerHTML: title}, node);
        }
        for(var propertyName in schema.properties) {
            var property = schema.properties[propertyName];
            console.log(propertyName, property);
            this.generate(propertyName, property, value && value[propertyName] || null, node);
        }
        dojo.create('br', {clear: "all"}, parentNode);
    },

    generate_string: function(name, schema, value, node) {
        console.log('generate_string', name, schema, value, node);
        var title = schema.title || name;
        var format = schema.format || 'text';
        var init = value || schema['default'] || '';
        var t;
        if (schema.format == 'html') {
            t = new dijit.Editor({
                name: name,
                value: init,
            });
        } else {
            t = new dijit.form.Textarea({
                name: name,
                value: init,
            });
        }
        dojo.create('label', {innerHTML: title, "for": t.id }, node);
        dojo.place(t.domNode, node);
        if (schema.description) {
            dojo.create('p', {className: "description", innerHTML: schema.description}, node);
        }
        dojo.create('br', {clear: "all"}, node);
    },

    generate_integer: function(name, schema, value, node) {
        console.log('generate_integer', name, schema, value, node);
        var title = schema.title || name;
        var format = schema.format || 'text';
        var init = value || schema['default'] || '';
        var constraints = {places: 0};
        if ("minimum" in schema) {
            constraints.min = schema['minimum'];
        }
        if ("maximum" in schema) {
            constraints.max = schema['maximum'];
        }
        var t = new dijit.form.NumberSpinner({
            name: name,
            value: init,
            constraints: constraints,
        });
        dojo.create('label', {innerHTML: title, "for": t.id }, node);
        dojo.place(t.domNode, node);
        dojo.create('br', {clear: "all"}, node);
    },

    generate_array: function(name, schema, value, parentNode) {
        console.log('generate_array', name, schema, value, parentNode);
        var title = schema.title || name;
        var init = value || schema['default'] || [];
        var node = dojo.create('fieldset', {id: name}, parentNode);
        dojo.create('legend', {innerHTML: title}, node);
        if (schema.description) {
            dojo.create('p', {className: "description", innerHTML: schema.description}, node);
        }

        for(var i = 0; i<=init.length; i++) {
            this.generate('[]', schema.items, init[i], node);
        }
        var renumber = dojo.hitch(this, function() {
            console.log('renumber', node, node.id);
            var items;
            if (schema.items.type == "object") {
                items = dojo.query('#'+node.id+'>fieldset>legend');
                console.log('object items', items);
            } else {
                items = dojo.query('#'+node.id+' > label');
                console.log('simple items', items, node.id);
            }
            items.forEach(function(n, i) { n.innerHTML = '[' + (i+1) + ']'; });
        });
        renumber();
            
        var button = new dijit.form.Button({
            label: "Add",
            onClick: dojo.hitch(this, function() {
                this.generate('[]', schema.items, null, node);
                renumber();
            }),
        });
        dojo.place(button.domNode, node);
        dojo.create('br', {clear: "all"}, parentNode);
    },
});

testSchema = {
    type: "object",
    title: "Test schema",
    properties: {
        foo: { type: "string",
             },
        fee: { type: "string",
             'default': "default value",
             },
        bar: { type: "object",
               properties: {
                   bar1: { type: "string"},
                   bar2: { type: "string"},
               },
             },
        list: {
            type: 'array',
            items: {
                type: "string",
            },
        },
    },
};

initValue = {
    foo: "foo value",
    list: [ "hi", "ho" ],
};
