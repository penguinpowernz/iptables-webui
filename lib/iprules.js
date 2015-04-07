"use strict"
var fs     = require("fs"),
    crypto = require("crypto"),
    exec   = require("child_process").exec;

var IPTables = {
  /**
   * Loads the argument text into iptables using
   * the iptables-restore command.  Must be
   * syntactically correct 
   *
   * @param data - text formatted into an iptables-restore file
   * @callback err
   */
  load: function(data, callback) {};

  /**
   * Does a test run using the iptables-restore command
   * to test the given text 
   *
   * @param data - text formatted into an iptables-restore file
   * @callback err
   */
  test: function(data, callback) {};
};

var RuleParser = {
  parse: function(rule) {
    var fm = this.firstMatch;
    return {
      chain:    fm(/-A ([A-Z]+)/      , line),
      protocol: fm(/-p (\w+)/         , line),
      dport:    fm(/--dport (\d+)/    , line),
      sport:    fm(/--sport (\d+)/    , line),
      target:   fm(/-j (\w+)/         , line),
      src:      fm(/--src ([\.0-9]+)/ , line),
      dst:      fm(/--dst ([\.0-9]+)/ , line),
      in:       fm(/-o ([a-z0-9]+)/   , line),
      out:      fm(/-i ([a-z0-9]+)/   , line),
      table:    fm(/-t (\w+)/         , line),
      states:   fm(/--state ([A-Z,]+)/ , line).split(','),
      to_dst:   fm(/--to-destination (\S+)/, line)
    };
  },
  firstMatch: function(regexp, string) {
    return regexp.exec(string)[1];
  },
  render: function(rule) {
    var args = [];

    // set some defaults
    if (!rule.chain)    rule.chain = 'INPUT';
    if (!rule.protocol) rule.protocol = 'tcp';

    // build the args up
    if (rule.table)     args = args.contact(['-t',            , rule.table]);
    if (rule.chain)     args = args.concat([rule.action       , rule.chain]);
    if (rule.protocol)  args = args.concat(["-p"              , rule.protocol]);
    if (rule.src)       args = args.concat(["--src"           , rule.src]);
    if (rule.dst)       args = args.concat(["--dst"           , rule.dst]);
    if (rule.sport)     args = args.concat(["--sport"         , rule.sport]);
    if (rule.dport)     args = args.concat(["--dport"         , rule.dport]);
    if (rule.in)        args = args.concat(["-i"              , rule.in]);
    if (rule.out)       args = args.concat(["-o"              , rule.out]);
    if (rule.target)    args = args.concat(["-j"              , rule.target]);
    if (rule.to_dst)    args = args.concat(["--to-destination", rule.to_dst]);
    if (rule.states)    args = args.concat(["-m state --state", rule.states.map(function(s) { return s.toUpperCase(); }).join(",")])

    return args.join(" ");
  }
};

