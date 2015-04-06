var PortForward = React.createClass({

  getInitialState: function() {
    return {
      in:    '',
      dport: '',
      fport: '',
      dst:   ''
    }
  },

  getInitialProps: function() {
    return {rules: {}};
  },

  componentDidMount: function() {
    var newState = {};

    if ( typeof(this.props.rules) != "undefined" ) {

      if ( typeof(this.props.rules.nat) != "undefined" ) {
        newState.in    = this.props.rules.nat.in;
        newState.dport = this.props.rules.nat.dport;
      }

      if ( typeof(this.props.rules.forward) != "undefined" ) {
        newState.fport = this.props.rules.forward.dport;
        newState.dst   = this.props.rules.forward.dst;
      }
    }

    this.setState(newState);
  },

  buildRules: function(callback) {

    if ( Object.keys(this.props.rules).length == 0 ) {
      // nat rule
      this.props.rules.nat = {
        table: 'nat',
        chain: 'PREROUTING',
        target: 'DNAT',
      };

      // fwd rule
      this.props.rules.forward = {
        chain: 'FORWARD',
        dst: this.props.data.dst,
        dport: this.props.data.fport,
        states: ['new', 'established', 'related']
      };
    }

    this.props.rules.nat.in        = this.state.in;
    this.props.rules.nat.dport     = this.state.dport;
    this.props.rules.nat.to_dst    = this.state.dst +':'+ this.state.fport;
    this.props.rules.forward.dst   = this.state.dst;
    this.props.rules.forward.dport = this.state.fport;

    callback && callback(rules);
  },

  handleChange: function(event) {
    this.setState({changed: true});
    this.props[event.target.name] = event.target.value;
  },

  save: function(event) {
    this.buildRules(function(rules) {
      var key  = this.generateKey(),
          data = {rules: this.props.rules, key: key};

      if ( key != this.props.key ) data.oldKey = this.props.key;

      this.props.onSave(data, function(err, saved) {
        if ( err ) {

        } else if ( saved ) {
          this.setState({changed: false});
        }
      }.bind(this));
    }.bind(this));
  },

  generateKey: function() {
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


var PortForwardPage = React.createClass({
  getInitialState: function() {
    return {port_forwards: []};
  },

  componentDidMount: function() {
    this.loadFromServer(function(pfs) {
      this.setState({port_forwards: pfs});
    });
  },

  loadFromServer: function(callback) {
    $.getJSON(this.props.uri+'/rules/pf_*', function(rules) {
      var pfs = [];
      rules.forEach(function(rule) {
        var group = rule.split("_"),
            section = group.pop();

        group = group.join('_');
        
        if ( !pfs[group] ) {
          pfs[group] = {
            key: group,
            rules: {},
          }
        }

        pfs[group].rules[section] = rule;
      });

      callback(pfs);
    });
  },

  handleSave: function(data, callback) {
    if ( data.oldKey ) {
      ajax.delete('/rules/' + data.oldKey+'_nat');
      ajax.delete('/rules/' + data.oldKey+'_forward');
      ajax.post('/rules/'+ data.key +'_nat', {rule: data.rules.nat}).then(function() {
        ajax.post('/rules/'+ data.key +'_forward', {rule: data.rules.forward}).then(function() {
          callback(null, true);
        });
      });
    } else {
      ajax.put('/rules/'+data.key+'_nat', {rule: data.rules.nat}).then(function() {
        ajax.put('/rules/'+data.key+'_forward', {rule: data.rules.forward}).then(function() {
          callback(null, true);
        });
      });
    }
  },

  render: function() {
    var pfs = this.state.port_forwards.map(function(pf) {
      return (
        <PortForward rules={pf.rules} key={pf.key} onSave={this.handleSave} />
      );
    });

    return (
      <div>
        {pfs}
        <PortForward data={{}} new={true} />
      </div>
    );
  }
});


React.render(
  <PortForwardPage uri="http://localhost"/>,
  $(".page.port_forwards")[0]
);