dojo.provide('unc.HintGen');

dojo.require("dijit._Templated");
dojo.require("dijit._Widget");
dojo.require('dijit.form.TextBox');
dojo.require('dijit.form.Textarea');
dojo.require('dijit.form.Button');
dojo.require('dijit.Dialog');

dojo.declare('unc.HintGen', [dijit._Widget, dijit._Templated], {
    templatePath: dojo.moduleUrl("unc", "TextTilesEditor.html"),
    widgetsInTemplate: true,
    
    minLength: 3,
    rules: {1:"Try adding a prefix or suffix to '{0}'", 2:"Try removing a prefix or suffix from '{0}'",
			3:"Try adding a letter to '{0}'",4:"Try removing a letter from '{0}'",5:"Try replacing one letter in '{0}'"},
    words: {},
	
	postCreate: function() {
    	this.connect();
		
		uow.getDatabase({database: 'BigWords',
			collection: 'AmericanEnglish'}).addCallback(dojo.hitch(this, function(db) {
			this.dict = db;
			}));
		uow.getDatabase({database: 'BigWords',
			collection: 'wordfreq'}).addCallback(dojo.hitch(this, function(db) {
			this.freq = db;
			}));
		uow.getDatabase({database: 'BigWords',
			collection: 'demoHints'}).addCallback(dojo.hitch(this, function(db) {
			this.demoSave = db;
			}));
	},
	
	connect: function() {
//		dojo.connect(this.at_genHints, 'onClick', this, this.generateHintsButton);
//		dojo.connect(this.at_submit, 'onClick', this, this.submitJson);
	},
	
	submitJson: function() {
		var callback = dojo.hitch(this, function() {
			this.demoSave.fetch({query:{base:this.json.base}, onComplete: dojo.hitch(this, function(items) { 
				dojo.forEach(items, function(item) { this.demoSave.deleteItem(item); }, this);
				this.demoSave.newItem(this.json);
				this.demoSave.save();
				console.log("Saved to database");
			}) 
			});
		});
		//callback();
		//do a dialog to save or not
		this.raiseYesNoDialog("Submit as json?", "Submit these rules as a json file?", callback);
	},
	
	generateHints: function(word) {
		//clear old storage
		this.words = {};
//		this.at_output.setValue('');
		this.json = {};
		
		if(word) {
			var base = word;
		} else {
		//grab word from input
		var base = this.at_input.value;
		}
		if(!base) {
			this.showDialog('Base word missing!', 'Please input a base word to generate hints for!');
			return;
		}
		
//		var num = this.at_num.value;
		var num;
		if(!num) {
			num = 100;
		}
		
		//generate all possible words
		//var baseRE = '/\\b((?!\\w*(\\w)\\w*\\2)\^[' + base + ']{' + this.minLength + ',' + base.length + '})\\b/';
		//var baseRE = '/\\b\^[' + base + ']{' + this.minLength + ',' + base.length + '}\\b/';
		var baseRE = '/^[' + base + ']{' + this.minLength + ',' + base.length + '}$/';
		
		var store = {
				onLoad: dojo.hitch(this, function() {
					if(store.dictItems && store.freqItems) {
						this.onLoadWords(store.dictItems, store.freqItems, base);
					}
			})
		};
		
		this.dict.fetch({query: {word:baseRE}, count: num,
			onComplete: function(items) {
				store.dictItems = items;
				store.onLoad();
			},
			onError: function(err) {
				console.log(err);
			}});
		
		this.freq.fetch({query: {word:baseRE, 'U':{ $gt: 1 } }, count: num,
			onComplete: function(items) {
				store.freqItems = items;
				store.onLoad();
			},
			onError: function(err) {
				console.log(err);
			}});
		
	},
	
	onLoadWords: function(dictItems, freqItems, base) {
		//extract words from the result
		strings = dojo.map(dictItems, function(item) { return item.word; });
		freqStrings = dojo.map(freqItems, function(item) { return item.word; });
		
		//filter words
		wordStrings = this.filterWords(strings, freqStrings, base);
		//console.log(wordStrings);
		
		//these are all the accepted words, put in object format
		for(var i = 0; i < wordStrings.length; i++) {
			this.words[i] = {
					word: wordStrings[i],
					hints: []
			};
		}
		
		this.genHints(this.words);	//generate hints and rules + (show progress)
		this.outputHints(this.words, base);			//write a json
	},
	
	genHints: function(words) {
		//takes in an array of all generated words and makes a new array of words associated to hints
		var hints = {};
		console.log(words);
		
		//do processing, put in an entry for a word
		this.hintsForPreAndSuf(words);
		this.hintsForAddOneLetter(words);
		this.hintsForReplaceOneLetter(words);
		
//		var i = 0;
//		while(words[i] != null) {
//			if(words[i].hints.length > 0) {
//				var out = this.at_output.attr('value') + '>> ' + i + ': ' + words[i].word + ' -> ';
//				dojo.forEach(
//						words[i].hints,
//						function(hint) {
//							out += '[' + hint + ']';
//						});
//				out += "\n";
//				this.at_output.setValue(out);
//			}
//			i++;
//		}
		
		return hints;
		
	},
	
	outputHints: function(words, base) {
		//make and write a json of all words and hints
		var json = {};
		
		json.base = base;
		//json.words = {};
		json.words = [];
		json.jumbleHintText = "Try using the letters in '{0}' to make a word!";
		
		var i = 0;
		while(words[i] != null) {
			if(words[i].hints.length > 0) {
				
				var obj = {};
				
				obj.id = i;
				obj.hints = [];
				obj.word = words[i].word;
				
				dojo.forEach(
						words[i].hints,
						function(hint) {
							obj.hints.push({wordNum:hint[0], hintText:hint[1], wordTo:hint[2], hintPriority:hint[3]});
						});
				
				json.words.push(obj);
				
//				json.words[i] = {};
//				json.words[i].hints = [];
//				
//				json.words[i].word = words[i].word;
//				
//				dojo.forEach(
//						words[i].hints,
//						function(hint) {
//							json.words[i].hints.push({wordNum:hint[0], hintText:hint[1], wordTo:hint[2]});
//						});
			}
			
			i++;
		}
		
		console.log(json);
		this.json = json;
		
		this.submitJson();
		
	},
	
	//------------- UTIL METHODS -----------------
	
	hintsForPreAndSuf: function(words) {
		
		var rules = this.rules;
		
		var i = 0;
		
		while(words[i] != null) {
		
			var word = words[i].word;
			prefixList = ['a', 'an', 'ab', 'ac', 'acr', 'acro', 'aden', 'adeno', 
			              'agr', 'agro', 'ana', 'ano', 'andr', 'anem', 'ante',
			              'anthrop', 'anthropo', 'anti', 'aut', 'auto', 'bar',
			              'baro', 'bathy', 'be', 'bi', 'bibli', 'biblio', 'cent',
			              'centi', 'chrono', 'chron', 'circum', 'co', 'com', 'con',
			              'col', 'cor', 'counter', 'cry', 'cryo', 'de', 'di', 'dys',
			              'eco', 'extra', 'fore', 'hyper', 'in', 'il', 'im', 'ir',
			              'inter', 'intra', 'mal', 'mega', 'meta', 'micro', 'mid', 'mini',
			              'mis', 'non', 'out', 'over', 'post', 'pre', 'pro', 're', 
			              'semi', 'sub', 'super', 'tri', 'ultra', 'un', 'uni'];
			suffixList = ['able', 'ible', 'ac', 'ic', 'acious', 'icious', 
			              'al', 'ant', 'ent', 'ary', 'ate', 'ation', 'cy', 
			              'eer', 'er', 'or', 'escent', 'fic', 'ity', 'fy',
			              'iferous', 'il', 'ile', 'ism', 'ist', 'ive', 'ize',
			              'ise', 'oid', 'ose', 'osis', 'ous', 'tude'];
			prefixList = dojo.map(prefixList, function(item) { return (item + word);});
			suffixList = dojo.map(suffixList, function(item) { return (word + item);});
			
			var j = 0;
			
			while(words[j] != null) {
				
				//Prefixes
				dojo.forEach(
						prefixList,
						function(word) {
							if(words[j].word == word) {
								words[i].hints.push([j,dojo.replace(rules[1], [words[i].word]),words[j].word, 1]);
								words[j].hints.push([i,dojo.replace(rules[2], [words[j].word]),words[i].word, 1]);
							}
						});
				
				//Suffixes
				dojo.forEach(
						suffixList,
						function(word) {
							if(words[j].word == word) {
								words[i].hints.push([j,dojo.replace(rules[1], [words[i].word]),words[j].word, 1]);
								words[j].hints.push([i,dojo.replace(rules[2], [words[j].word]),words[i].word, 1]);
							}
						});
				
				j++;
				
			}
			
			i++;
		}
		
	},
	
	hintsForAddOneLetter: function(words) {
		
		var rules = this.rules;
		
		var i = 0;
		
		while(words[i] != null) {
			
			var j = 0;
			
			while(words[j] != null) {
				
				if(words[j].word.length == words[i].word.length + 1) {
					
					var passes = false;
					for(var k = 0; k < words[j].word.length; k++) {
						if(words[j].word.substr(0,k) 
						+ words[j].word.substr(k+1, words[j].word.length-1) == words[i].word)
						{
							passes = true;
						}
					}
					if(passes) {
						words[i].hints.push([j,dojo.replace(rules[3], [words[i].word]),words[j].word, 2]);
						words[j].hints.push([i,dojo.replace(rules[4], [words[j].word]),words[i].word, 2]);
					}
				}
			j++;
			}
			
			i++;
		}
		
	},
	
	hintsForReplaceOneLetter: function(words) {
		
		var rules = this.rules;
		
		var i = 0;
		
		while(words[i] != null) {
		
			var j = i; //Because matches are 'bi-directional', dont have to repeat scans starting at j=0
			
			while(words[j] != null) {
				
				if( words[j].word.length == words[i].word.length && (words[j].word != words[i].word) ) {
					
					var passes = false;
					for(var k = 0; k < words[j].word.length; k++) {
						if(words[j].word.substr(0,k) + words[j].word.substr(k, words[i].word.length-1) == 
							words[i].word.substr(0,k) + words[i].word.substr(k, words[j].word.length-1)) 
						{
							passes = true;
						}
					}
					if(passes) {
						words[i].hints.push([j,dojo.replace(rules[5], [words[i].word]),words[j].word, 3]);
						words[j].hints.push([i,dojo.replace(rules[5], [words[j].word]),words[i].word, 3]);
					}
				}
				j++;
			}
			
			i++;
		}
		
	},

	
	/*
	 * Current: Filters out words with 'duplicate' letters, also if not word not found in the freq list (words with U value > 1)
	 */
	filterWords: function(strings, frequency, base) {
		
		numOf = {};
		dojo.forEach(
				base,
				function(char) {
					if(numOf[char] == null)
						numOf[char] = 1;
					else
						numOf[char] += 1;
				});
		
		strings = dojo.filter(
					strings,
					dojo.hitch(this, function(word) {
						var passes = true;
						var numOfCur = {};
						
						if(dojo.indexOf(frequency, word) == -1) {
							passes = false;
						} else {
							//Filter out duplicate letters
							dojo.forEach(
									word,
									function(char) {
										if(numOfCur[char] == null) {
											numOfCur[char] = 1;
										}
										else {
											numOfCur[char] += 1;
										}
										if(numOfCur[char] > numOf[char]) {
											passes = false;
											return;
										}
									});
						}
						
						//console.log(word + ": " + passes);
						//Do more filtering here. Possibily a "bad" word list
						
						return passes;

					}),
					this);
		
		//console.log(strings);
		return strings;
		
	},
	
	showDialog: function(title, content) {
		var d = new dijit.Dialog({
			title: title,
			content: content
		});
		d.show();
	}, 
	
	raiseYesNoDialog: function(title, question, callbackFn) {

        var confirmDialog = new dijit.Dialog({ id: 'yesNoDialog', title: title });
        
        // When either button is pressed, kill the dialog and call the callbackFn.
        var commonCallback = function(mouseEvent) {
    	confirmDialog.hide();
    	confirmDialog.destroyRecursive();
                if (mouseEvent.explicitOriginalTarget.id == 'yesButton') {
                        callbackFn(true);
                } else {
                }
        };
        
        var questionDiv = dojo.create('div', { innerHTML: question });
        var yesButton = new dijit.form.Button(
                    { label: 'Yes', id: 'yesButton', onClick: commonCallback });
        var noButton = new dijit.form.Button(
                    { label: 'No', id: 'noButton', onClick: commonCallback });

        confirmDialog.containerNode.appendChild(questionDiv);
        confirmDialog.containerNode.appendChild(yesButton.domNode);
        confirmDialog.containerNode.appendChild(noButton.domNode);

        confirmDialog.show();
	}
	
});