![Logo](img/logo.png "Logo")

**[↤ Developer Overview](../README.md)**

Usage
---

> Here is how SFCC CLI can help you with you local development

### Watch

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
