
var RulesList = React.createClass({
  renderNodes: function() {
    return this.props.rules.map(function (rule) {            
      return (
        <Rule name={rule.name} lines={rule.lines} enabled={rule.enabled} />
      );
    });
  },
  
  render: function() {
    return (
      <div className="rule_list">
        {this.renderNodes}
      </div>
    );
  }
});