![Logo](https://sfccdevops.s3.amazonaws.com/logo-128.png "Logo")

**[↤ Developer Overview](../README.md#developer-overview)**

`sfcc setup`
---

> Get your SFCC Repo added to the SFCC CLI Config

![demo](https://sfcc-cli.s3.amazonaws.com/setup.gif?v=1.1.0)

#### Enter Params via Prompt

If installed globally, you can run:

```bash
sfcc setup
```

otherwise:

```bash
./bin/cli.js setup
```

#### Pass Params via CLI

```bash
sfcc setup -c "My Client" -h dev04-web-mysandbox.demandware.net -d /Users/Name/Projects/mysandbox -u my@email.com -p 'my^pass'
```

NOTE: When using the password flag, make sure to wrap the text with SINGLE QUOTES.  Using Double Quotes will cause issues with passwords that contain dollar signs.

**FLAGS:**

Name           | Param | Required | Default   | Definition
---------------|-------|----------|-----------|----------------------------------------------
Client Name    | `-c`  | Yes      |           | Used to group config instances
Hostname       | `-h`  | Yes      |           | The root domain name for environment
Directory      | `-d`  | Yes      |           | Absolute path to the projects SFCC repository
Username       | `-u`  | Yes      |           | Instances SFCC Business Manager Username
Password       | `-p`  | Yes      |           | Instances SFCC Business Manager Password
Instance Alias | `-a`  | No       | `sandbox` | Custom Name to give this Instance
Code Version   | `-v`  | No       | `develop` | SFCC Code Version to use

**SAVED TO: ~/.sfcc-cli**

```json
{
  "my-client": {
    "sandbox": {
      "h": "dev04-web-mysandbox.demandware.net",
      "d": "/Users/Name/Projects/mysandbox",
      "u": "my@email.com",
      "p": "my^pass",
      "a": "sandbox",
      "v": "develop"
    }
  }
}
```

If you have Eclipse Build scripts in your cartridges ( `*.launch` files contained inside `.externalToolBuilders` ), these will also get added to your config file.  An exammple of that project might look like this:

```json
{
  "my-client": {
    "sandbox": {
      "h": "dev04-web-mysandbox.demandware.net",
      "d": "/Users/Name/Projects/mysandbox",
      "u": "my@email.com",
      "p": "my^pass",
      "a": "sandbox",
      "v": "develop",
      "b": {
        "gulp-builder-javascript-builder": {
          "enabled": true,
          "watch": [
            "/app_storefront_core/cartridge/js"
          ],
          "cmd": {
            "basedir": "/path/to/gulp_builder",
            "exec": "cd /path/to/gulp_builder; gulp js --basedir=/path/to/gulp_builder"
          }
        },
        "gulp-builder-styles-builder": {
          "enabled": true,
          "watch": [
            "/app_storefront_core/cartridge/scss"
          ],
          "cmd": {
            "basedir": "/path/to/gulp_builder",
            "exec": "cd /path/to/gulp_builder; gulp styles --basedir=/path/to/gulp_builder"
          }
        }
      }
    }
  }
}
```
