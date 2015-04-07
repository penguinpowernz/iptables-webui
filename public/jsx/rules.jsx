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


var Rule = React.createClass({
  getInitialState: function() {
    return {enabled: this.props.enabled, changed: false, lines: []};
  },

  changeState: function(enabled) {
    this.state.enabled = enabled;
  },

  formatName: function(event) {
    event.target.value = event.target.value.replace(/[^\w-_]/, '')
      .replace(/[-]+/, '-')
      .replace(/[_]+/, '_');
  },

  handleChange: function(event) {
    this.setState({changed: true});
  },

  handleSave: function(event) {},
  handleDelete: function(event) {},
  handleTest: function(event) {},

  render: function() {
    var classes = [
      "rule well",
      this.props.enabled ? "enabled" : "disabled"
    ].join(" ");

    var lines_placeholder = "Lines of the rule go here, e.g:\n{ chain: 'input', dport: '22', action: 'accept', states: ['new'] }\n-A INPUT --dport 22 -j ACCEPT -m state --state NEW";

    var lines = this.props.lines.map(function(line) {
      if ( typeof(line) === 'string' ) {
        return line;
      } else {
        return JSON.stringify(line);
      }
    }).join("\n");

    return (
      <div className={classes}>
        <div>
          <input className="name" placeholder="Name of the rule..." onKeyUp={this.formatName} onChange={this.handleChange} value={this.props.name} />
          <textarea placeholder={lines_placeholder} className="lines" onChange={this.handleChange}>{lines}</textarea>
        </div>

        <div className="pull-right">
          <RuleStateButtons name={this.props.name} onChangeState={this.changeState} />
          <Button text='Save' style="success" onClick={this.handleSave} disabled={!this.state.changed} />
          <Button text='Test' style="warning" onClick={this.handleTest} disabled={this.props.new} />
          <Button text='Delete' style="danger" onClick={this.handleDelete} disabled={this.props.new} />
        </div>
      </div>
    );
  }
});

var RuleStateButtons = React.createClass({
  enable: function() {
    this.props.onChangeState(true);
  },

  disable: function() {
    this.props.onChangeState(false);
  },

  render: function() {
    var id = this.props.name+"-buttons",

    enabledButtonClasses = "btn btn-primary"
    disabledButtonClasses = "btn btn-primary"

    if ( this.props.enabled ) {
      enabledButtonClasses+= " active";
    } else {
      disabledButtonClasses+= " active";
    }

    return (
      <div className="btn-group" data-toggle="buttons" id={id}>
        <label onClick={this.enable} className={enabledButtonClasses}>
          <input type="radio" name="options" id="option2" autocomplete="off"/> Enabled
        </label>
        <label onClick={this.disable} className={disabledButtonClasses}>
          <input type="radio" name="options" id="option3" autocomplete="off"/> Disabled
        </label>
      </div>
    );
  }
});

React.render(
  <RulesPage />,
  $('.page.rules')[0]
);