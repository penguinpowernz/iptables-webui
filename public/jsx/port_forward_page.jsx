var PortForwardPage = React.createClass({
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
        <PortForwardRule lines={rule.lines} name={rule.name} key={rule.name} onSave={this.handleSave} />
      );
    });

    return (
      <div>
        <h3>Port Forwards</h3>
        <PortForwardRule />
        {pfs}
      </div>
    );
  }
});


React.render(
  <PortForwardPage uri="http://localhost"/>,
  $(".page.port_forwards")[0]
);