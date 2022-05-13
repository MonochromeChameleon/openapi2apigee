import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as serviceUtils from '../../util/service.js';
import * as quota from '../../policy_templates/quota/quota.js';
import * as spike from '../../policy_templates/spikeArrest/spikeArrest.js';
import * as cache from '../../policy_templates/cache/responseCache.js';
import * as cors from '../../policy_templates/cors/cors.js';
import * as headers from '../../policy_templates/headers/headers.js';
import * as regex from '../../policy_templates/regex-protection/regex.js';
import * as extractVars from '../../policy_templates/vars/extract-vars.js';
import { validationsSchema, validationsGenTemplate }  from '../../policy_templates/validations/valid.js';
import * as raiseFault from '../../policy_templates/raise-fault/raise.js';
import * as verifyApiKey from '../../policy_templates/security/apikey.js';
import * as oauth2 from '../../policy_templates/security/verifyAccessToken.js';
import * as async from 'async';


const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function generatePolicies (apiProxy, options, api, cb) {
  var destination = options.destination || path.resolve('api_bundles')
  if (destination.substr(-1) === '/') {
    destination = destination.substr(0, destination.length - 1)
  }
  var rootDirectory = destination + '/' + apiProxy + '/apiproxy'
  var validationCount = 0
  var services = serviceUtils.servicesToArray(api)
  async.each(services, function (service, callback) {
    // Perform operation on file here.
    var xmlStrings = []
    var serviceName = service.name
    var provider = service.provider
    var serviceOptions = service.options
    var xmlString = ''
    if (provider.indexOf('quota') > -1) {
      // Add Quota Policy
      xmlString = quota.quotaGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (provider.indexOf('spike') > -1) {
      // Add spike Policy
      xmlString = spike.spikeArrestGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (provider.indexOf('cache') > -1) {
      // Add cache Policies
      xmlString = cache.responseCacheGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (provider.indexOf('cors') > -1) {
      // Add cors Policies
      xmlString = cors.corsGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (provider.indexOf('headers') > -1) {
      // Add header Policies
      xmlString = headers.headersGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (provider.indexOf('regex') > -1) {
      // Add regex Policies
      xmlString = regex.regexGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
      // filter
      fs.mkdirSync(rootDirectory + '/resources/jsc', { recursive: true })
      var js = path.join(__dirname, '../../resource_templates/jsc/JavaScriptFilter.js')
      fs.createReadStream(js).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/' + serviceName + '.js'))
      // regex
      var qs = path.join(__dirname, '../../resource_templates/jsc/querystringDecode.js')
      fs.createReadStream(qs).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/' + serviceName + '-querystring.js'))
      var x = regex.regularExpressions()
      var wstream = fs.createWriteStream(rootDirectory + '/resources/jsc/regex.js')
      wstream.write(new Buffer('var elements = ' + JSON.stringify(x) + ';'))
      wstream.end()
    }
    if (provider.indexOf('raiseFault') > -1) {
      // Add RaiseFault Policy
      xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (provider.indexOf('input-validation') > -1) {
      serviceOptions.resourceUrl = 'jsc://input-validation.js';
      xmlString = validationsGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
      var extractVarsOptions = {
        name: 'Extract-Path-Parameters',
        displayName: 'Extract Path Parameters',
        api: api
      }
      xmlString = extractVars.extractVarsGenTemplate(extractVarsOptions, extractVarsOptions.name)
      xmlStrings.push({ xmlString: xmlString, serviceName: 'extractPathParameters' })
    }
    if (provider.indexOf('output-validation') > -1) {
      serviceOptions.resourceUrl = 'jsc://schema-validation.js'
      xmlString = validationsGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (validationCount === 0 && (provider.indexOf('input-validation') > -1 || provider.indexOf('output-validation') > -1)) {
      validationCount++ // Only do this once.
      fs.mkdirSync(rootDirectory + '/resources/jsc', { recursive: true })
      // output validation
      var bu = path.join(__dirname, '../../resource_templates/jsc/bundle-policify.js')
      fs.createReadStream(bu).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/bundle-policify.js'))
      js = path.join(__dirname, '../../resource_templates/jsc/SchemaValidation.js')
      fs.createReadStream(js).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/schema-validation.js'))
      // var ru = path.join(__dirname, '../../resource_templates/jsc/Regex.js');
      // fs.createReadStream(ru).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/regex-utils.js'));
      // input validation
      js = path.join(__dirname, '../../resource_templates/jsc/InputValidation.js')
      fs.createReadStream(js).pipe(fs.createWriteStream(rootDirectory + '/resources/jsc/input-validation.js'))
      // api
      x = validationsSchema(api)
      wstream = fs.createWriteStream(rootDirectory + '/resources/jsc/api.js')
      wstream.write(new Buffer('var api = ' + JSON.stringify(x) + ';'))
      wstream.end()
    }

    if (provider.indexOf('raiseInputValidationFault') > -1) {
      // Add RaiseFault Policy
      xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (provider.indexOf('raiseOutputValidationFault') > -1) {
      // Add RaiseFault Policy
      xmlString = raiseFault.raiseFaultGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (provider.indexOf('oauth') > -1 && (serviceName === 'apiKeyQuery' || serviceName === 'apiKeyHeader')) {
      // Add cache Policies
      xmlString = verifyApiKey.apiKeyGenTemplate(serviceOptions, serviceName)
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }
    if (provider.indexOf('oauth') > -1 && (serviceName === 'oauth2')) {
      // Add cache Policies
      xmlString = oauth2.verifyAccessTokenGenTemplate(serviceOptions, 'verifyAccessToken')
      xmlStrings.push({ xmlString: xmlString, serviceName: serviceName })
    }

    var writeCnt = 0
    xmlStrings.forEach(function writeFile (xmlString) {
      fs.writeFile(rootDirectory + '/policies/' + xmlString.serviceName + '.xml', xmlString.xmlString, function (err) {
        if (err) {
          callback(err, {})
        }
        writeCnt++
        if (writeCnt === xmlStrings.length) {
          callback(null, {})
        }
      })
    })
  }, function (err) {
    // if any of the file processing produced an error, err would equal that error
    if (err) {
      cb(err, {})
    } else {
      cb(null, {})
    }
  })
}
