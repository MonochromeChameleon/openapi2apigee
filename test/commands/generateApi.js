'use strict'

import should from 'should';
import * as path from 'path';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';
import { generateSkeleton } from '../../lib/commands/generateApi/generateSkeleton.js';
import * as fs from 'fs';

describe('generateApi', function () {
  describe('generate', function () {
    it('Incorrect openapi file should generate error..', function (done) {
      var options = {
        source: path.resolve('test/commands/openapi_files/openapi2.yaml'),
        destination: path.resolve('api_bundles')
      }
      generateApi('petStore', options, function (err, reply) {
        should.notEqual(err, null)
        reply.error.should.eql('openapi parsing failed..')
        done()
      })
    })
    it('Correct openapi file should not generate error..', function (done) {
      var options = {
        source: path.resolve('test/commands/openapi_files/openapi1.yaml'),
        destination: path.resolve('api_bundles')
      }
      generateApi('petStore', options, function (err, reply) {
        should.equal(err, null)
        done()
      })
    })
  })

  describe('generatePolicies', function () {
    it('....', function () {

    })
  })

  describe('generateProxy', function () {
    it('....', function () {

    })
  })

  describe('generateProxyEndPoint', function () {
    it('....', function () {

    })
  })

  describe('generateSkeleton', function () {
    it('generate Skeleton should create folder structure', function (done) {
      var options = {
        source: path.resolve('test/commmands/openapi_files/openapi1.yaml'),
        destination: path.resolve('api_bundles'),
        apiProxy: randomText()
      }
      generateSkeleton(options.apiProxy, options, function (err, reply) {
        should.equal(err, null)
        var rootFolder = fs.lstatSync(path.join(options.destination, options.apiProxy))
        var proxiesFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/proxies'))
        var targetsFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/targets'))
        var policiesFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/policies'))
        should.equal(rootFolder.isDirectory(), true)
        should.equal(proxiesFolder.isDirectory(), true)
        should.equal(targetsFolder.isDirectory(), true)
        should.equal(policiesFolder.isDirectory(), true)
        done()
      })
    })
    it('destination path ending with / should generate Skeleton Folder', function (done) {
      var options = {
        source: path.resolve('test/commands/openapi_files/openapi1.yaml'),
        destination: path.resolve('api_bundles/'),
        apiProxy: randomText()
      }
      generateSkeleton(options.apiProxy, options, function (err, reply) {
        should.equal(err, null)
        var rootFolder = fs.lstatSync(path.join(options.destination, options.apiProxy))
        var proxiesFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/proxies'))
        var targetsFolder = fs.lstatSync(path.join(options.destination, options.apiProxy + '/apiproxy/proxies'))
        should.equal(rootFolder.isDirectory(), true)
        should.equal(proxiesFolder.isDirectory(), true)
        should.equal(targetsFolder.isDirectory(), true)
        done()
      })
    })
  })

  describe('generateTargetEndPoint', function () {
    it('....', function () {

    })
  })
})

function randomText () {
  var text = ''
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
  for (var i = 0; i < 10; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
