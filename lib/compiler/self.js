/**
 * Function Processor for the CellScript to JS Compiler.
 */

var SELF = '___self___';

/// public interface ///
module.exports = {

    canProcess: function(leaf) {
        return leaf.type === "self";
    },

    process: function(leaf, state) {
        state.print("this." + SELF);
    }

};