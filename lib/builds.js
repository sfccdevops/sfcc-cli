const convert = require('xml-js')
const fs = require('fs')
const os = require('os').type()
const path = require('path')
const slug = require('slug')

module.exports = project => {
  let externalToolBuilders = []
  let build = {}

  // Look for *.launch files in .externalToolBuilders folder
  fs.readdirSync(project).map(fileName => {
    const filePath = path.join(project, fileName)
    if (fs.statSync(filePath).isDirectory()) {
      const buildPath = path.join(filePath, '.externalToolBuilders')
      if (fs.existsSync(buildPath) && fs.statSync(buildPath).isDirectory()) {
        fs.readdirSync(buildPath).map(buildFile => {
          if (path.extname(buildFile) === '.launch') {
            externalToolBuilders.push(path.join(buildPath, buildFile))
          }
        })
      }
    }
  })

  // Loop through found .externalToolBuilders files and parse build instructions
  if (externalToolBuilders.length > 0) {
    externalToolBuilders.map(launch => {
      const xml = fs.readFileSync(launch)
      const json = convert.xml2json(xml)
      const builder = json ? JSON.parse(json) : null
      const name = slug(
        path.basename(path.dirname(path.dirname(launch))).replace('_', '-') +
          '_' +
          path.basename(launch).replace('.launch', ''),
        {lower: true, replacement: '-'}
      )

      // setup placeholder for this config file
      build[name] = {
        enabled: false,
        watch: [],
        cmd: {
          basedir: null,
          exec: null
        }
      }

      if (
        builder &&
        typeof builder.elements !== 'undefined' &&
        builder.elements.length === 1 &&
        builder.elements[0].name === 'launchConfiguration' &&
        builder.elements[0].elements
      ) {
        builder.elements[0].elements.map(elm => {
          // Get Watch Directories
          if (elm.attributes.key === 'org.eclipse.ui.externaltools.ATTR_BUILD_SCOPE') {
            const buildScopeJson = convert.xml2json(
              elm.attributes.value.replace('${working_set:', '').replace(/}$/, '')
            )
            const buildScope = buildScopeJson ? JSON.parse(buildScopeJson) : null

            if (
              buildScope &&
              typeof buildScope.elements !== 'undefined' &&
              buildScope.elements.length === 1 &&
              buildScope.elements[0].name === 'resources' &&
              builder.elements[0].elements
            ) {
              buildScope.elements[0].elements.map(buildSrc => {
                build[name].watch.push(buildSrc.attributes.path)
              })
            }
          }

          // Check if we should enable this build
          if (elm.attributes.key === 'org.eclipse.ui.externaltools.ATTR_RUN_BUILD_KINDS') {
            build[name].enabled =
              elm.attributes.value.includes('full') ||
              elm.attributes.value.includes('incremental') ||
              elm.attributes.value.includes('auto')
          }

          // Get Build Instructuctions
          if (elm.attributes.key === 'org.eclipse.ui.externaltools.ATTR_LOCATION') {
            const buildFilePath = elm.attributes.value.replace('${workspace_loc:', '').replace(/}$/, '')
            const buildFileXml = fs.readFileSync(path.join(project, buildFilePath))
            const buildFileJson = convert.xml2json(buildFileXml)
            const buildInstructions = buildFileJson ? JSON.parse(buildFileJson) : null

            if (
              buildInstructions &&
              typeof buildInstructions.elements !== 'undefined' &&
              buildInstructions.elements.length === 1 &&
              buildInstructions.elements[0].name === 'project' &&
              buildInstructions.elements[0].elements
            ) {
              buildInstructions.elements[0].elements.map(buildInstruction => {
                build[name].cmd.basedir =
                  typeof buildInstructions.elements[0].attributes.basedir !== 'undefined'
                    ? path.join(
                        project,
                        path.basename(path.dirname(path.dirname(launch))),
                        buildInstructions.elements[0].attributes.basedir
                      )
                    : null
                buildInstruction.elements.map(instruction => {
                  if (instruction.name === 'exec') {
                    let exec = instruction.attributes.executable
                    if (
                      (exec === 'cmd' && os === 'Windows_NT') ||
                      (exec !== 'cmd' && (os === 'Darwin' || os === 'Linux'))
                    ) {
                      instruction.elements.map(arg => {
                        if (arg.name === 'arg') {
                          exec = exec.concat(' ' + arg.attributes.value)
                        }
                      })

                      // Replace commands that are not needed outside Eclipse
                      exec = exec.replace('/bin/bash -l -c ', '')
                      exec = exec.replace(/\${basedir}/g, build[name].cmd.basedir)

                      build[name].cmd.exec = exec
                    }
                  }
                })
              })
            }
          }
        })
      }
    })
  }

  return build
}
