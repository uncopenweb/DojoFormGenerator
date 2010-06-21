var WordBuilderData = {
    'instructions': "Sometimes, words have spelling patterns that help us read them.  Spelling patterns can appear at the beginning, middle, or end of a word. For example, the letters, un, at the beginning of words unlike, unusual, and undone help us read those words. If you remove un from those words, you are left with a real word such as like, usual, or done.  Another example of a spelling pattern at the beginning of a word is re, which appears in the words replay, refill, and replace. If you remove the letters re you are left with real words like play, fill, and place.<br/><br/>Try this word building game using the two spelling patterns, un and re.",
    'examples': "Here’s how you play.  Click on one of these two spelling patterns and one of the words below to complete the following sentences. With the prefixes 'un' and 're' and root words 'comfortable', 'necessary', 'commendation', 'searcher', 'minded', 'expected', 'friendly', 'reasonable', 'cycle', and 'appear'.<br/><br/>I am done with my drink, so I will _______ the can.<br/>The missing word in this sentence is recycle, and you make that word by combining 're' with the word, 'cycle'.<br/>Try another one:<br/>When they thought about it, they decided her request was __________.<br/>The missing word in this sentence is unreasonable. It is built by adding 'un' to the word, 'reasonable'.",
    'parts': [ { 'heading': 'Prefix',
                 'description': 'These can appear at the beginning of a word.',
                 'words': [ 'un', 're' ] },
               { 'heading': 'Root',
                 'description': 'These words can be modified with prefixes',
                 'words': [ 'comfortable', 'important', 'commendation', 'searcher',
                            'minded', 'expected', 'friendly', 'reasonable', 'cycle', 'appear' ]
               } ],
    'correct': [ "Good. You combined {parts} to make {word}." ],
    'wrong': [ "That choice doesn't make sense in this sentence." ],
    'partial': [ "That is partially correct. Focus on the remaining choices." ],
    'nextPrompt': [ 'Try this one.',
                    'Now try this.',
                    "Here's another",
                  ],
    'sentences': [
        { 'sentence': "The same themes  _________________ throughout the book.",
          'answer': [ 're', 'appear' ] },

        { 'sentence': "These shoes look nice, but I bet they’re really ________________.",
          'answer': [ 'un', 'comfortable' ] },

        { 'sentence': "Her teacher was glad to write her a  ___________ for the scholarship.",
          'answer': [ 're', 'commendation' ] },

        { 'sentence': "They spent so much time on _____ details that they had little time left for the actual project.",
          'answer': [ 'un', 'important' ] },

        { 'sentence': "Her harsh comment was ________, as they usually got along really well.",
          'answer': [ 'un', 'expected' ] },

        { 'sentence': "People thought Mark was _______ at first, but it turned out that he was just shy.",
          'answer': [ 'un', 'friendly' ] },

        { 'sentence': "Marie Curie was a brilliant __________ who made many important discoveries.",
          'answer': [ 're', 'searcher' ] },

        { 'sentence': "They had to be ______________ several times to be quiet during assembly.",
          'answer': [ 're', 'minded' ] },
    ]

};