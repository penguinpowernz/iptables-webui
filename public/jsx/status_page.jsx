var StatusPage = React.createClass({
  render: function() {
    return (
      <div>
        <h2>Device Forwarding</h2>

        <ForwardingStatus />

        <p>You need to run this command as root for each device you want to forward on:</p>
        <pre>echo '1' &gt; /proc/sys/net/ipv4/conf/eth0/forwarding</pre>
        <p>You can disable forwarding on an interface, by doing the opposite:</p>
        <pre>echo '0' &gt; /proc/sys/net/ipv4/conf/eth0/forwarding</pre>

        <h2>Current Rules</h2>
        <p>This shows what rules IP Tables is currently running with:</p>
        <IPTablesList />

        <h2>Source Rules</h2>
        <p>This shows what rules in persistence generated the above rules:</p>
        <SourceRules />
      </div>
    );
  }
});