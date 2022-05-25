![Logo](https://sfccdevops.s3.amazonaws.com/logo-128.png "Logo")

**[↤ Developer Overview](../README.md)**

Troubleshooting
===

> This document contains a list of known issues, and how to solve them.

<img src="https://octodex.github.com/images/dinotocat.png" width="400" />

`Error [ERR_TLS_CERT_ALTNAME_INVALID]`
---

For `sfcc-cli` commands that initiate network requests, you may get an error similar to the following:

`Error [ERR_TLS_CERT_ALTNAME_INVALID]: Hostname/IP does not match certificate's altnames: Host: dev09.commerce.myclient.demandware.net. is not in the cert's altnames: DNS:*.demandware.net, DNS:demandware.net`

This is because node cannot verify that the server is valid according to the TLS certificate.  The following command executed in your terminal will temporarily disable this check while you have your terminal session open.

#### Mac and Linux

```bash
export NODE_TLS_REJECT_UNAUTHORIZED=0
```

#### Windows

```bash
set NODE_TLS_REJECT_UNAUTHORIZED=0
```

`SyntaxError: Unexpected Token (`
---

You are getting this since the CLI tool uses ES6 Javascript, and you are likely using an older version of node that does not support it.  Make sure you are using the latest version of node.  We suggest v10+.

Once you have a newer version of Node installed, you will need to uninstall / reinstall this package. Your setup will be save to `~/.sfcc-cli` so it is safe to do a clean install without losing anything.
