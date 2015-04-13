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