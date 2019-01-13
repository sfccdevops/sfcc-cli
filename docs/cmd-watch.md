![Logo](img/logo.png "Logo")

**[↤ Developer Overview](../README.md#developer-overview)**

`sfcc watch`
---

> Watch for Code Changes and Push Updates

![demo](https://sfcc-cli.s3.amazonaws.com/watch.gif)

Watch for any changes to your projects source code, and automagically upload in the background, while you use whatever IDE you want.

If you have already run `sfcc setup`, and you only have a single project, you can run:

```bash
sfcc watch
```

If needed to setup multiple clients, or multiple instances for the same client, you will need to specify what to watch:

```bash
sfcc watch <client> <instance>
```

If you don't want to get notified of every upload, but would rather only get notified about errors, you can pass `--errors-only`:

```bash
sfcc watch <client> <instance> --errors-only
```

If you would like to run the watcher as a background process, but capture the log output, you can pass `--log`, and a log will be created at `~/.sfcc-cli.log` ( log is truncated to last 500 lines each time you start a new `watch` ):

```bash
sfcc watch <client> <instance> --log &
```

NOTE: To run the background process, you'll need to make sure to add a `&` to the end of the command.  You should see output from that command that looks like `[2] 6768`.  You can bring the process to the foreground by running using the number in the brackets, and running a command like `fg %2`.  You can get a list of all jobs running in the background by running `jobs`.


Live Reload
---

The Watch command does have an optional method to support Live Reloading your sandbox server.  To enable support for this, you need to make sure to install the [rvw_devtools](https://github.com/redvanworkshop/rvw_devtools) cartridge on your sandbox.


Then, you'll need to generate some SSL keys to support a secure connection to your sandbox.

```bash
openssl req -x509 -out localhost.crt -keyout localhost.key -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -extensions EXT -config <( printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
```

Once this is complete, you should only need to run the following command:

```bash
sfcc watch <client> <instance> --live-reload
```
