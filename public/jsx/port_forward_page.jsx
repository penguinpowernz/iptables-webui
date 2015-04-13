var PortForwardPage = React.createClass({
  getInitialState: function() {
    return {rules: []};
  },

  componentDidMount: function() {
    this.loadFromServer();
  },

  loadFromServer: function(callback) {
    Ajax.get('/rules/pf_*').then(function(rules) {
      this.setState({rules: rules});
      callback && callback(rules);
    }.bind(this));
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

  handleTest: function(rule, callback) {

  },

  handleDelete: function(rule, callback) {

  },

  renderNodes: function() {
    return this.state.rules.map(function(rule) {
      return (
        <PortForwardRule lines={rule.lines} name={rule.name} key={rule.name} onSave={this.handleSave} onTest={this.handleTest} onDelete={this.handleDelete} />
      );
    });
  },

  render: function() {

    return (
      <div>
        <h3>Port Forwards</h3>
        <table className="table table-hover table-striped">
          <thead>
            <tr>
              <th>Interface</th>
              <th>External Port</th>
              <th>Internal Host</th>
              <th>Internal Port</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <PortForwardRule />
            {this.renderNodes()}
          </tbody>
        </table>
      </div>
    );
  }
});


React.render(
  <PortForwardPage uri="http://localhost"/>,
  $(".page.port_forwards")[0]
);