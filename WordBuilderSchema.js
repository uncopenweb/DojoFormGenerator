var WordBuilderSchema = {
    "title":"WordBuilder",
    "description":"This form allows you to create and edit Word Builder activities.",
    "type":"object",
    "properties":{
        "name": {
            "type": "string",
            "description": "Enter a short name for this Word Builder activity to help you find it later.",
            "title": "Name",
        },
        "description": {
            "title": "Description",
            "type": "string",
            "description":"Optionally enter a longer description of the activity aimed at making it easy to find.",
            "optional": true,
        },
        
        "parts": {
            "type": "array",
            "minItems": 2,
            "title": "Group of morphemes",
            "Description": "Enter 2 or 3 groups of morphemes. For example a list of prefixes, roots, and suffixes.",
            "items": {
                "type": "object",
                "properties": {
                    "heading": { 
                        "type": "string",
                        "title": "Heading",
                        "description": "Enter a short heading for the list of morphemes; i.e.  Prefix.",
                    },
                    "description": { 
                        "type": "string",
                        "title": "Description",
                        "description": "Enter a longer description of the morphemes. This will appear as a tooltip.",
                    },
                    "words": { 
                        "type": "array",
                        "title": "Morphemes",
                        "description": "Enter a list of morphemes.",
                        "minItems": 1,
                        "items": { "type": "string",
                                   "description": "Enter a morpheme",
                                 },
                    }
                }
            }
        },
        "correct": { 
            "type": "array",
            "title": "Correct",
            "description":"Enter several prompts to use after a correct answer; one of them will be randomly chosen. Use {answer} to refer to the correct answer and {parts} to refer to the morphemes that were used.",
            "items": { 
                "type": "string",
                "description": "Enter a sentence such as \"Good job! You combined {parts} to make {answer}.\"" },
        },
        "wrong": { 
            "type": "array",
            "title": "Wrong",
            "description":"Enter prompts to use after completely incorrect responses.",
            "items": { "type": "string",
                       "description": "Enter a sentence,",
                     },
        },
        "partial": { 
            "type": "array",
            "title": "Partially correct",
            "description": "Enter prompts to be used for partially correct responses.",
            "items": { 
                "type": "string",
                "description": "Enter a sentence."
            },
                   },
        "nextPrompt": { 
            "type": "array",
            "title": "Next prompt",
            "description": "Enter several prompts to use when going to the next exercise.",
            "items": { 
                "type": "string",
                "description": "Enter an sentence encouraging the student to continue."
            },
        },
        "sentences": { 
            "type": "array",
            "title": "Exercise",
            "description": "Enter sentences with ______ showing the place to put a word in the sentence. Also provide the list of morphemes that made up that answer.",
            "items": { 
                "type": "object",
                "properties": {
                    "sentence": { 
                        "type": "string",
                        "title": "Sentence",
                        "description": "Enter the sentence with a ___ showing where to insert the word.",
                    },
                    "answer": { 
                        "type": "array",
                        "title": "Answer morphemes",
                        "description": "Enter the morphemes that make up the answer in order.",
                        "items": { 
                            "type": "string",
                            "description": "Enter a single morpheme.",
                        },
                    }
                }
            }
        },
        "instructions": { 
            "type": "string",
            "description": "Enter the initial instructions for the activity.",
            "format": "html",
        },
        "examples":{ 
            "type": "string",
            "description": "Enter text giving examples of the activity",
            "format": "html",
        },
    }
};
