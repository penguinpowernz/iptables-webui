"use strict"
var fs     = require("fs"),
    crypto = require("crypto"),
    exec   = require("child_process").exec;

var RuleParser = {
  parse: function(rule) {
    var fm = this.firstMatch;
    return {
      chain:    fm(/-A ([A-Z]+)/, line),
      state:    fm(/--state ([A-Z,]+)/, line),
      protocol: fm(/-p (\w+)/, line),
      dport:    fm(/--dport (\d+)/, line),
      sport:    fm(/--sport (\d+)/, line),
      target:   fm(/-j (\w+)/, line),
      src:      fm(/--src ([\.0-9]+)/, line),
      dst:      fm(/--dst ([\.0-9]+)/, line),
      in:       fm(/-o ([a-z0-9]+)/, line),
      out:      fm(/-i ([a-z0-9]+)/, line)
    };
  },
  firstMatch: function(regexp, string) {
    return regexp.exec(string)[1];
  },
  render: function(rule) {
    var args = [];

    if (!rule.chain) rule.chain = 'INPUT';

    if (rule.chain) args = args.concat([rule.action, rule.chain]);
    if (rule.protocol) args = args.concat(["-p", rule.protocol]);
    if (rule.src) args = args.concat(["--src", rule.src]);
    if (rule.dst) args = args.concat(["--dst", rule.dst]);
    if (rule.sport) args = args.concat(["--sport", rule.sport]);
    if (rule.dport) args = args.concat(["--dport", rule.dport]);
    if (rule.in) args = args.concat(["-i", rule.in]);
    if (rule.out) args = args.concat(["-o", rule.out]);
    if (rule.target) args = args.concat(["-j", rule.target]);

    return args.join(" ");
  }
};

module.exports = (function() {
  var home   = null,
      parser = RulesParser,
      db     = { rules: {}, enabled: [], hashes: {rules: "", enabled: ""} };

  var init = function(_home) {
    home = _home;

    loadDB();

    setInterval(function() {
      saveDB();
    }, 5000);
  };

  var hash = function(string) {
    return crypto.createHash("md5").update(string).digest("hex");
  };

  var saveDB = function() {
    saveRules();
    saveEnabledRules();
  };

  var saveRules = function() {
    var string   = JSON.stringify(db.rules),
        new_hash = hash(string);

    if ( new_hash != db.hashes.rules ) {
      fs.writeFile(home+"/rules.json", string, function(err) {
        if (err) {
          console.error("ERROR: "+err.message);
        } else {
          db.hashes.rules = new_hash;
        }
      });
    }
  };

  var saveEnabledRules = function() {
    var string   = JSON.stringify(db.enabled),
        new_hash = hash(string);

    if ( new_hash != db.hashes.enabled ) {
      fs.writeFile(home+"/enabled.json", string, function(err) {
        if (err) {
          console.error("ERROR: "+err.message);
        } else {
          db.hashes.enabled = new_hash;
        }
      });
    }
  };

  var loadDB = function() {
    loadRules();
    loadEnabledRules();
  };

  var loadEnabledRules = function() {
    fs.readFile(home+"/enabled.json", function(err, data){
      if ( err ) {
        console.err(err.message);
      } else {
        db.enabled = JSON.parse(data);
        db.hashes.enabled = hash(data);
      }
    });
  };

  var loadRules = function() {
    fs.readFile(home+"/rules.json", function(err, data){
      if ( err ) {
        console.err(err.message);
      } else {
        db.rules = JSON.parse(data);
        db.hashes.rules = hash(data);
      }
    });
  };

  var all = function(callback) {
    callback(null, rules);
  };

  var importRules = function(path, callback) {
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
    if ( typeof(rules) != "Array" ) rules = [rules];

    var results = { created: [], failed: [] };

    // this is blocking
    rules.forEach(function(rule) {
      iprules.test(rule, function(err) {
        if ( err ) {
          results.failed.push({rule: rule, message: err.message});
        } else {
          rule.valid          = true;
          db.rules[rule.name] = rule;
          results.created.push(rule);
        }
      });
    });

    var err = results.created == 0 ? new Error("Failed to create any rules") : null;
    callback(null, results);
  };

  var test = function(rule, callback) {
    data = generate(rule, function(err, data) {
      exec("echo "+data+" | iptables-restore --test", function(err, stdout, stderr) {
        if ( err ) {
          err.stderr = stderr;
          callback(err);
        }

        callback(null);
      });
    });
  };
  
  var enable = function(name, callback) {
    // check that the rule is not already enabled
    if ( db.enabled.indexOf(name) == -1 ) {
      db.enabled.push(name);
    }

    callback(null);
  };

  var disable = function(name, callback) {
    // check if the rule is enabled before renoving
    if ( (index = db.enabled.indexOf(name)) == -1 ) {
      db.enabled.splice(index, 1);
    }

    callback(null);
  };

  var generate = function(rules, callback) {
    if ( typeof(rules) != "Array") rules = [rules];

    data = ["*filter"];

    rules.forEach(function(rule) {
      data.push("# "+rule.name);
      data.push(rule.lines.join("\n"));
    });

    callback(null, data.join("\n"));
  };

  var reload = function(callback) {
    generate(db.rules, function(err, data) {
      exec("echo \""+data+"\" | iptables-restore --test", function(err, stdout, stdin) {
        if ( err ) {
          callback(err);
          return false;
        }

        fs.writeFile("/etc/iptables.rules", data, function(err) {
          if ( err ) {
            callback(err);
            return false;
          }

          exec("iptables-restore < /etc/iptables.rules", function(err, stdout, stderr) {
            if ( err ) {
              callback(err);
              return false;
            }

            callback(null, true);
          });
        });
      })
    });
  };

  return {
    init: init,
    parser: parser,
    all: all,
    import: import,
    enable: enable,
    disable: disable,
    test: test,
    reload: reload
  }
}());