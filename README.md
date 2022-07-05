![Logo](https://sfccdevops.s3.amazonaws.com/logo-128.png "Logo")

SFCC CLI
---

> Command Line Interface for Salesforce Commerce Cloud Sandbox Development

![demo](https://sfcc-cli.s3.amazonaws.com/demo.gif?v=1.3.0)

Introduction
---

Make developing for Salesforce Commerce Cloud work with any IDE on MacOS, Windows, and Linux.

- [X] Easily Manage Multiple Clients & Instances
- [X] Watch for code changes and upload in background ( without being prompted for passwords )
- [X] Support for SFRA JS & CSS Compilers
- [X] Support for Eclipse Build Processes
- [X] Log Viewing with Advanced Search & Filter Capabilities

Developer Overview
---

#### Commands

* [`sfcc setup`](docs/cmd-setup.md) - Setup SFCC Development
* [`sfcc list`](docs/cmd-list.md) - List Configured SFCC Clients
* [`sfcc delete`](docs/cmd-delete.md) - Delete Config for Client
* [`sfcc watch`](docs/cmd-watch.md) - Watch for Changes and Push Updates
* [`sfcc log`](docs/cmd-log.md) - View Logs with Advanced Search & Filter Capabilities
* [`sfcc help`](docs/cmd-help.md) - Get Help when you need it

#### Additional Information

* [Troubleshooting](docs/troubleshooting.md)

Install
---

#### Requirements

- [X] [Node v14+](https://nodejs.org/en/download/)

#### Install via NPM

```bash
npm install -g @sfccdevops/sfcc-cli --no-optional
sfcc setup
```

#### Install via Clone

```bash
cd ~
git clone https://github.com/sfccdevops/sfcc-cli.git
cd sfcc-cli
npm install -g --no-optional
sfcc setup
```

_Inspired by [dw-cli](https://github.com/mzwallace/dw-cli). Custom Built for SFCC Developers._

About the Author
---

> [Peter Schmalfeldt](https://peterschmalfeldt.com/) is a Certified Senior Salesforce Commerce Cloud Developer with over 20 years of experience building eCommerce websites, providing everything you need to design, develop & deploy eCommerce applications for Web, Mobile & Desktop platforms.

Disclaimer
---

> The trademarks and product names of Salesforce®, including the mark Salesforce®, are the property of Salesforce.com. SFCC DevOps is not affiliated with Salesforce.com, nor does Salesforce.com sponsor or endorse the SFCC DevOps products or website. The use of the Salesforce® trademark on this project does not indicate an endorsement, recommendation, or business relationship between Salesforce.com and SFCC DevOps.
