![Logo](https://sfccdevops.s3.amazonaws.com/logo-128.png "Logo")

**[↤ Developer Overview](../README.md#developer-overview)**

`sfcc watch`
---

> Watch for Code Changes and Push Updates

![demo](https://sfcc-cli.s3.amazonaws.com/watch.gif?v=1.1.0)

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

If you just want to trigger the compiler on file changes, and let your IDE handle uploads, you can pass `--compile-only`:

```bash
sfcc watch <client> <instance> --compile-only
```

If you would like to run the watcher as a background process, but capture the log output, you can pass `--log`, and a log will be created at `~/.sfcc-cli.log` ( log is truncated to last 500 lines each time you start a new `watch` ):

```bash
sfcc watch <client> <instance> --log &
```

NOTE: To run the background process, you'll need to make sure to add a `&` to the end of the command.  You should see output from that command that looks like `[2] 6768`.  You can bring the process to the foreground by running using the number in the brackets, and running a command like `fg %2`.  You can get a list of all jobs running in the background by running `jobs`.
