import fse from 'fs-extra'

const functionsDir = `./netlify/functions/`

// copy to static site
;['favicons', 'fonts'].forEach(dir => {
  fse.ensureDirSync(`./site/${dir}`)
  fse.copySync(`./src/${dir}`, `./site/${dir}`)
})

// copy to "preview" function
;['js', 'liquid', 'sanity', 'utils'].forEach(dir => {
  fse.ensureDirSync(`${functionsDir}_src/${dir}`)
  fse.copySync(`./src/${dir}`, `${functionsDir}_src/${dir}`)
})