module.exports = (function() {
  var home   = null,
      parser = RuleParser,
      db     = {
        rules: [],
        hash: {},
        index: {
          by_name: {

          }
        }
      };

  var init = function(_home) {
    home = _home;

    loadDB();

    setInterval(function() {
      saveDB();
    }, 5000);
  };

  // hash a string
  var hash = function(string) {
    return crypto.createHash("md5").update(string).digest("hex");
  };

  var saveDB = function() {
    saveRules();
  };

  var saveRules = function() {
    var string   = JSON.stringify(db.rules),
        new_hash = hash(string);

    if ( new_hash != db.hash ) {
      fs.writeFile(home+"/rules.json", string, function(err) {
        if (err) {
          console.error("ERROR: "+err.message);
        } else {
          db.hash = new_hash;
        }
      });
    }
  };

  var loadDB = function() {
    loadRules();
    buildIndex();
  };

  var loadRules = function() {
    console.log(home+"/rules.json")
    fs.readFile(home+"/rules.json", function(err, data){
      if ( err ) {
        console.error(err.message);
      } else {
        db.rules = JSON.parse(data);
        db.hash = hash(data); // hash the data so we can auto-save when needed
      }
    });
  };

  var buildIndex = function() {
    db.rules.forEach(function(rule, index) {
      db.index.by_name[rule.name] = index;
    });
  };

  var get = function(name) {
    var index;
    if ( typeof(index = db.index.by_name[name]) !== undefined ) {
      return db.rules[index];
    } else {
      return null;
    }
  };

  /**
   * Returns an array of all rules
   *
   * @callback err
   */
  var all = function(callback) {
    callback(null, db.rules);
  };

  /**
   * Find rules by name or glob pattern
   * 
   * @param pattern - the name or pattern to find
   * @callback rules - array of rules
   */
  var find = function(pattern, callback) {
    var rule;
    var wildcard = pattern.indexOf("*");

    if ( wildcard == -1 ) {
      if ( (rule = get(pattern)) != null) {
        callback(rule);
      } else {
        callback([]);
      }

      return;
    }

    var start    = (wildcard == 0) ? true : false,
        end      = (wildcard == pattern.length) ? true : false,
        pattern  = pattern.replace("*", ''),
        rules    = [];

console.log("iprules FIND: "+pattern+" : "+wildcard+" : "+start+" : "+end);

    // check if there was a wildcard specified
    if ( wildcard == -1 ) {
      if ( db.rules[name] !== undefined ) {
        callback([db.rules[name]]); // simply search for the name
      } else {
        callback([]); // nothing found
      }
    } else { // there was a wildcard
      Object.keys(db.rules).forEach(function(name) {

        if ( start ) {
          if (name.indexOf(pattern) == 0) rules.push(db.rules[name]);
        } else if ( end ) {
          var pos = name.length - pattern.length; // determine the start of the pattern
          if (name.indexOf(pattern) == pos ) rules.push(db.rules[name]);
        } else {
          // TODO: add pattern in the middle support
        }
        
      });
    }

console.log("iprules FOUND: "+rules.length);
console.log(rules);

    callback(rules);
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

    var rule = {
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
          name: file,
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

  /**
   * Create the given array of rules in the database
   *
   * Each rule is compiled and tested, with the results added to each
   * rule and saved in the database regardless.  The 'valid' field is
   * true if the test has passed and can be used to reload iptables.
   *
   * @param rules - array of rules
   * @callback err
   * @callback rules - array of rules with test data added
   */
  var create = function(rules, callback) {
    rules.forEach(function(rule) {
      if ( typeof rule.enabled == undefined ) {
        rule.enabled = false;
      }
    });

    test(rules, function(err, rules, failed) {
      rules.forEach(function(rule) {
        db.rules[rule.name] = rule;
      });

      callback(err, rules);
    });
  };

  var update = function() {

  };

  var destroy = function(name, callback) {
    db.rules.forEach(function(rule, index) {
      if ( rule.name == name ) delete db.rules[index];
    });
  };

  var test = function(rules, callback) {
    var failed  = 0;

    rules = rules.map(function(rule) {
      testRule(rule, function(err, test_lines) {
        rule.valid      = err == null;
        rule.test_lines = test_lines;
        if ( err ) {
          failed++;
          rule.error = err.message;
          if ( rule.enabled ) rule.enabled = false; // disable the rule so it doesn't run
        } else {
          rule.error = false;
        }
      });

      return rule;
    });

    callback(null, rules, failed);
  };

  var testRule = function(rule, callback) {
    generateTmpRules([rule], function(err, filename, lines) {
      if (err) {
        callback(err);
      } else {
        testFile(filename, function(err) {
          callback(err, lines);
        });
      }
    });
  };
  
  /**
   * Does a dry run of iptables-restore to test the given file
   * 
   * @param filename - the file to test
   * @callback err
   */
  var testFile = function(filename, callback) {
    exec("cat \""+filename+"\" | iptables-restore --test", function(err, stdout, stderr) {
      // delete the file (to prevent info leakage)
      fs.exists(filename, function(err) {
        fs.unlink(filename);
      });

      callback(err);
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

  /*
   * Compiles given rules into lines
   * 
   * @param rules
   * @callback err
   * @callback lines - array of lines to make a compiled rule file
   */
  var compile = function(rules, callback) {
    var lines = ["*filter"];

    rules.forEach(function(rule) {
      lines.push("# "+rule.name);
      
      rule.lines.forEach(function(line) {
        if ( typeof(line) == "string" ) {
          lines.push(line);
        } else if ( typeof(line) == "object" ) {
          line = RuleParser.render(line);
          lines.push(line);
        }
      });

      lines.push(rule.lines.join("\n"));
    });

    lines.push("#end");

    callback(null, lines);
  };

  /*
   * Generates a temporary file using the given rules
   *
   * @param rules - array of rules
   * @callback err
   * @callback filename - the name of the file that was generated
   * @callback lines - array of lines contained in the file
   */
  var generateTmpRules = function(rules, callback) {
    var filename = "tmp/test.rules";
    
    compile(rules, function(err, lines) {
      fs.writeFile(filename, lines.join("\n"), function(err) {
        callback(err, filename, lines);
      });
    });

  };

  var writeRules = function(lines, callback) {
    var filename = "/etc/iptables.rules"

    fs.writeFile(filename, lines.join("\n"), function(err) {
      callback(err, filename);
    });
  };

  var restoreRules = function(filename, callback) {
    exec("iptables-restore < /etc/iptables.rules", function(err, stdout, stderr) {
      callback(err);
    });
  };

  /**
   * Reload enabled rules into IP Tables
   */
  var reload = function(callback) {
    var rules = [];

    db.rules.forEach(function(rule) {
      if ( rule.enabled && rule.valid ) rules.push(rule);
    });

    generateTmpRules(rules, function(err, filename, lines) {
      testFile(filename, function(err) {
        if ( err ) {
          callback(err);
        } else {
          
          // write the rules to file
          writeRules(lines, function(err, filename) {
            if ( err ) {
              callback(err);
            } else {
              
              // run iptables restore to load the rules
              restoreRules(filename, function(err) {
                callback(err);
              });
            }
          });
        }
      });
    });
  };

  return {
    init: init,
    parser: parser,
    all: all,
    importRules: importRules,
    enable: enable,
    disable: disable,
    create: create,
    update: update,
    test: test,
    reload: reload,
    find: find,
    destroy: destroy
  }
}());