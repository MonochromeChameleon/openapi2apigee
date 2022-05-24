

import should from 'should';
import * as path from 'path';
import * as fs from 'fs';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';
import { generateSkeleton } from '../../lib/commands/generateApi/generateSkeleton.js';

describe('generateApi', () => {
  describe('generate', () => {
    it('Incorrect openapi file should generate error..', (done) => {
      const options = {
        source: path.resolve('test/commands/openapi_files/openapi2.yaml'),
        destination: path.resolve('api_bundles')
      }
      generateApi('petStore', options, (err, reply) => {
        should.notEqual(err, null)
        reply.error.should.eql('openapi parsing failed..')
        done()
      })
    })
    it('Correct openapi file should not generate error..', (done) => {
      const options = {
        source: path.resolve('test/commands/openapi_files/openapi1.yaml'),
        destination: path.resolve('api_bundles')
      }
      generateApi('petStore', options, (err, reply) => {
        should.equal(err, null)
        done()
      })
    })
  })

  describe('generatePolicies', () => {
    it('....', () => {

    })
  })

  describe('generateProxy', () => {
    it('....', () => {

    })
  })

  describe('generateProxyEndPoint', () => {
    it('....', () => {

    })
  })

  describe('generateSkeleton', () => {
    it('generate Skeleton should create folder structure', (done) => {
      const options = {
        source: path.resolve('test/commmands/openapi_files/openapi1.yaml'),
        destination: path.resolve('api_bundles'),
        apiProxy: randomText()
      }
      generateSkeleton(options.apiProxy, options, (err, reply) => {
        should.equal(err, null)
        const rootFolder = fs.lstatSync(path.join(options.destination, options.apiProxy))
        const proxiesFolder = fs.lstatSync(path.join(options.destination, `${options.apiProxy  }/apiproxy/proxies`))
        const targetsFolder = fs.lstatSync(path.join(options.destination, `${options.apiProxy  }/apiproxy/targets`))
        const policiesFolder = fs.lstatSync(path.join(options.destination, `${options.apiProxy  }/apiproxy/policies`))
        should.equal(rootFolder.isDirectory(), true)
        should.equal(proxiesFolder.isDirectory(), true)
        should.equal(targetsFolder.isDirectory(), true)
        should.equal(policiesFolder.isDirectory(), true)
        done()
      })
    })
    it('destination path ending with / should generate Skeleton Folder', (done) => {
      const options = {
        source: path.resolve('test/commands/openapi_files/openapi1.yaml'),
        destination: path.resolve('api_bundles/'),
        apiProxy: randomText()
      }
      generateSkeleton(options.apiProxy, options, (err, reply) => {
        should.equal(err, null)
        const rootFolder = fs.lstatSync(path.join(options.destination, options.apiProxy))
        const proxiesFolder = fs.lstatSync(path.join(options.destination, `${options.apiProxy  }/apiproxy/proxies`))
        const targetsFolder = fs.lstatSync(path.join(options.destination, `${options.apiProxy  }/apiproxy/proxies`))
        should.equal(rootFolder.isDirectory(), true)
        should.equal(proxiesFolder.isDirectory(), true)
        should.equal(targetsFolder.isDirectory(), true)
        done()
      })
    })
  })

  describe('generateTargetEndPoint', () => {
    it('....', () => {

    })
  })
})

function randomText () {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < 10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
