![Logo](img/logo.png "Logo")

**[↤ Developer Overview](../README.md#developer-overview)**

`sfcc setup`
---

> Get your SFCC Repo added to the SFCC CLI Config

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
sfcc setup -c "My Client" -h dev04-web-mysandbox.demandware.net -d /Users/RVW/Projects/mysandbox -u my@email.com -p "my^pass"
```

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
      "d": "/Users/RVW/Projects/mysandbox",
      "u": "my@email.com",
      "p": "my^pass",
      "a": "sandbox",
      "v": "develop"
    }
  }
}
```
