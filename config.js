// Info: Configuration file
'use strict';


// Export configration as key-value Map
module.exports = {

  // Constraints on Request-ID
  KEY_MIN_LENGTH       : 6,                   // Fixed Length
  KEY_MAX_LENGTH       : 12,                   // Fixed Length
  KEY_SANATIZE_REGX    : /[^0-9a-z]/g,        // Regular expression for valid Characters. Base36. Case Insensitive
  KEY_CHARSET_REGX     : /^[0-9a-z]*$/,        // Regular expression for valid Characters. Base36. Case Insensitive
  KEY_CHARSET          : `0123456789abcdefghijklmnopqrstuvwxyz`, // Valid charset. Digits, Lowercase Alphabets

  // Default length for KEY
  DEFAULT_KEY_LENGTH   : 6,

  // Database Table Name
  DB_SOURCE            : 'ctp_url_redirect',


  // Error Codes
  ERR_DATABASE_WRITE_FAILED: {
    'code': 'DATABASE_WRITE_FAILED',
    'message': 'Failed to write into Url-Redirect database'
  },

}
