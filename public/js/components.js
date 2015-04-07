var Button = React.createClass({displayName: "Button",
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
      React.createElement("button", {className: classes, onClick: this.onClick}, 
        this.props.text
      )
    );
  }
});