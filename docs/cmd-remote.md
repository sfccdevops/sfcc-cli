![Logo](img/logo.png "Logo")

**[↤ Developer Overview](../README.md#developer-overview)**

`sfcc remote`
---

> Connect to SFCC CLI via Browser Extension

![demo](https://sfcc-cli.s3.amazonaws.com/remote.gif?v=1.1.0)


Browser Extension Setup
---

To get started, you'll need to [Install the Browser Extension](https://github.com/redvanworkshop/sfcc-remote).

Once you have the browser extension installed, you will need to do the following:

```bash
sfcc remote
```

Once the remote is turned on, all your `sfcc log` and `sfcc watch` output will be pushed to the browser extension.


SSL Certificates
---

**IMPORTANT:** After running `sfcc remote`, check that you can access the following URL in your browser:

```
https://localhost:8443/socket.io/socket.io.js
```

`localhost` certificates are kind of flakey, and you might see something like this, which is normal. Just click through that first time to `Always Trust` the certificate to avoid future headaches.

![Error](img/ssl-error.png "Error")
![Error](img/ssl-error-accept.png "Error")

Once you've confirmed you can access the `socket.io.js` file in your browser, you are good to go.

You can also do this manually, if needed:

<details><summary>VIEW INSTRUCTIONS</summary>
<p>

For MacOS you can do this:

```bash
cd ./remote/ssl
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain sfcc-cli-ca.cer
```

SSL Certs already created in `./remote/ssl`, but if they need to be created again, here is how it was done:

```bash
cd ./remote/ssl
openssl req -x509 -newkey rsa:2048 -out sfcc-cli-ca.cer -outform PEM -keyout sfcc-cli-ca.pvk -days 10000 -verbose -config sfcc-cli.cnf -nodes -sha256 -subj "/CN=sfcc-cli CA"
openssl req -newkey rsa:2048 -keyout sfcc-cli-localhost.pvk -out sfcc-cli-localhost.req -subj /CN=localhost -sha256 -nodes
openssl x509 -req -CA sfcc-cli-ca.cer -CAkey sfcc-cli-ca.pvk -in sfcc-cli-localhost.req -out sfcc-cli-localhost.cer -days 10000 -extfile sfcc-cli.ext -sha256 -set_serial 0x1111
```

</p>
</details>
