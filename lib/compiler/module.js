/**
 * Function Processor for the CellScript to JS Compiler.
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// public interface ///
module.exports = {

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(leaf) {
        return leaf.type === "module";
    },

    process: function(leaf, state) {
        state.println("(function(){");
        state.pushContext(leaf);
        state.levelDown();

        state.print("const");
        state.meaningfulSpace();
        state.print("___private___");
        state.print(" = ");
        state.println("Symbol();");

        leaf.printedPrivateScope = true;

        ExtensionManager.inject("before-body", this, leaf, state);

        var result = ExtensionManager.inject("body", this, leaf, state);
            if(!result.hasResult) {
                state.processor.level(leaf.items, state);
            }

        ExtensionManager.inject("after-body", this, leaf, state);

        state.levelUp();
        state.popContext();
        state.println("})();");
    }

};