/* 
 * http://groups.google.com/group/json-schema/web/json-schema-proposal---second-draft
 * 
*/

var SpellBinderSchema = {
    "title":"SpellBinder",
    "type":"object",
    "properties":{
	"models":{
            "title": "Models",
            "description": "Enter several models illustrating the root, the result of adding the affix, and a description of the rule you used",
	    "type":"array",
            "items": {
	        "type":"object",
	        "properties":{
    	            "from": {
    		        "type":"string",
    		        "title":"From"
    	            },
    	            "to":{
    		        "type":"string",
    		        "title":"To"
    	            },
    	            "rule":{
    		        "type":"string",
                        "format":"text",
    		        "title":"Rule",
    	            },
   	        }
            },
        },
        "correct":{
            "title": "Correct",
            "description": "Enter several prompts to use after a correct answer. Use {answer} to refer to the correct answer and {rule} to refer to the rule.",
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string",
            },
        },
        "wrong":{
            "title": "Wrong",
            "description": "Enter several prompts to use after an incorrect answer.",
            "type": "array",
            "minItems": 1,
            "items": { "type": "string" },
        },
        "nextPrompt":{
            "title": "Next prompt",
            "description": "Enter several prompts to use when going to the next exercise.",
            "type": "array",
            "minItems": 1,
            "items": { "type": "string" },
        },
        "sentences": {
            "title": "Sentences",
            "description": "Enter sentences with (root) ______ showing the root word to use and the place to put it in the sentence. Also provide the expected answer and the number of the model to be used.",
            "type": "array",
            "minItems": 1,
            "items": {
	        "type":"object",
                "minItems": 1,
	        "properties":{
    	            "sentence":{
    		        "type":"string",
                        "format": "text",
    		        "title":"Sentence",
    	            },
    	            "answer":{
    		        "type":"string",
    		        "title":"Answer"
    	            },
    	            "model":{
    		        "type": "integer",
    		        "title":"model",
                        "minimum": 1,
    	            },
    	        },
            },
        },
        "instructions":{
            "title": "Instructions",
            "description": "Enter the initial instructions for the activity.",
            "type": "string",
            "format": "html",
        },
        "examples":{
            "title": "Examples",
            "description": "Enter text giving examples of the activity",
            "type": "string",
            "format": "html",
        },
    },
};
