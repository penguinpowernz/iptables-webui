var RulesPage = React.createClass({displayName: "RulesPage",
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
      React.createElement("div", {className: "ruleBox"}, 
        React.createElement("h1", null, "Rules"), 
        React.createElement(Rule, {name: "", lines: [], enabled: false, new: true}), 
        React.createElement(RulesList, {rules: this.state.rules})
      )
    );
  }
});

var RulesList = React.createClass({displayName: "RulesList",
  renderNodes: function() {
    return this.props.rules.map(function (rule) {            
      return (
        React.createElement(Rule, {name: rule.name, lines: rule.lines, enabled: rule.enabled})
      );
    });
  },
  
  render: function() {
    return (
      React.createElement("div", {className: "rule_list"}, 
        this.renderNodes
      )
    );
  }
});


var Rule = React.createClass({displayName: "Rule",
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
      React.createElement("div", {className: classes}, 
        React.createElement("div", null, 
          React.createElement("input", {className: "name", placeholder: "Name of the rule...", onKeyUp: this.formatName, onChange: this.handleChange, value: this.props.name}), 
          React.createElement("textarea", {placeholder: lines_placeholder, className: "lines", onChange: this.handleChange}, lines)
        ), 

        React.createElement("div", {className: "pull-right"}, 
          React.createElement(RuleStateButtons, {name: this.props.name, onChangeState: this.changeState}), 
          React.createElement(Button, {text: "Save", style: "success", onClick: this.handleSave, disabled: !this.state.changed}), 
          React.createElement(Button, {text: "Test", style: "warning", onClick: this.handleTest, disabled: this.props.new}), 
          React.createElement(Button, {text: "Delete", style: "danger", onClick: this.handleDelete, disabled: this.props.new})
        )
      )
    );
  }
});

var RuleStateButtons = React.createClass({displayName: "RuleStateButtons",
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
      React.createElement("div", {className: "btn-group", "data-toggle": "buttons", id: id}, 
        React.createElement("label", {onClick: this.enable, className: enabledButtonClasses}, 
          React.createElement("input", {type: "radio", name: "options", id: "option2", autocomplete: "off"}), " Enabled"
        ), 
        React.createElement("label", {onClick: this.disable, className: disabledButtonClasses}, 
          React.createElement("input", {type: "radio", name: "options", id: "option3", autocomplete: "off"}), " Disabled"
        )
      )
    );
  }
});

React.render(
  React.createElement(RulesPage, null),
  $('.page.rules')[0]
);