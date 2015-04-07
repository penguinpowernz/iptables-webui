var Button = React.createClass({
  onClick: function(event) {
    if ( !this.props.disabled ) this.props.onClick(event);
  },

  render: function() {
    var style = "btn-"+this.props.style || 'default';
    if ( this.props.disabled ) style = 'btn-default';

    var classes = [
      "btn",
      style
    ].join(" ");

    return (
      <button className={classes} onClick={this.onClick}>
        {this.props.text}
      </button>
    );
  }
});