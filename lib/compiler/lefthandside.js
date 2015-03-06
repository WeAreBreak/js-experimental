/**
 * Function Processor for the CellScript to JS Compiler.
 */

var processUntil = function(state, leaf, startIndex, endIndex, nonMonadicUntil) {
    for(var i = startIndex; i < endIndex; ++i) {
        var item = leaf.items[i];

        if(item.monadic && nonMonadicUntil < i) {
            state.print('(');
            for (var j = 0; j <= i; ++j) {
                state.processor.leaf(leaf.items[j], state);
            }

            if(item.monadicStrict) {
                state.print(' instanceof');
                state.meaningfulSpace();
                state.print('Object');
            }

            state.print(' ? ');
            if(hasMonadicAfter(leaf, i)) {
                processUntil(state, leaf, i + 1, leaf.items.length, i);
            }
            else {
                processUntil(state, leaf, 0, leaf.items.length, i);
            }
            state.print(' : ');
            state.print('null)');
            break;
        }
        else if(nonMonadicUntil != -1) state.processor.leaf(item, state);
    }
};

var hasMonadic = function(leaf) {
    for(var i = 0; i < leaf.items.length; ++i)
        if(leaf.items[i].monadic) return true;
    return false;
};

var hasMonadicAfter = function(leaf, index) {
    for(var i = index + 1; i < leaf.items.length; ++i)
        if(leaf.items[i].monadic) return true;
    return false;
};

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "lefthandside";
    },

    process: function(leaf, state) {
        if(hasMonadic(leaf)) {
            processUntil(state, leaf, 0, leaf.items.length, -1);
        }
        else
            for(var i = 0; i < leaf.items.length; ++i)
                state.processor.leaf(leaf.items[i], state);
    },

    forceOverride: true

};