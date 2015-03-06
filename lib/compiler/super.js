/**
 * Function Processor for the CellScript to JS Compiler.
 */

var SELF = '___self___';

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "super";
    },

    process: function(leaf, state) {
        if(!state.context || state.context.type !== "class") throw "Unexpected super call"; //TODO: Move this validation to parser.
        state.print(state.context.name + ".super_");
    }

};