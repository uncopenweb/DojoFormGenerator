// A hack to insert simple line number tracing into javascript code included with dojo.require
// Add a URL parameter trace to invoke line-by-line printing on the console or
// trace=silent to collect the messages in an array, you can retrieve them with DbG()
DbG =
(function () {
    // get the url parameters
    var parms = dojo.queryToObject(window.location.search.substring(1));
    var flag = parms.trace;
    if (typeof(flag) == 'undefined') {
        // bail if not requested
        return null;
    }
    console.log('tracing', flag);

    // setup the tracing function
    var func; // return this below
    if (flag == 'silent') {
        var trace = [];
        func = function(file, line, context) {
            if (typeof(file) == 'undefined') {
                return trace;
            }
            trace.push(file + ' ' + line + ' ' + context);
        }
    } else {
        func = function(file, line, context) {
            console.log(file, line, context);
        }
    }
    // hook the function dojo uses to fetch the code
    var _getText = dojo._getText;
    function myGetText(fname) {
        // call dojo._getText to get its output
        var txt = _getText.apply(this, arguments);

        // only match Javascript files
        var name = fname.match(/(\w+)\.js$/);
        if (name == null) {
            return txt; // bail this isn't js
        }
        name = name[1]; // get the base name
        // rewrite the text insert calls to our trace function at the beginning of code blocks
        // we work line-by-line. Of course this doesn't work with all coding styles. 
        // Don't do that.
        txt = dojo.map(txt.split('\n'), function(line, i) {
            // only work on lines ending with {, this excludes some useful cases but avoids
            // getting triggered inside strings. If you want a block traced, put a newline after {
            if(!/\{\s*$/.test(line)) return line;
            // try to pick up some useful context from the line
            var context = line.match(/[a-zA-Z_][a-zA-Z_0-9. ]+/) || '';
            return line.replace(/(\)|\Welse)(\s*\{)\s*$/g,
                                '$1$2 DbG("'+name+'",'+(i+1)+',"'+context+'");');
        }).join('\n');
        return txt;
    }
    // replace their function with mine
    dojo._getText = myGetText;
    // return my trace function
    return func;
})();
