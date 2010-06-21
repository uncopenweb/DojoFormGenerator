dojo.provide('unc.TextTilesEditor');

dojo.require('unc.GenericEditor');
dojo.require('unc.FormGenerator');
dojo.require('dijit._Templated');
dojo.require('dijit._Widget');
dojo.require('dijit._Container');
dojo.require('dijit.form.Button');
dojo.require('dijit.Dialog');
dojo.require('dojox.grid.DataGrid');
dojo.require('dojo.data.ItemFileWriteStore');

dojo.declare('unc.TextTilesEditor', [ unc.GenericEditor, dijit._Widget, dijit._Templated, dijit._Container ], {
	templatePath: dojo.moduleUrl('unc', 'TextTilesEditor.html'),
	widgetsInTemplate: true,
	
	hintStore: {},
	wordStore: {}, //substore used to represent the words of hints
	hintGridLayout: [{ name: 'Word', field:'word', width: '50%' },
	                 { name: 'hints',   field: 'hints', width: '50%' }],
    selectedHint: null,
	                 
	postCreate: function() {
		this.inherited(arguments);
		
		uow.getDatabase({database: 'BigWords',
			collection: 'demoHints'}).addCallback(dojo.hitch(this, function(db) {
			this.hintStore = db;
			}));
		
		this.hintGenerator = new unc.HintGen({});
		
		this.generateHintsButton.attr('disabled', true);
		this.removeHintButton.attr('disabled', true);
		this.saveHintButton.attr('disabled', true);
		this.connect(this.generateHintsButton, 'onClick', 'generateHint');
		this.connect(this.removeHintButton, 'onClick', 'removeHint');
		this.connect(this.saveHintButton, 'onClick', 'saveHint');
	},
	
	editItem: function() {
		this.inherited(arguments);
		
		this.newHintGrid();
	},
	
	selectHint: function() {
		this.selectedHint = this.hintGrid.selection.getSelected()[0];
		console.log(this.selectedHint);
		this.removeHintButton.attr('disabled', false);
	},
	
	removeHint: function() {
		var base = this.current.lessonWord;
		this.hintStore.fetch({query: {base:base}, 
			onComplete: dojo.hitch(this, function(items) {
				
				dojo.forEach(items, function(item) { this.hintStore.deleteItem(item); }, this);
				
				if(items.length > 0) {
					var base = items[0];
					var newWords = [];
					for(var i = 0; i < base.words.length; i++) { //Reconstruct a new 'words' array without the deleted ones
						if(base.words[i].word != this.selectedHint.word) {
							newWords.push(base.words[i]);
						}
					}
					base.words = newWords;
					this.hintStore.newItem(base);
			}
			
		})
		});
		this.wordStore.deleteItem(this.selectedHint);
		this.removeHintButton.attr('disabled', true);
	},
	
	saveHint: function() {
		this.hintStore.save();
//		this.hintStore.changing(this.selectedHint);
//        var a = this.hintStore.save({
//            onComplete: function() {
//                console.log('save complete, does grid update?');
//                // apparently they don't trigger this when changing is used.
//                this.store.onSet(this.current);
//            },
//            scope: this
//        });
//        console.log('actions=', a);
	},
	
	generateHint: function() {
		var generateCallback = dojo.hitch(this, function(gen) { 
			
			if(!this.current.lessonWord) {
				var thisdialog = new dijit.Dialog({ title: "Lesson Word Missing", 
					content: "You must enter a lesson word before you can generate hints" });
				thisdialog.show();
				return;
			}
			
			if(gen) {
				
				this.hintGenerator.generateHints(this.current.lessonWord);
				
			} else {
				console.log('generate canceled');
			}
		});
		this.yesNoDialog("Generate Hints?", "Generating hints will cause the current hint bank to be deleted. " +
				"If you have edited the TextTiles schema file you will need to regenerate hints keep your content updated.",
				generateCallback);
	},
	
	//Util
	
	newHintGrid: function() {
		if(this.hintGrid) this.hintGrid.destroyRecursive();
		
		var base = this.current.lessonWord;
		var hint;
		
		//get hint for base word -> fetch from demoHints
		this.hintStore.fetch({query: {base:base}, onComplete: dojo.hitch(this, function(items) {
			if(items.length > 0) {
				hint = items[0];
			}
			
			//format object oh so carefully for itemfilereadstore...
			var data = [];
			dojo.forEach(
					hint.words,
					function(item) {
						var obj = {'word':item.word, 'id':item.id, 'numHints':item.hints.length,
								'uIdx':'Freq data, yet to implement'};
						data.push(obj);
					});

			this.wordStore = new dojo.data.ItemFileWriteStore({data:{
				"identifier":"word",
				"items": data}});
			
			var hintGridLayout = [{ name: 'Word', field:'word', width: '50%' },
			                      { name: '# of hints for word',   field:'numHints',   width: '25%'},
			                      { name: 'Word frequency', field:'uIdx', width: '25%'}];
			
			this.hintGrid = new dojox.grid.DataGrid({
				store: this.wordStore,
				structure: hintGridLayout,
				//autoHeight: true
				rowCount:20
				});
			
			dojo.place(this.hintGrid.domNode, this.hintGridGoesHere);
			this.hintGrid.startup();

			this.connect(this.hintGrid, 'onSelected', 'selectHint');
			this.removeHintButton.attr('disabled', true);
			this.saveHintButton.attr('disabled', false);
			this.generateHintsButton.attr('disabled', false);
		})
		});
		
	}
	
});