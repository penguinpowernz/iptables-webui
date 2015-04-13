var PortForwardRule = React.createClass({

  getInitialState: function() {
    return {
      in:    '',
      dport: '',
      fport: '',
      dst:   '',
      change: false
    }
  },

  getInitialProps: function() {
    return {lines: [], name: null};
  },

  componentDidMount: function() {
    this.setStateArgs();
  },

  setStateArgs: function() {
    if ( this.props.lines === undefined ) return false;

    this.setState({
      in    : this.props.lines[0].in,
      dport : this.props.lines[0].dport,
      fport : this.props.lines[1].dport,
      dst   : this.props.lines[1].dst
    });
  },

  buildLines: function(callback) {
    var lines = [
      this.buildNATLine(),
      this.buildForwardLine()
    ];

    callback && callback(lines);
  },

  buildNATLine: function() {
    if ( this.props.lines.length == 2 ) {
      var line = this.props.lines[0]; // nat line should always be first
    } else {
      var line = {
        table: 'nat',
        chain: 'PREROUTING',
        target: 'DNAT',
      };
    }

    line.in     = this.state.in;
    line.dport  = this.state.dport;
    line.to_dst = this.state.dst +':'+ this.state.fport;

    return line;
  },

  buildForwardLine: function() {
    if ( this.props.lines.length == 2 ) {
      var line = this.props.lines[1]; // fwd line should always be last
    } else {
      var line = {
        chain: 'FORWARD',
        dst: this.props.data.dst,
        dport: this.props.data.fport,
        states: ['new', 'established', 'related']
      };
    }

    line.dport = this.state.fport;
    line.dst   = this.state.dst;

    return line;
  },

  buildRule: function(callback) {
    var rule = {name: this.generateName()};

    this.buildLines(function(lines) {
      rule.lines = lines;
      callback(rule);
    }.bind(this));
  },

  handleChange: function(event) {
    this.setState({changed: true});
    this.props[event.target.name] = event.target.value;
  },

  save: function(event) {
    this.buildRule(function(rule) {
      if ( rule.name != this.props.key ) rule.oldName = this.props.key;

      this.props.onSave(rule, function(err, saved) {
        if ( err ) {
          // TODO: something
        } else if ( saved ) {
          this.setState({changed: false});
        }
      }.bind(this));
    }.bind(this));
  },

  // generates a name from the current settings
  generateName: function() {
    return 'pf_'+['in', 'dport', 'dst', 'fport'].map(function(key) {
      return this.state[key];
    }).join("-");
  },

  render: function() {
    return (
      <div className="port_forward">
        <div className="in">
          <input name="in" value={this.state.in} onChange={this.handleChange} />
          <p>Interface</p>
        </div>
        <div className="dport">
          <input name="dport" value={this.state.dport} onChange={this.handleChange} />
          <p>External Port</p>
        </div>
        <div className="dst">
          <input name="dst" value={this.state.dst} onChange={this.handleChange} />
          <p>Internal Host</p>
        </div>
        <div className="fport">
          <input name="fport" value={this.state.fport} onChange={this.handleChange} />
          <p>Internal Port</p>
        </div>
        <div className="controls">
          <button onClick={this.test}>Test</button>
          <button onClick={this.save}>Save</button>
          <button onClick={this.delete}>Delete</button>
        </div>
      </div>
    );
  }
});
