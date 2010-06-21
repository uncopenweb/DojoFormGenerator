var TextTilesSchema = {
	"title":"TextTiles",
	"description":"This form allows you to create and edit TextTiles activities.", 
	"type":"object",
	"properties":{
		"name": {
			"type":"string",
			"description":"Enter a short name for this activity that helps you find it later.",
			"title":"Name"
		},
		"description": {
			"title":"Description",
			"type":"string",
			"description":"Optionally enter a longer description of the activity aimed at making it easy to find.",
			"optional": true
		},
		"lessonWord": {
			"title":"Lesson Word",
			"type":"string",
			"description":"Enter the base word or collection of letters for this lesson"
		},
		"sideBarTitle":{
			"title":"Side Bar Title",
			"type":"string",
			"description":"Enter the title you want displayed for the side bar text holding area"
		},
		"points": {
			"type":"object",
			"title":"Points for guessed words",
			"description":"Enter values for the different scoring types",
			"properties": {
				"basePoint": {
					"type":"string",
					"title":"Base Point Value",
					"description":"Enter the value rewarded for guessing a word without using a hint"
				},
				"hintPoint": {
					"type":"string",
					"title":"Hint Point Value",
					"description":"Enter the value rewarded for guessing a word after using a hint"
				},
				"extraPoint": {
					"type":"string",
					"title":"Extra Point Value",
					"description":"Enter the value rewarded for guessing a long word"
				}
			}
		},
		"correct": {
			"type":"array",
			"title":"Correct Text",
            "description":"Enter several prompts to use after a correct answer; one of them will be randomly chosen. Use {0} as a placeholder for spelled word.",
            "items": { 
                "type": "string",
                "description": "Enter a sentence such as \"Good job! You spelled {0}.\", where '{0}' is the place holder for the spelled word" 
             }
        },
		"incorrect": { 
            "type": "array",
            "title": "Incorrect Text",
            "description":"Enter prompts to use after completely incorrect responses.",
            "items": { "type": "string",
                       "description": "Enter a sentence,"
                     }
        },
        "alreadyGuessed": {
        	"type":"array",
        	"title":"Already Guessed Text",
        	"description":"Enter prompts to use after a response is submitted that has already used.",
        	"items": { "type":"string",
        				"description":"Enter a sentence,"
        			}
        },
        "hintText": {
        	"type":"object",
        	"title":"Hint Text",
        	"description":"Enter prompt templates to use when a hint is requested",
        	"properties": { 
        		"addprefix": {
        				"type":"string",
        				"title":"'Add a prefix' text",
        				"description":"Enter a sentence such as \"Try adding a prefix to '{0}'\", where {0} is the place holder for the hint word"
        			},
        		"addsuffix": {
        				"type":"string",
        				"title":"'Add a suffix' text",
        				"description":"Enter a sentence such as \"Try adding a prefix to '{0}'\", where {0} is the place holder for the hint word"
        			},
        		"removeprefix": {
        				"type":"string",
        				"title":"'Remove a prefix' text",
        				"description":"Enter a sentence such as \"Try adding a prefix to '{0}'\", where {0} is the place holder for the hint word"
        			},
        		"removesuffix": {
        				"type":"string",
        				"title":"'Remove a prefix' text",
        				"description":"Enter a sentence such as \"Try adding a prefix to '{0}'\", where {0} is the place holder for the hint word"
        			},
        		"addletter": {
        				"type":"string",
        				"title":"'Add a letter' text",
        				"description":"Enter a sentence such as \"Try adding a prefix to '{0}'\", where {0} is the place holder for the hint word"
        			},
        		"removeletter": {
        				"type":"string",
        				"title":"'Remove a letter' text",
        				"description":"Enter a sentence such as \"Try adding a prefix to '{0}'\", where {0} is the place holder for the hint word"
        			},
        		"replaceletter": {
        				"type":"string",
        				"title":"'Replace a letter' text",
        				"description":"Enter a sentence such as \"Try adding a prefix to '{0}'\", where {0} is the place holder for the hint word"
        			},
        		"jumbleHintText": {
        				"type":"string",
        				"title":"'Jumble Hint Text'",
        				"description":"Enter a sentence to use when the hint displayed is a jumbled version of an already guessed word"
        			}
        				
        	}
        },
		"instructions": {
			"type":"string",
			"description":"Enter the initial instructions for the activity.",
            "format": "html"
        },
        "example":{ 
            "type": "string",
            "description": "Enter text giving examples of the activity",
            "format": "html"
        },
        "errorMessage": {
        	"title":"Error Message",
        	"type": "string",
        	"description": "Enter a message to displayed when a error occurs inside the game."
        }
	}
}