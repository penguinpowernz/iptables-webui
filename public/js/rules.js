var RulesBox = React.createClass({displayName: "RulesBox",
  getInitialState: function() {
    return {data: []};
  },

  componentDidMount: function() {
    this.loadRulesFromServer();
    // setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },

  loadRulesFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      success: function(data) {
        console.log(data)
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  render: function() {
    return (
      React.createElement("div", {className: "ruleBox"}, 
        React.createElement("h1", null, "Simple Rules"), 
        React.createElement(RulesList, {data: this.state.data})
      )
    );
  }

});

var RulesList = React.createClass({displayName: "RulesList",
  render: function() {
    var ruleNodes = this.props.data.map(function (rule) {            
      return (
        React.createElement(Rule, {name: rule.name, enabled: rule.enabled})
      );
    });

    return (
      React.createElement("div", {className: "ruleList"}, 
        ruleNodes
      )
    );
  }
});


var Rule = React.createClass({displayName: "Rule",
  getInitialState: function() {
    return {enabled: this.props.enabled};
  },

  changeState: function(state) {
    var action = (state.enabled) ? "enable" : "disable";
    $.getJSON("/rules/"+this.props.name+"/"+action).success(function() {
      this.state.enabled = state.enabled;
    }).fail(function() {
      alert("Failed to "+action+" the rule :(");
    });
  },

  render: function() {
    var classes = [
      "rule",
      this.props.enabled ? "enabled" : "disabled"
    ].join(" ");



    return (
      React.createElement("div", {className: classes}, 
        React.createElement("div", null, 
          React.createElement(RuleStateButtons, {name: this.props.name, onChangeState: this.changeState}), 
          React.createElement("h2", {className: "ruleName"}, this.props.name)
        )
      )
    );
  }
});

var RuleStateButtons = React.createClass({displayName: "RuleStateButtons",
  enable: function() {
    this.props.onChangeState({enabled: true});
  },

  disable: function() {
    this.props.onChangeState({enabled: false});
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
  React.createElement(RulesBox, {url: "rules"}),
  $('.page.rules')[0]
);