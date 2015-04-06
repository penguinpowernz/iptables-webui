var RulesBox = React.createClass({
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
      <div className="ruleBox">
        <h1>Simple Rules</h1>
        <RulesList data={this.state.data}/>
      </div>
    );
  }

});

var RulesList = React.createClass({
  render: function() {
    var ruleNodes = this.props.data.map(function (rule) {            
      return (
        <Rule name={rule.name} enabled={rule.enabled} />
      );
    });

    return (
      <div className="ruleList">
        {ruleNodes}
      </div>
    );
  }
});


var Rule = React.createClass({
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
      <div className={classes}>
        <div>
          <RuleStateButtons name={this.props.name} onChangeState={this.changeState} />
          <h2 className="ruleName">{this.props.name}</h2>
        </div>
      </div>
    );
  }
});

var RuleStateButtons = React.createClass({
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
  <RulesBox url="rules"/>,
  $('.page.rules')[0]
);