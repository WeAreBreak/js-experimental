/**
 * Class Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils,
    ExtensionManager = new parserUtils.ExtensionManager();

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.moduleKeyword,

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(state) {
        var result = ExtensionManager.inject("canProcess", this, state, utils);
        if(result.hasResult) return result.value;
        return validators.isModule(state);
    },

    process: function(state) {
        state.leaf();

        state.item.type = "module";
        state.next(); // Skip the module marker.

        var result = ExtensionManager.inject("process", this, state, utils);
        if(result.hasResult) return result.value;

        utils.block(state, "function", "module");
    }

};