// Info: Test Cases
'use strict';

// Shared Dependencies
var Lib = {};

// Set Configration for DynamoDB Library
const config_dynamodb = {
  KEY: 'todo',
  SECRET: 'todo',
  REGION: 'todo'
};

// Set Configrations
const url_config = {
  DB_SOURCE: 'ctp_url_redirect',
};

// Set Configrations
const http_config = {
   // 'TIMEOUT': 140000, // In milliseconds (140 second). 0 means no timeout
   'TIMEOUT': 10000, // In milliseconds (140 second). 0 means no timeout
   'USER_AGENT': 'Test App 1.0' // Not used by browser
};

// Dependencies
Lib.Utils = require('js-helper-utils');
Lib.Debug = require('js-helper-debug')(Lib);
Lib.Crypto = require('js-helper-crypto-nodejs')(Lib);
[Lib.Time, Lib.TimeInput, Lib.TimeData] = require('js-helper-time')(Lib);
Lib.Instance = require('js-helper-instance')(Lib);
Lib.NoDB = require('js-helper-aws-dynamodb')(Lib, config_dynamodb);

// This Module
var [UrlRedirect, UrlRedirectInput, UrlRedirectData] = require('js-helper-url-redirector')(Lib, url_config);

////////////////////////////SIMILUTATIONS//////////////////////////////////////

function test_output_simple(err, response){ // Result are from previous function

  if(err){
    Lib.Debug.logErrorForResearch(err);
  }

  Lib.Debug.log('response', response);

};


function test_output2(err, response, response2){ // Result are from previous function

  if(err){
    Lib.Debug.logErrorForResearch(err);
  }

  Lib.Debug.log('response', response);
  Lib.Debug.log('response2', response2);

};

///////////////////////////////////////////////////////////////////////////////


/////////////////////////////STAGE SETUP///////////////////////////////////////

// Initialize 'instance'
var instance = Lib.Instance.initialize();

var domain = 'l.rwctp.com';
var namespace_id = '9cwaag8wt2k8wpt9bu652vw55.9l70dvee5copp1t26susles6e.xxpyj';

var time_of_creation = instance['time'];
var transaction_time_local = Lib.Time.unixtimeToTimezoneDate(
  instance['time'],
  'Asia/Kolkata'
).toISOString();
///////////////////////////////////////////////////////////////////////////////

/////////////////////////////////TESTS/////////////////////////////////////////

// Test create()
// Lib.Debug.log( // Output: object
//   'create(...)',
//   UrlRedirect.create(
//     instance,
//     test_output_simple,
//     namespace_id, // namespace_id
//     domain, // domain
//     'https://testing.in', // original_link,
//     7, // key_length,
//     null, // key
//     2, // expiry
//     // {}, // supplementary_data,
//   )
// );


// Test getData()
// Lib.Debug.log( // Output: String
//   'getData(...)',
//   UrlRedirect.getData(
//     instance,
//     test_output_simple,
//     domain, // domain
//     '0gt632f' // key
//   )
// );


// Test getRedirectUrl()
// Lib.Debug.log( // Output: String
//   'getRedirectUrl(...)',
//   UrlRedirect.getRedirectUrl(
//     instance,
//     test_output_simple,
//     domain, // domain
//     'wfg53m8' // key
//   )
// );


// Test updateData()
// Lib.Debug.log( // Output: String
//   'updateData(...)',
//   UrlRedirect.updateData(
//     instance,
//     test_output_simple,
//     namespace_id,
//     domain, // domain
//     'wfg53m8', // key
//     1, // link_expiry
//     false, // remove_expiry
//     {'test': 'tester...'} // supplementary_data
//   )
// );


// Test deleteData()
// Lib.Debug.log( // Output: String
//   'deleteData(...)',
//   UrlRedirect.deleteData(
//     instance,
//     test_output_simple,
//     namespace_id,
//     domain, // domain
//     'scndkn' // key
//   )
// );


// Test checkKeyAvailablity()
// Lib.Debug.log( // Output: String
//   'checkKeyAvailablity(...)',
//   UrlRedirect.checkKeyAvailablity(
//     instance,
//     test_output_simple,
//     domain, // domain
//     'wfg53m8' // key
//   )
// );


// Test sanitizeUrlKey()
// Lib.Debug.log( // Output: String
//   'sanitizeUrlKey(...)',
//   UrlRedirectInput.sanitizeUrlKey(
//     'hwc9mtt' // key
//   )
// );
//
//
// // Test validateUrlKey()
// Lib.Debug.log( // Output: String
//   'validateUrlKey(...)',
//   UrlRedirectInput.validateUrlKey(
//     'hwc9mtt' // key
//   )
// );


///////////////////////////////////////////////////////////////////////////////
