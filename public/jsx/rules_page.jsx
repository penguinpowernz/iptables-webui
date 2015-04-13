var RulesPage = React.createClass({
  getInitialState: function() {
    return {rules: []};
  },

  componentDidMount: function() {
    this.loadRulesFromServer();
    // setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },

  loadRulesFromServer: function() {
    Ajax.get('/rules').then(function(rules) {
      this.setState({rules: rules});
    }.bind(this));
  },

  render: function() {
    return (
      <div className="ruleBox">
        <h1>Rules</h1>
        <Rule name="" lines={[]} enabled={false} new={true}/>
        <RulesList rules={this.state.rules}/>
      </div>
    );
  }
});

React.render(
  <RulesPage />,
  $('.page.rules')[0]
);