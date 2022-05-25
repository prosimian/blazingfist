import GetGoogleFonts from 'get-google-fonts'

try {
  new GetGoogleFonts({
    cssFile: '../scss/utils/_fonts.scss', // relative to outputDir below
    outputDir: './src/fonts',
    overwriting: true,
    path: '/fonts/'
  }).download(
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap'
  )
} catch (error) {
  console.dir(error)
}
