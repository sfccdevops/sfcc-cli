![Logo](img/logo.png "Logo")

**[↤ Developer Overview](../README.md)**

Usage
---

> Here is how SFCC CLI can help you with you local development

### Watch

Watch for any changes to your projects source code, and automagically upload in the background, while you use whatever IDE you want.

If you have already run `sfcc setup`, and you only have a single project, you can run:

```bash
sfcc watch
```

If needed to setup multiple clients, or multiple instances for the same client, you will need to specify what to watch:

```bash
sfcc watch <client> <instance>
```

### List

To get a list of your current clients & instances, you can run:

```bash
sfcc list
```

### Delete

To delete a configuration option, you can pass in a client and instance you want to delete.  Or just delete everything for that clients:

```bash
sfcc delete <client> <instance>
sfcc delete <client>
```

### Help

You can get help at any time by running:

```bash
sfcc help
```

You can get help on a specific command by just added `help` to the end of the command:

```bash
sfcc watch help
```
