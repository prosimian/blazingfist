import sanityClient from '@sanity/client'

const client =
  process.env.SANITY_PROJECT_ID &&
  process.env.SANITY_DATASET &&
  process.env.SANITY_READ_TOKEN &&
  sanityClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET,
    apiVersion: '2022-05-20',
    useCdn: !process.env.SANITY_READ_TOKEN,
    token: process.env.SANITY_READ_TOKEN
  })

  export default client
