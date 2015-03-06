/**
 * This Expression Processor for the CellScript Parser
 */

/// constants ///
var constants = {
    thisKeyword: "this",
    superKeyword: "super",
    selfKeyword: "self",
    privateKeyword: "private"
};

/// methods ///
var validators = {

    isThis: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.thisKeyword;
    },

    isSuper: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.superKeyword;
    },

    isSelf: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.selfKeyword;
    },

    isPrivate: function(state) {
        return state.token && state.token.type === "keyword" && state.token.data === constants.privateKeyword;
    }

};

/// public interface ///
module.exports = {

    forceOverride: true,

    canProcess: function(state) {
        return validators.isThis(state) || validators.isSuper(state) || validators.isSelf(state) || validators.isPrivate(state);
    },

    process: function(state) {
        state.leaf();
        state.item.type = state.token.data;

        state.next();
        return true;
    }

};