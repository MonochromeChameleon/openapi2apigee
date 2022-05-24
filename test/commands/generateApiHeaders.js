

import should from 'should';
import * as path from 'path';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';

describe('generateApi with headers', () => {
  const options = {
    source: path.resolve('test/commands/openapi_files/headers.yaml'),
    destination: path.resolve('api_bundles'),
    apiProxy: 'petStoreHeaders'
  }

  describe('generate', (done) => {
    it('Correct OpenApi file should generate proxy', (done) => {
      generateApi(options.apiProxy, options, (err, reply) => {
        should.equal(err, null)
        done()
      })
    })
  })

  describe('Add header policy', () => {
    it('Headers token policy should be generated', (done) => {
      const filePath = path.join(options.destination, `${options.apiProxy  }/apiproxy/policies/add-headers-token.xml`)
      const file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)

      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        result.should.have.property('AssignMessage')
        result.should.have.property('AssignMessage').property('Set')
        const headers = result.AssignMessage.Set[0].Headers[0]
        // Check Header name and value
        should.equal(headers.Header[0].$.name, 'x-token', 'x-token not found: ')
        should.equal(headers.Header[0]._, 'random_token', 'x-token value not correct')
        done()
      })
    })

    it('Headers x-api-key policy should be generated', (done) => {
      const filePath = path.join(options.destination, `${options.apiProxy  }/apiproxy/policies/add-headers-x-api-key.xml`)
      const file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)

      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        result.should.have.property('AssignMessage')
        result.should.have.property('AssignMessage').property('Set')
        const headers = result.AssignMessage.Set[0].Headers[0]
        // Check Header name and value
        should.equal(headers.Header[0].$.name, 'x-api-key', 'x-api-key not found: ')
        should.equal(headers.Header[0]._, 'random_api_key', 'x-api-key value not correct')
        done()
      })
    })

    it('Headers securit headers policy should be generated', (done) => {
      const filePath = path.join(options.destination, `${options.apiProxy  }/apiproxy/policies/add-headers-security.xml`)
      const file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)

      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        result.should.have.property('AssignMessage')
        result.should.have.property('AssignMessage').property('Set')
        const headers = result.AssignMessage.Set[0].Headers[0]
        // Check Header name and value
        should.equal(headers.Header[0].$.name, 'Strict-Transport-Security', 'Strict-Transport-Security not found: ')
        should.equal(headers.Header[0]._, 'max-age=31536000; includeSubDomains; preload', 'value not correct')
        should.equal(headers.Header[1].$.name, 'X-XSS-Protection', 'X-XSS-Protection header not found: ')
        should.equal(headers.Header[1]._, '1; mode=block', 'value not correct')
        should.equal(headers.Header[2].$.name, 'X-Content-Type-Options', 'X-Content-Type-Options header not found: ')
        should.equal(headers.Header[2]._, 'nosniff', 'value not correct')
        should.equal(headers.Header[3].$.name, 'X-Frame-Options', 'X-Frame-Options header not found: ')
        should.equal(headers.Header[3]._, 'deny', 'value not correct')
        done()
      })
    })

    it('Target should contain header step in PreFlow', (done) => {
      const filePath = path.join(options.destination, options.apiProxy, '/apiproxy/targets/default.xml')
      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        result.should.have.property('TargetEndpoint')
        result.should.have.property('TargetEndpoint').property('PreFlow')
        should.equal(result.TargetEndpoint.PreFlow[0].Request[0].Step[0].Name[0], 'Add AWS api key header', 'Add AWS api key header step in found in PreFlow')
        should.equal(result.TargetEndpoint.PreFlow[0].Request[0].Step[1].Name[0], 'Add token header', 'Add token header step in found in PreFlow')
        done()
      })
    })

    it('Proxy should contain header step in PostFlow', (done) => {
      const filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        result.should.have.property('ProxyEndpoint')
        result.should.have.property('ProxyEndpoint').property('PostFlow')
        should.equal(result.ProxyEndpoint.PostFlow[0].Response[0].Step[0].Name[0], 'Add security headers', 'Add security headers step in found in PostFlow')
        done()
      })
    })
  })
})
