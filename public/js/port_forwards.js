var PortForward = React.createClass({displayName: "PortForward",

  getInitialState: function() {
    return {
      in:    '',
      dport: '',
      fport: '',
      dst:   '',
      change: false
    }
  },

  getInitialProps: function() {
    return {lines: [], name: null};
  },

  componentDidMount: function() {
    this.setStateArgs();
  },

  setStateArgs: function() {
    if ( this.props.lines === undefined ) return false;

    this.setState({
      in    : this.props.lines[0].in,
      dport : this.props.lines[0].dport,
      fport : this.props.lines[1].dport,
      dst   : this.props.lines[1].dst
    });
  },

  buildLines: function(callback) {
    var lines = [
      this.buildNATLine(),
      this.buildForwardLine()
    ];

    callback && callback(lines);
  },

  buildNATLine: function() {
    if ( this.props.lines.length == 2 ) {
      var line = this.props.lines[0]; // nat line should always be first
    } else {
      var line = {
        table: 'nat',
        chain: 'PREROUTING',
        target: 'DNAT',
      };
    }

    line.in     = this.state.in;
    line.dport  = this.state.dport;
    line.to_dst = this.state.dst +':'+ this.state.fport;

    return line;
  },

  buildForwardLine: function() {
    if ( this.props.lines.length == 2 ) {
      var line = this.props.lines[1]; // fwd line should always be last
    } else {
      var line = {
        chain: 'FORWARD',
        dst: this.props.data.dst,
        dport: this.props.data.fport,
        states: ['new', 'established', 'related']
      };
    }

    line.dport = this.state.fport;
    line.dst   = this.state.dst;

    return line;
  },

  buildRule: function(callback) {
    var rule = {name: this.generateName()};

    this.buildLines(function(lines) {
      rule.lines = lines;
      callback(rule);
    }.bind(this));
  },

  handleChange: function(event) {
    this.setState({changed: true});
    this.props[event.target.name] = event.target.value;
  },

  save: function(event) {
    this.buildRule(function(rule) {
      if ( rule.name != this.props.key ) rule.oldName = this.props.key;

      this.props.onSave(rule, function(err, saved) {
        if ( err ) {
          // TODO: something
        } else if ( saved ) {
          this.setState({changed: false});
        }
      }.bind(this));
    }.bind(this));
  },

  // generates a name from the current settings
  generateName: function() {
    return 'pf_'+['in', 'dport', 'dst', 'fport'].map(function(key) {
      return this.state[key];
    }).join("-");
  },

  render: function() {
    return (
      React.createElement("div", {className: "port_forward"}, 
        React.createElement("div", {className: "in"}, 
          React.createElement("input", {name: "in", value: this.state.in, onChange: this.handleChange}), 
          React.createElement("p", null, "Interface")
        ), 
        React.createElement("div", {className: "dport"}, 
          React.createElement("input", {name: "dport", value: this.state.dport, onChange: this.handleChange}), 
          React.createElement("p", null, "External Port")
        ), 
        React.createElement("div", {className: "dst"}, 
          React.createElement("input", {name: "dst", value: this.state.dst, onChange: this.handleChange}), 
          React.createElement("p", null, "Internal Host")
        ), 
        React.createElement("div", {className: "fport"}, 
          React.createElement("input", {name: "fport", value: this.state.fport, onChange: this.handleChange}), 
          React.createElement("p", null, "Internal Port")
        ), 
        React.createElement("div", {className: "controls"}, 
          React.createElement("button", {onClick: this.test}, "Test"), 
          React.createElement("button", {onClick: this.save}, "Save"), 
          React.createElement("button", {onClick: this.delete}, "Delete")
        )
      )
    );
  }
});


var PortForwardPage = React.createClass({displayName: "PortForwardPage",
  getInitialState: function() {
    return {rules: []};
  },

  componentDidMount: function() {
    this.loadFromServer();
  },

  loadFromServer: function(callback) {
    Ajax.get('/rules/pf_*').then(function(rules) {
      this.setState({rules: rules})
    });
  },

  // handles saves coming from the PortForward views
  handleSave: function(rule, callback) {
    if ( rule.oldName ) {
      ajax.delete('/rules/' + rule.oldName);
      ajax.post('/rules/'+ rule.name, {rule: rule}).then(function() {
        callback(null, true);
      });
    } else {
      ajax.put('/rules/'+rule.name, {rule: rule}).then(function() {
        callback(null, true);
      });
    }
  },

  render: function() {
    var pfs = this.state.rules.map(function(rule) {
      return (
        React.createElement(PortForward, {lines: rule.lines, name: rule.name, key: rule.name, onSave: this.handleSave})
      );
    });

    return (
      React.createElement("div", null, 
        pfs, 
        React.createElement(PortForward, null)
      )
    );
  }
});


React.render(
  React.createElement(PortForwardPage, {uri: "http://localhost"}),
  $(".page.port_forwards")[0]
);