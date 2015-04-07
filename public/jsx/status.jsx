var ForwardingStatus = React.createClass({
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
        <div className={className}>
          <p>{device}</p>
          <p className="state">{state}</p>
        </div>
      );
    }.bind(this));

    return (
      <div className="devices">
        {devices}
      </div>
    );
  }
});

React.render(
  <ForwardingStatus />,
  document.getElementById('device-forwarding')
);

var IPTablesList = React.createClass({
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
      <pre>
        {this.state.list}
      </pre>
    );
  }
});

React.render(
  <IPTablesList />,
  document.getElementById('iptables-list')
);

var SourceRules = React.createClass({
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
          <tr>
            <td>{rule.name}</td>
            <td>{rule.definition}</td>
          </tr>
        );
      }
      return (
        <tr>
          <td>{rule.name}</td>
          <td>{rule.name}</td>
          <td>{rule.name}</td>
        </tr>
      );
    });

    return (
      <table className="table table-striped table-hover">
        <thead></thead>
        <tbody>
          {rules}
        </tbody>
      </table>
    );
  }
});