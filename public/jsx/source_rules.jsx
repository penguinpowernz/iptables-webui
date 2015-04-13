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