![Logo](img/logo.png "Logo")

**[↤ Developer Overview](../README.md)**

Usage
===

> Here is how SFCC CLI can help you with you local development

`sfcc watch`
---

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

`sfcc list`
---

To get a list of your current clients & instances, you can run:

```bash
sfcc list
```


`sfcc delete`
---

To delete a configuration option, you can pass in a client and instance you want to delete.  Or just delete everything for that client:

```bash
sfcc delete <client> <instance>
sfcc delete <client>
```


`sfcc log`
---

If you only have a single project, you can run:

```bash
sfcc log
```

If needed to setup multiple clients, or multiple instances for the same client, you will need to specify what to watch:

```bash
sfcc log <client> <instance>
```

**FLAGS:**

Name     | Param      | Default | Definition
---------|------------|---------|----------------------------------------------
Polling  | `-p`       | `2`     | Polling Interval ( in Seconds )
Lines    | `-l`       | `100`   | Number of Existing Lines to Display
Include  | `-i`       |         | Log Types to Include ( use `sfcc log --list` for list )
Exclude  | `-e`       |         | Log Types to Exclude ( use `sfcc log --list` for list )
Filter   | `-f`       |         | Filter Log Messages that contain this string or RegExp
Truncate | `-t`       |         | Length to Truncate Messages ( if they are too long )
List     | `--list`   |         | Output List of Log Types for `-i` & `-e`
Search   | `--search` | `false` | Search Logs with no Live Updates
Latest   | `--latest` | `false` | Show Latest Logs Only ( default is to use ALL logs )

#### ADVANCED USE:

Get current list of log types:

```bash
sfcc log list
```

Watch latest `customerror` logs that contain the text `PipelineCallServlet`:

```bash
sfcc log -i customerror -l 5 -f PipelineCallServlet --latest
```

View any `warn,error` logs that contain a matching `[0-9]{15}` RegExp pattern, and watch for new entries:

```bash
sfcc log -i warn,error -f '[0-9]{15}'
```

Search all latest existing logs except `staging,syslog` that contain either `WARN|ERROR` RegExp pattern:

```bash
sfcc log -e staging,syslog -f 'WARN|ERROR' --search --latest
```

`sfcc help`
---

You can get help at any time by running:

```bash
sfcc help
```

You can get help on a specific command by just adding `help` to the end of the command:

```bash
sfcc log help
sfcc watch help
```
