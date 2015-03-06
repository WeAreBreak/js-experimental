/**
 * Function Processor for the CellScript to JS Compiler.
 */

var SELF = '___self___',
    PRIVATE = '___private___';

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "private";
    },

    process: function(leaf, state) {
        state.print("this." + SELF + ".private(" + PRIVATE + ")");
    }

};