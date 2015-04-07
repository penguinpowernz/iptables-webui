var ForwardingStatus = React.createClass({displayName: "ForwardingStatus",
  getInitialState: function() {
    return {forwarding: {}};
  },

  componentDidMount: function() {
    this.getStatus();
    setInterval(function() {
      this.getStatus();
    }.bind(this), 10000);
  },

  getStatus: function() {
    Ajax.get("/status").then(function(status) {
      this.setState(status);
    }.bind(this));
  },

  render: function() {
    var devices = Object.keys(this.state.forwarding).map(function(device) {
      var state     = this.state.forwarding[device] ? "On" : "Off";
      var className = ["device", state.toLowerCase()].join(' ');

      return (
        React.createElement("div", {className: className}, 
          React.createElement("p", null, device), 
          React.createElement("p", {className: "state"}, state)
        )
      );
    }.bind(this));

    return (
      React.createElement("div", {className: "devices"}, 
        devices
      )
    );
  }
});

React.render(
  React.createElement(ForwardingStatus, null),
  document.getElementById('device-forwarding')
);

var IPTablesList = React.createClass({displayName: "IPTablesList",
  getInitialState: function() {
    return {list: ""}
  },

  componentDidMount: function() {
    this.getList();
    setInterval(function() {
      this.getList();
    }.bind(this), 10000);
  },

  getList: function() {
    Ajax.get('/iptables/list').then(function(json) {
      this.setState({list: json.list});
    }.bind(this));
  },

  render: function() {
    return (
      React.createElement("pre", null, 
        this.state.list
      )
    );
  }
});

React.render(
  React.createElement(IPTablesList, null),
  document.getElementById('iptables-list')
);

var SourceRules = React.createClass({displayName: "SourceRules",
  getInitialState: function() {
    return {rules: []}
  },

  componentDidMount: function() {
    this.getRules();
    setInterval(function() {
      this.getRules();
    }.bind(this), 10000);
  },

  getRules: function() {
    Ajax.get('/rules/enabled').then(function(rules) {
      this.setState({rules: rules});
    }.bind(this));
  },

  render: function() {
    var rules = rules.map(function(rule) {

      if ( typeof(rule.definition) == "string" ) {
        return (
          React.createElement("tr", null, 
            React.createElement("td", null, rule.name), 
            React.createElement("td", null, rule.definition)
          )
        );
      }
      return (
        React.createElement("tr", null, 
          React.createElement("td", null, rule.name), 
          React.createElement("td", null, rule.name), 
          React.createElement("td", null, rule.name)
        )
      );
    });

    return (
      React.createElement("table", {className: "table table-striped table-hover"}, 
        React.createElement("thead", null), 
        React.createElement("tbody", null, 
          rules
        )
      )
    );
  }
});