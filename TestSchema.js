/* 
 * http://groups.google.com/group/json-schema/web/json-schema-proposal---second-draft
 * 
*/

var SpellBinderSchema = {
    "title":"SpellBinder",
    "type":"object",
    "properties":{
        "correct":{
            "title": "Correct",
            "type": "string",
            "description": "Enter several prompts to use after a correct answer. Use {answer} to refer to the correct answer and {rule} to refer to the rule.",
            },
    },
};
