/**
 * Method Declaration Processor for the CellScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators,
    constants = parserUtils.constants,
    utils = parserUtils.utils,
    ExtensionManager = new parserUtils.ExtensionManager();

/// methods ///
validators = validators.extend({

    isMethod: function(state) {
        var lookahead = state.lookahead();
        return state.token.type == "identifier" && lookahead && lookahead.type == "(";
    },

    isPrivate: function(state) {
        return state.token && state.token.type == "keyword" && state.token.data == "private";
    },

    isStatic: function(state) {
        return state.token && state.token.type == "identifier" && state.token.data == "static";
    },

    isPublic: function(state) {
        return state.token && state.token.type == "identifier" && state.token.data == "public";
    },

    isEllipse: function(state) {
        return state.token && state.token.type == "...";
    }

});

utils = utils.extend({

    modifier: function(state) {
        if(state.token && (state.token.type == "identifier" || state.token.type == "keyword")) {
            if(state.token.data == "private" || state.token.data == "public" || state.token.data == "static") {
                state.item.modifier = state.token.data;
                state.next();
                return true;
            }
        }

        return false;
    },

    generator: function(state) {
        if(validators.isGeneratorSign(state)) {
            if(state.item.generator) {
                state.error("Unexpected token ILLEGAL.");
                return false;
            }
            state.item.generator = true;
            state.next();
        }
    },

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
        else {
            return state.error(constants.unexpectedToken);
        }
    },

    parameters: function(state) {
        if(!validators.isSegmentStart(state)) return state.error("Missing function parameters.");
        state.next(); //Skip segment start.

        var parameter, wasRest = false;
        state.item.parameters = [];
        while(state.token && (validators.isIdentifier(state) || validators.isEllipse(state)) && !wasRest) {
            parameter = { type: "parameter" };
            if(state.token.type == "...") {
                parameter.rest = true;
                state.next();
                if(!validators.isIdentifier(state)) return state.error("Missing rest parameter name.");
                wasRest = true;
            }

            parameter.name = state.token.data;
            state.item.parameters.push(parameter);
            state.next();

            if(validators.isParameterSeparator(state)) {
                state.next();
            }
            else if (validators.isSegmentEnd(state)) break;
            else {
                if (validators.isEqualSign(state)) {
                    state.next(); //Skip equal sign.

                    parameter.defaultValueExpression = {};
                    state.prepareLeaf(parameter.defaultValueExpression);
                    if(!state.expressionProcessor.token(state, ["conditional", "lefthandside"])) return state.error("Unexpected token ILLEGAL.");
                    parameter.type = state.item.subtype;
                    state.clearLeaf();
                }
                else if (validators.isTypeSpecifierSign(state)) {
                    state.next(); //Skip type specifier sign.
                    if (validators.isIdentifier(state)) {
                        parameter.type = state.token.data;
                    }
                    else return state.error("Unexpected token ILLEGAL.");

                    state.next(); //Skip processed default value or type.
                }
                else {
                    return state.error("Unexpected token ILLEGAL.");
                }

                if (validators.isParameterSeparator(state)) {
                    state.next();
                }
                else if (validators.isSegmentEnd(state)) break;
                else return state.error("Unexpected token ILLEGAL.");
            }
        }

        if(!validators.isSegmentEnd(state)) return state.error("Unexpected token ILLEGAL.");
        state.next(); //Skip segment end.

        return true;
    }


});

/// public interface ///
module.exports = {

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(state) {
        var result = ExtensionManager.inject("canProcess", this, state, utils);
        if(result.hasResult) return result.value;
        return validators.isMethod(state) || validators.isStatic(state) || validators.isPublic(state) || validators.isPrivate(state);
    },

    process: function(state) {
        if(!state.hasScope("class", true)) return state.error("Unexpected method definition.");

        if(state.token.data == "constructor") {
            if(state.context.constructor) return state.error("Unexpected constructor definition.");
            state.prepareLeaf(state.context.constructor = { constructor: true });
        }
        else if(state.token.data == "static") {
            var leaf = {};
            state.prepareLeaf(leaf);
            state.context.staticItems.push(leaf);
        }
        else if(state.token.data == "private") {
            leaf = {};
            state.prepareLeaf(leaf);
            state.context.privateItems.push(leaf);
        }

        state.leaf();

        state.item.type = "method";

        var result = ExtensionManager.inject("process", this, state, utils);
        if (result.hasResult) return result.value;

        //utils.generator(state);

        utils.modifier(state);
        utils.name(state);
        utils.parameters(state);

        if (state.item.generator) utils.block(state, "function", "generator");
        else if (state.item.constructor) utils.block(state, "function", "constructor");
        else utils.block(state, "function");

        if(state.item.constructor) {
            state.clearLeaf();
        }
    }

};