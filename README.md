# IP Tables WebUI

A nice webui for the `iptables` command, written in NodeJS. Currently a work in progress.

## Security

This WebUI is not meant to be used as a general access long running web server.  Instead the following flow is assumed:

|Step| Action                                                   |                                           |
|----|----------------------------------------------------------|-------------------------------------------|
| 1  | The User SSH's into a remote server with a port forward  | `ssh myserver.com -L 8099:localhost:8099` |
| 2  | The user starts the web interface                        | `iptables-webui start`                    |
| 3  | The user navigates to the address in their browser       | `http://localhost:8099`                   |

Pro-tip: Store the server/forwarding details in `~/.ssh/config`:

```
Host myserver
  Hostname myserver.com
  User me
  LocalForward 8099:localhost:8099
```

## Planned Features

* Modular handling of rules (enable and disable named groups of rules)
* Raw rule editor
* Port Forwarding
* Pre-built rules

## You damn kids are just jamming javascript in everywhere!

I did it in NodeJS because:

* I don't want to learn a real language like C++
* I want to learn more about NodeJS
* I want to use it on an ARM and it's faster than ruby