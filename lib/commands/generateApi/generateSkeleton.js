import * as async from 'async'
import * as path from 'path'
import * as fs from 'fs'

export function generateSkeleton (apiProxy, options, cb) {
  var destination = options.destination || path.resolve('api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  var rootDirectory = destination + '/' + apiProxy + '/apiproxy'
  fs.mkdirSync(rootDirectory, { recursive: true })
  // Generate sub folders..
  var subFolders = ['proxies', 'targets', 'policies']

  subFolders.map((sf) => path.join(rootDirectory, sf)).forEach((sf) => {
    fs.mkdirSync(sf);
  });

  cb(null, subFolders);
}
