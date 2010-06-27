/* 
 * http://groups.google.com/group/json-schema/web/json-schema-proposal---second-draft
 * 
*/

var SpellBinderSchema = {
    "title":"SpellBinder",
    "description":"This form allows you to create new and edit existing instances of the SpellBinder activity.",
    "type":"object",
    "properties":{
        "name": {
            "type": "string",
            "description": "Enter a brief description of this SpellBinder activity to help you find it later.",
            "title": "Name",
        },
    "models":{
            "title": "Model",
            "description": "Enter one example for each way of adding the affix to a root. The example includes the root, the resulting word, and a brief description of the rule.",
        "type":"array",
            "items": {
            "type":"object",
            "properties":{
                    "from": {
                    "type":"string",
                    "title":"From",
                        "description":"Enter the root word.",
                    },
                    "to":{
                    "type":"string",
                    "title":"To",
                        "description":"Enter the word with the affix added",
                    },
                    "rule":{
                    "type":"string",
                    "title":"Rule",
                        "description":"Enter the rule you applied to get the root from the affix; e.g. \"adding ed\". The text should work in the <b>correct</b> messages below.",
                    },
               }
            },
        },
        "correct":{
            "title": "Correct",
            "description": "Enter several prompts to use after a correct answer; one of them will be randomly chosen. Use {answer} to refer to the correct answer and {rule} to refer to the rule given above.",
            "type": "array",
            "minItems": 1,
            "items": {
                "type": "string",
                "description": "Enter a sentence such as \"Good job! You wrote {answer} by {rule}.\"",
            },
        },
        "wrongFirst": {
            "title": "Wrong first",
            "description": "Enter prompts to use after an incorrect first attempt.",
            "type": "array",
            "minItems": 1,
            "default": [ "That word is not correct. Look at the sample words at the top of the page to help you figure out how to change this root word." ],
            "items": { "type": "string",
                       "description": "Enter a prompt encouraging them to try again." },
        },
        "wrongMiddle": {
            "title": "Wrong middle",
            "description": "Enter prompts to use for the second attempt up to the number of models above.",
            "type": "array",
            "minItems": 1,
            "default": [ "That's still not correct. I have removed one of the models, try again." ],
            "items": { "type": "string",
                       "description": "Enter a prompt saying we have removed one more model." },
        },
        "wrongLast": {
            "title": "Wrong last",
            "description": "Enter prompts to use after all the incorrect models have been removed and the root has been typed in the blank.",
            "type": "array",
            "minItems": 1,
            "default": ["I have typed the first part of the word into the blank. Now add an ending as shown by the last remaining model."],
            "items": { "type": "string",
                       "description:": "Enter a prompt encouraging them to try again with the root word now filled in the blank." },
        },
        "maxAttempts": {
            "title": "Max attempts",
            "description": "Enter the maximum number of attempts you want to allow.",
            "type": "integer",
            "minimum": 3,
            "default": 5,
        },
        "wrongMaxAttempts": {
            "title": "Max Attempts Message",
            "description": "Enter prompts to use after the maximum number of tries. Give the answer using {answer} and {rule}.",
            "type": "array",
            "minItems": 1,
            "default": [ "The correct answer was {answer}." ],
            "items": { "type": "string",
                       "description": "Enter a sentence providing the correct answer." },
        },
        "nextPrompt":{
            "title": "Next prompt",
            "description": "Enter several prompts to use when going to the next exercise.",
            "type": "array",
            "minItems": 1,
            "default": [ "Try this one.", "Now try this.", "Here's another." ],
            "items": { "type": "string",
                       "description": "Enter an sentence encouraging the student to continue."},
        },
        "sentences": {
            "title": "Exercise",
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
                        "description": "Enter the sentence with the root word enclosed in parenthesis and the space indicated with underscores; e.g. I was (delight) ______.",
                    },
                    "answer":{
                    "type":"string",
                    "title":"Answer",
                        "description": "Enter the correct word to fill the blank; e.g. delighted.",
                    },
                    "model":{
                    "type": "integer",
                    "title":"Model",
                        "minimum": 1,
                        "description": "Enter the number of the correct model (see above) to use when answering this question; e.g. 1.",
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
