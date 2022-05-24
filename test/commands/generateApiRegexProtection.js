

import should from 'should';
import * as path from 'path';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { generateApi } from '../../lib/commands/generateApi/generateApi.js';

describe('generateApi with regex-protection', () => {
  const options = {
    source: path.resolve('test/commands/openapi_files/regex-protection.yaml'),
    destination: path.resolve('api_bundles'),
    apiProxy: 'petStoreRegexProtection'
  }

  describe('generate', (done) => {
    it('Correct swagger file should generate proxy', async () => {
      await generateApi(options.apiProxy, options)
    })
  })

  describe('Add regex-protection policy', () => {
    it('Regexp protection policy should be generated', (done) => {
      const filePath = path.join(options.destination, `${options.apiProxy  }/apiproxy/policies/regex-protection.xml`)
      const file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)

      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        result.should.have.property('Javascript')
        result.should.have.property('Javascript').property('ResourceURL')
        // Check Header name and value
        should.equal(result.Javascript.ResourceURL[0], 'jsc://regex-protection.js', 'regex protection script not found')
        should.equal(result.Javascript.IncludeURL[0], 'jsc://regex.js', 'regex js script not found')
        should.equal(result.Javascript.IncludeURL[1], 'jsc://regex-protection-querystring.js', 'regex-protection-querystring js script not found')
        done()
      })
    })

    it('Js files should be generated', (done) => {
      let filePath = path.join(options.destination, `${options.apiProxy  }/apiproxy/resources/jsc/regex-protection.js`)
      let file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)
      filePath = path.join(options.destination, `${options.apiProxy  }/apiproxy/resources/jsc/regex-protection-querystring.js`)
      file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)
      filePath = path.join(options.destination, `${options.apiProxy  }/apiproxy/resources/jsc/regex.js`)
      file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)
      done()
    })

    it('Raise fault policy should be generated', (done) => {
      const filePath = path.join(options.destination, `${options.apiProxy  }/apiproxy/policies/raiseFault.xml`)
      const file = fs.lstatSync(filePath)
      should.equal(file.isFile(), true)

      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        result.should.have.property('RaiseFault')
        result.should.have.property('RaiseFault').property('FaultResponse')
        // Check Header name and value
        console.log('RaiseFault.FaultResponse[0]', result.RaiseFault.FaultResponse[0].Set[0].ReasonPhrase[0])
        should.equal(result.RaiseFault.FaultResponse[0].Set[0].ReasonPhrase[0], 'Bad Request', 'ReasonP hrase not found')
        should.equal(result.RaiseFault.FaultResponse[0].Set[0].StatusCode[0], '400', '400 not found')
        done()
      })
    })

    it('Proxy should contain Add Regex Protection step in PreFlow', (done) => {
      const filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        result.should.have.property('ProxyEndpoint')
        result.should.have.property('ProxyEndpoint').property('PreFlow')
        should.equal(result.ProxyEndpoint.PreFlow[0].Request[0].Step[0].Name[0], 'Add Regex Protection', 'Add Reqex Protection step in found in PreFlow')
        done()
      })
    })

    it('Proxy should contain Raise Regex Error step in PreFlow', (done) => {
      const filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        result.should.have.property('ProxyEndpoint')
        result.should.have.property('ProxyEndpoint').property('PreFlow')
        should.equal(result.ProxyEndpoint.PreFlow[0].Request[0].Step[1].Name[0], 'Raise Regex Error', 'Raise Regex Error step in found in PreFlow')
        done()
      })
    })

    it('Proxy should contain parameter check in listPets flow', (done) => {
      const filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        if (result.ProxyEndpoint.Flows[0].Flow[0].$.name === 'listPets') {
          should.equal(result.ProxyEndpoint.Flows[0].Flow[0].Request[0].Step[0].Condition[0], '(request.queryparam.param1 Equals null) or (request.queryparam.param2 Equals null)', 'Param check found in listPets flow')
          should.equal(result.ProxyEndpoint.Flows[0].Flow[0].Request[0].Step[0].Name[0], 'Raise Regex Error', 'Param check raise found in listPets flow')
        }
        done()
      })
    })

    it('Proxy should contain quotaAnil in listPets flow', (done) => {
      const filePath = path.join(options.destination, options.apiProxy, '/apiproxy/proxies/default.xml')
      const fileData = fs.readFileSync(filePath)
      const parser = new xml2js.Parser()
      parser.parseString(fileData, (err, result) => {
        should.equal(err, null)
        if (result.ProxyEndpoint.Flows[0].Flow[0].$.name === 'listPets') {
          should.equal(result.ProxyEndpoint.Flows[0].Flow[0].Request[0].Step[1].Name[0], 'quotaAnil', 'quotaAnil found in listPets flow')
        }
        done()
      })
    })
  })
})
