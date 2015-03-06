/**
 * Method Processor for the CellScript to JS Compiler.
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager();

/// public interface ///
module.exports = {

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(leaf) {
        return leaf.type === "method";
    },

    process: function(leaf, state) {
        if(leaf.modifier == "static") state.print(state.context.name + '.' + leaf.name);
        else if(leaf.modifier == "private") state.print(leaf.name);
        else state.print(state.context.name + '.prototype.' + leaf.name);
        if(leaf.modifier == "private") state.print(": ");
        else state.print(" = ");
        state.print("function");
        if (leaf.generator) state.print("* ");
        state.print("(" + leaf.parameters.map(function (item) {
            return item.name
        }).join(', ') + ") ");
        state.println("{");
        state.levelDown();

        ExtensionManager.inject("before-body", this, leaf, state);

        var result = ExtensionManager.inject("body", this, leaf, state);
            if(!result.hasResult) {
                var param;
                for (var i = 0; i < leaf.parameters.length; ++i) {
                    param = leaf.parameters[i];

                    if(param.rest) {
                        state.print(param.name);
                        state.print(' = ');
                        state.print('Array.prototype.slice.call(arguments, ');
                        state.print(i);
                        state.println(");");

                        if (param.defaultValueExpression) {
                            state.print("if(!" + param.name);
                            state.print(".length) ");
                            state.print(param.name);
                            state.print(" = ");
                            state.processor.leaf(param.defaultValueExpression, state);
                            state.println(";");
                        }
                    }
                    else if (param.defaultValueExpression) {
                        state.print("if(" + param.name);
                        state.print(" === ");
                        state.print("undefined) ");
                        state.print(param.name);
                        state.print(" = ");
                        state.processor.leaf(param.defaultValueExpression, state);
                        state.println(";");
                    }
                }

                if (state.preprocessor.flag("typechecks")) {
                    for (var j = 0; j < leaf.parameters.length; ++j) {
                        param = leaf.parameters[j];
                        if (param.type !== undefined) {
                            state.println("if(typeof " + param.name + " !== '" + param.type + "') throw 'Invalid value specified for argument " + param.name + ".';");
                        }
                    }
                }

                state.processor.level(leaf.items, state);
            }

        ExtensionManager.inject("after-body", this, leaf, state);

        state.levelUp();

        if(leaf.modifier == "private") state.println("},"); //TODO: Do not print too many ',' signs.
        else state.println("}");
        state.println("");
    }

};