"use strict"
var fs = require("fs")

module.exports = (function() {
  var home = null;

  var init = function(_home) {
    home = _home;
  };

  var all = function(callback) {
    var rules = [];

    fs.readFile(home+"/rules.json", function(err, data){
      callback(err, data ? JSON.parse(data) : null);
    });
  };

  var import = function(path, callback) {
    fs.exists(path, function(exists) {
      if ( exists ) {
        callback(new Error("Path not found: "+path));
        return false;
      }

      // determine if the path given is a directory or file
      if ( false ) {
        importFile(path, function(err, result) {
          callback(err, result);
        });
      } else {
        importDirectory(path, function(err, results) {
          callback(err, results);
        });
      }

    });
  };

  var importFile = function(path, callback) {
    // create the rule

    var rule {
      name: "Imported",
      enabled: false,
      lines: []
    };

    rule.lines = data.split("\n");

    create(rule, function(err) {
      if ( err ) {
        callback(err, {
          imported: [],
          failed: [rule]
        });
      } else {
        callback(null, {imported: [rule]});
      }
    });
  };

  var importDirectory = function(path, callback) {
    // scan for files
    fs.readdir(path, function(err, files) {
      
      rules = files.map(function(file) {
        // read the file
        data = fs.readFileSync(file); // block the read

        // make the rule
        var rule = {
          name: file
          enabled: false,
          valid: false,
          lines: []
        };

        rule.lines = data.split("\n");
        return rule;
      });

      iprules.create(rules, function(err, results) {
        callback(err, {
          imported: results.created,
          failed: results.failed
        });
      });

    });

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