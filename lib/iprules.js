"use strict"
var fs = require("fs")

module.exports = (function() {
  var home = null;

  var init = function(_home) {
    home = _home;
  };

  var all = function(callback) {
    // TODO: return all rules
  };

  var import = function(path, callback) {
    // TODO: import rules from filesystem
  };

  var create = function(rules, callback) {
    // TODO: create a rule
  };

  var test = function(rule, callback) {
    // TODO: test a passes iptables-restore --test
  };
  
  var enable = function(callback) {
    // TODO: enable a rule
  };

  var disable = function(callback) {
    // TODO: disable a rule
  };

  var generate = function(callback) {
    // TODO: generate all the enabled rules
  };

  var reload = function(callback) {
    // TODO: reload iptables with the generated rules
  };

  return {
    init: init,
    all: all,
    import: import,
    enable: enable,
    disable: disable,
    test: test,
    reload: reload
  };
}());