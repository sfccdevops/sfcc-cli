![Logo](img/logo.png "Logo")

**[↤ Developer Overview](../README.md#developer-overview)**

`sfcc remote`
---

> Remote Control for your Sandbox Storefront

![demo](https://sfcc-cli.s3.amazonaws.com/remote.gif)

If you only have a single project, you can run:

```bash
sfcc remote
```

If needed to setup multiple clients, or multiple instances for the same client, you will need to specify what to use:

```bash
sfcc remote <client> <instance>
```

**FLAGS:**

Name        | Param           | Default | Definition
------------|-----------------|---------|----------------------------------------------
Live Reload | `--live-reload` | `false` | Enable Live Reload on Code Change


Live Reload
---

This option is uses in conjunction with `sfcc watch` and when an upload is completed to your sandbox, a message is sent to to the page that it needs to refresh the page.  There is a slight delay to prevent multuple reloads, in the event that you have a build process that was kicked off in the background.

To enable support for this, you need to make sure to install and setup the [rvw_devtools](https://github.com/redvanworkshop/rvw_devtools) cartridge on your sandbox.

This will inject the following HTML snippet into your sandbox:

```html
<script src="https://localhost:8443/sfcc-cli-remote.js" id="sfcc-cli-remote"></script>
```

Once this is complete, you should only need to run the following command:

```bash
sfcc remote <client> <instance> --live-reload
```


SSL Certificates
---

In order for the SSL certificates to work locally, you will need to add the certificate to your system keys.

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
