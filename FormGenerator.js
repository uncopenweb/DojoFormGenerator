dojo.provide('unc.FormGenerator');

dojo.require('dijit.form.Form');
dojo.require('dijit.form.Textarea');
dojo.require('dijit.form.Button');
dojo.require('dijit.form.NumberSpinner');
dojo.require('dijit.Editor');
dojo.require('unc.ArrayManager');
dojo.require('unc.ObjectManager');

dojo.declare('unc.FormGenerator', [ dijit.form.Form ], {
    schema: {}, // object describing the JSON schema for the object this form is to edit,
    initValue: {}, // object giving the initial value for the object

    startup: function() {
        this.inherited(arguments);

        var w = this.generate_object(this.schema.title || '', this.schema, this.initValue, 
                             this.containerNode, true);
        dojo.addClass(this.containerNode, 'uncFormGenerator');
    },

    generate: function(name, schema, value, parentNode) {
        //console.log('generate', name, schema, value, parentNode);
        var type = schema.type;
        var method = 'generate_' + type;
        if (method in this) {
            return this[method](name, schema, value, parentNode);
        } else {
            console.log('no method', method);
        }
    },

    generate_object: function(name, schema, value, parentNode, topLevel) {
        //console.log('generate_object', name, schema, value, parentNode);
        var title = schema.title || name;
        var n = new unc.ObjectManager({
            name: name,
            title: title,
            generator: dojo.hitch(this, 'generate'),
            schema: schema,
            init: value,
            description: schema.description || ''
        });
        if (topLevel) {
            dojo.addClass(n.domNode, 'topLevel');
        } else {
            dojo.addClass(n.domNode, 'nestedLevel');
        }
        dojo.place(n.domNode, parentNode);
        //dojo.create('br', {clear: "all"}, parentNode);
        return n;
    },

    generate_string: function(name, schema, value, node) {
        //console.log('generate_string', name, schema, value, node);
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
                baseClass: 'dijitTextBox dijitTextArea',
            });
        }
        if (title) dojo.create('label', {innerHTML: title, "for": t.id }, node);
        dojo.place(t.domNode, node);
        if (schema.description) {
            dojo.create('p', {className: "description", innerHTML: schema.description}, node);
        }
        //dojo.create('br', {clear: "all"}, node);
        return t;
    },

    generate_integer: function(name, schema, value, node) {
        //console.log('generate_integer', name, schema, value, node);
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
        if (title) dojo.create('label', {innerHTML: title, "for": t.id }, node);
        dojo.place(t.domNode, node);
        dojo.create('br', {clear: "all"}, node);
        return t;
    },

    generate_array: function(name, schema, value, parentNode) {
        //console.log('generate_array', name, schema, value, parentNode);
        var title = schema.title || name;
        var init = value || schema['default'] || [];
        var node = new unc.ArrayManager({
            name: name,
            title: title,
            generator: dojo.hitch(this, 'generate'),
            schema: schema.items,
            init: init,
            description: schema.description,
        });
        dojo.place(node.domNode, parentNode);
        //dojo.create('br', {clear: "all"}, parentNode);
        return node;
    },

    _getValueAttr: function() {
        var children = this.getChildren();
        //console.log('FG value', children);
        return children[0].attr('value');
    },

});
