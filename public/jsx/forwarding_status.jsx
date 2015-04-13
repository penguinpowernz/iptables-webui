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
      <h1>Device Forwarding Status</h1>
      <div id="device_forwarding">
        {devices}
      </div>
    );
  }
});