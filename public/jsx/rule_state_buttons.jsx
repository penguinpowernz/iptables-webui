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