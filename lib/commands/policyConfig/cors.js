export const corsConfig = {
  name: 'add-cors',
  provider: 'x-cors',
  options: {
    displayName: 'Add CORS',
    headers: {
      'Access-Control-Allow-Origin': {
        type: 'string',
        default: '*',
        description: `Setting this header to \`*\` allows all origins.
This is handy for public REST APIs that don't require
authentication. But, according to the HTTP spec, browsers
*WILL NOT* send cookies if this header is \`*\`, regardless
of what you set \`Access-Control-Allow-Credentials\` to.`,
      },
      'Access-Control-Allow-Credentials': {
        type: 'boolean',
        default: false,
        description: 'Setting this header to `false` means that your API does not use authentication cookies.',
      },
      'Access-Control-Allow-Headers': {
        type: 'array',
        collectionFormat: 'csv',
        default: 'origin, x-requested-with, accept',
        description: 'This shows how you can explicitly specify which HTTP headers your API allows.',
      },
      'Access-Control-Allow-Methods': {
        type: 'array',
        collectionFormat: 'csv',
        default: 'GET, PUT, POST, DELETE',
        description: 'This shows how you can explicitly specify which HTTP methods your API allows.',
      },
      'Access-Control-Max-Age': {
        type: 'integer',
        default: 3628800,
        description: 'This allows client browsers to cache the CORS response for one day (3628800 seconds).',
      },
    },
  },
}

