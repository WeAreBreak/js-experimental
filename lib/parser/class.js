/**
 * Class Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils,
    ExtensionManager = new parserUtils.ExtensionManager();

/// methods ///
utils = utils.extend({

    name: function(state) {
        if(state.token && state.token.type == "identifier") {
            if(state.item.name) {
                state.error("Unexpected token ILLEGAL.");
                return false;
            }
            state.item.name = state.token.data;
            state.lexicalEnvironment().record().createImmutableBinding(state.item.name);
            state.next();
        }
        else return state.error(constants.unexpectedToken);
    },

    extends_: function(state) {
        if(state.token && state.token.type == "keyword" && state.token.data == "extends") {
            state.next();
            return true;
        }

        return false;
    },

    superName: function(state) {
        if(state.token && state.token.type == "identifier") {
            state.item.superName = state.token.data;
            state.next();
        }
        else return state.error(constants.unexpectedToken);
    }

});

/// public interface ///
module.exports = {

    tokenType: "keyword/"+constants.classKeyword,

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(state) {
        var result = ExtensionManager.inject("canProcess", this, state, utils);
        if(result.hasResult) return result.value;
        return validators.isClass(state);
    },

    process: function(state) {
        state.leaf();

        state.item.type = "class";
        state.item.staticItems = [];
        state.item.privateItems = [];
        state.item.constructor = false;
        state.next(); // Skip the class marker.

        var result = ExtensionManager.inject("process", this, state, utils);
        if(result.hasResult) return result.value;

        utils.name(state);
        if(utils.extends_(state)) {
            utils.superName(state);
        }

        state.pushContext(state.item);
        utils.block(state, "function", "class");
        state.popContext();
    }

};