/**
 * Expression Statement Processor for the InqScript Parser
 */

var parserUtils = require("js-parser-utils"),
    validators = parserUtils.validators;

/// public interface ///
module.exports = {

    methods: {
        canProcess: function (state) {
            if (state.hasScope('class', true)) return false;
        }
    }

};