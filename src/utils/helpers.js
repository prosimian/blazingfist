export const domain = process.env.URL || 'http://localhost:8080' // Netlify-dependent

export const random = _ => {
  const segment = _ => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }
  return `${segment()}-${segment()}-${segment()}`
}
