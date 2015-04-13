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