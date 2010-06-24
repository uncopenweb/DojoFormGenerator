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
dojo.require('dijit.layout.BorderContainer');
dojo.require('dijit.layout.ContentPane');

dojo.declare('unc.TextTilesEditor', [ unc.GenericEditor, dijit._Widget, dijit._Templated, dijit._Container ], {
	templatePath: dojo.moduleUrl('unc', 'TextTilesEditor.html'),
	widgetsInTemplate: true,
	
	lessonStore: {},
	hintStore: {}, //layer over currentHints for store interfacing
	hintGridLayout: [{ name: 'Word', field:'word', width: '50%' },
	                 { name: 'hints',   field: 'hints', width: '50%' }],
    selectedHint: null,
	                 
	postCreate: function() {
		this.inherited(arguments);
		
		this.hintGenerator = new unc.HintGen();
		this.subscribe('hints_ready', function() {
		    console.log('pub recieved');
		    this.currentHints = this.hintGenerator.json;
		    this.newHintGrid();
		});
		
		this.lessonGrid = new dojox.grid.DataGrid({
            store: this.lessonStore,
            structure: this.lessonGridLayout
            });
        dojo.place(this.lessonGrid.domNode, this.lessonGridGoesHere);
        
		this.generateHintsButton.attr('disabled', true);
		this.removeHintButton.attr('disabled', true);
		this.connect(this.generateHintsButton, 'onClick', 'generateHints');
		this.connect(this.removeHintButton, 'onClick', 'removeHint');
		this.saveNewButton.attr('disabled', true);
		this.connect(this.saveNewButton, 'onClick', 'saveAsLesson');
	},
	
	startup: function() {
	    this.inherited(arguments);
	    
	    this.lessonGrid.startup();
	},
	
	/*** Template Selection methods ***/
	/*     the rest is handled by
	 *     genericEditor.js
	 */
	
	editItem: function() {
		this.inherited(arguments);
		this.currentHints = null;
		
		//override
		this.saveNewButton.attr('disabled', true);
		
		this.newHintGrid();
	},
	
	saveAsLesson: function() {
	    // combine both this.current and this.currentHints to a lesson and save
	    var value = this.form.attr('value');
	    
	    var currentLesson = this.lessonStore.newItem();
        
        this.lessonStore.changing(currentLesson);
        dojo.mixin(currentLesson, value);
        dojo.mixin(currentLesson, {hints:this.currentHints});
        console.log(currentLesson);
        var a = this.lessonStore.save({
            onComplete: function() {
                console.log('save complete, does grid update?');
                // apparently they don't trigger this when changing is used.
                this.lessonStore.onSet(this.current);
            },
            scope: this
        });
        console.log('actions=', a);
	},
	
	/*** Hint Generation methods ***/
	
	selectHint: function() {
		this.selectedHint = this.hintGrid.selection.getSelected()[0];
		console.log(this.selectedHint);
		this.removeHintButton.attr('disabled', false);
	},
	
	//On hold until hints are being drawn correctly from the lesson
	removeHint: function() {
	    
		var newWords = [];
		for(var i = 0; i < this.currentHints.words.length; i++) { //Reconstruct a new 'words' array without the deleted ones
			if(this.currentHints.words[i].word != this.selectedHint.word) {
				newWords.push(this.currentHints.words[i]);
			}
		}
		this.currentHints.words = newWords;

		this.hintStore.deleteItem(this.selectedHint);
		this.removeHintButton.attr('disabled', true);
		console.log(this.currentHints);
	},
	
	generateHints: function() {
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
		
		if(this.currentHints) {
		    this.yesNoDialog("Generate Hints?", "Generating hints will cause the current hint bank to be deleted. " +
				"If you have edited the TextTiles schema file you will need to regenerate hints keep your content updated.",
				generateCallback);
		} else {
		    generateCallback(true);
		}
		
		this.saveNewButton.attr('disabled', false);
	},
	
	//Util
	
	newHintGrid: function() {
	    if(this.hintGrid) this.hintGrid.destroyRecursive();

	    //format object oh so carefully for itemfilereadstore...
	    var data = [];
	    if(this.currentHints) {
    	    dojo.forEach(
        	    this.currentHints.words,
        	    function(item) {
        	    var obj = {'word':item.word, 'id':item.id, 'numHints':item.hints.length,
        	    'uIdx':'Freq data, yet to implement'};
        	    data.push(obj);
    	    });
	    }

	    this.hintStore = new dojo.data.ItemFileWriteStore({data:{
	        "identifier":"word",
	        "items": data}});

	    var hintGridLayout = [{ name: 'Word', field:'word', width: '50%' },
	                          { name: '# of hints for word',   field:'numHints',   width: '25%'},
	                          { name: 'Word frequency', field:'uIdx', width: '25%'}];

	    this.hintGrid = new dojox.grid.DataGrid({
	        store: this.hintStore,
	        structure: hintGridLayout,
	        //autoHeight: true
	        rowCount:20
	    });

	    dojo.place(this.hintGrid.domNode, this.hintGridGoesHere);
	    this.hintGrid.startup();

	    this.connect(this.hintGrid, 'onSelected', 'selectHint');
	    this.removeHintButton.attr('disabled', true);
	    this.generateHintsButton.attr('disabled', false);

	}
	
});