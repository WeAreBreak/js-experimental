/**
 * Compiler Module Definition for the Experimental Features.
 */

module.exports = function compilerModuleDefinition() {
    this.language = "EXPERIMENTAL FEATURES";

    this.tokens = {
        'identifier': require('./lib/tokenizer/identifier'),
        'punctuation': require('./lib/tokenizer/punctuation')
    };

    this.parsers = {
        'class': require('./lib/parser/class'),
        'module': require('./lib/parser/module'),
        'method': require('./lib/parser/method'),
        'expression.js': require('./lib/parser/expression')
    };

    this.expressionParsers = {
        'this': require('./lib/expressionParser/this'),
        'lefthandside': require('./lib/expressionParser/lefthandside')
    };

    this.compilers = {
        'self': require('./lib/compiler/self'),
        'private': require('./lib/compiler/private'),
        'super': require('./lib/compiler/super'),
        'class': require('./lib/compiler/class'),
        'module': require('./lib/compiler/module'),
        'method': require('./lib/compiler/method'),
        'lefthandside': require('./lib/compiler/lefthandside')
    };
};