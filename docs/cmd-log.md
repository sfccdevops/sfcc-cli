![Logo](https://sfccdevops.s3.amazonaws.com/logo-128.png "Logo")

**[↤ Developer Overview](../README.md#developer-overview)**

`sfcc log`
---

> Stream/Search log files from an instance

![demo](https://sfcc-cli.s3.amazonaws.com/log.gif?v=1.1.0)

If you only have a single project, you can run:

```bash
sfcc log
```

If needed to setup multiple clients, or multiple instances for the same client, you will need to specify what to use:

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
sfcc log --list
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
