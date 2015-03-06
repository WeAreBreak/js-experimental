/**
 * Function Processor for the CellScript to JS Compiler.
 */

var parserUtils = require("js-parser-utils"),
    ExtensionManager = new parserUtils.ExtensionManager(),
    printedPrivateScope = false;

/// public interface ///
module.exports = {

    include: function(extensionDefinition) {
        ExtensionManager.include(extensionDefinition)
    },

    canProcess: function(leaf) {
        return leaf.type === "class";
    },

    process: function(leaf, state) {
        if(leaf.privateItems.length) {
            if((!state.context && !printedPrivateScope) || (state.context && !state.context.printedPrivateScope)) {
                state.print("const");
                state.meaningfulSpace();
                state.print("___private___");
                state.print(" = ");
                state.println("Symbol();");

                if(state.context) state.context.printedPrivateScope = true;
                else printedPrivateScope = true;
            }
        }

        state.pushContext(leaf);

        state.print("const");
        state.meaningfulSpace();
        state.print(leaf.name);
        state.print(" = ");
        state.print("function");
        if(leaf.constructor) state.print("(" + leaf.constructor.parameters.map(function(item) { return item.name }).join(', ') + ") ");
        else state.print("()");
        state.println("{");
        state.levelDown();
        state.println("require('inq-oo').Instance(this);");

        if(leaf.constructor) {
            var param;
            for (var i = 0; i < leaf.constructor.parameters.length; ++i) {
                param = leaf.constructor.parameters[i];

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
                for (var j = 0; j < leaf.constructor.parameters.length; ++j) {
                    param = leaf.constructor.parameters[j];
                    if (param.type !== undefined) {
                        state.println("if(typeof " + param.name + " !== '" + param.type + "') throw 'Invalid value specified for argument " + param.name + ".';");
                    }
                }
            }

            state.processor.level(leaf.constructor.items, state);
            state.println("");
        }

        state.print("return");
        state.meaningfulSpace();

        if(leaf.privateItems.length) {
            state.print("require('inq-oo').ClassProxy(this, ");
            state.print("___private___, ");
            state.println("{");
            state.levelDown();
                state.processor.level(leaf.privateItems, state);
            state.levelUp();
            state.println("});");
        }
        else {
            state.println("require('inq-oo').ClassProxy(this);");
        }

        state.levelUp();

        state.println("};");

        if(leaf.superName) {
            state.print("require('inq-oo').Inherits(");
            state.print(leaf.name);
            state.print(", ");
            state.print(leaf.superName);
            state.println(");");
        }

        var result = ExtensionManager.inject("body", this, leaf, state);
        if(!result.hasResult) {
            state.processor.level(leaf.items, state);
        }

        state.println("");

        if(leaf.staticItems.length) {
            state.processor.level(leaf.staticItems, state);
            state.println("");
        }

        state.popContext();
    }

};