var IPTablesList = React.createClass({
  getInitialState: function() {
    return {list: ""}
  },

  componentDidMount: function() {
    this.getList();
    setInterval(function() {
      this.getList();
    }.bind(this), 10000);
  },

  getList: function() {
    Ajax.get('/iptables/list').then(function(json) {
      this.setState({list: json.list});
    }.bind(this));
  },

  render: function() {
    return (
      <pre>
        {this.state.list}
      </pre>
    );
  }
});