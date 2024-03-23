// Info: Contains Functions Related to Url Input Data Cleanup and Validations
'use strict';

// Shared Dependencies (Managed by Main Entry Module & Loader)
var Lib;

// Exclusive Dependencies
var CONFIG; // (Managed by Main Entry Module & Loader)


/////////////////////////// Module-Loader START ////////////////////////////////

  /********************************************************************
  Load dependencies and configurations

  @param {Set} shared_libs - Reference to libraries already loaded in memory by other modules
  @param {Set} config - Custom configuration in key-value pairs

  @return nothing
  *********************************************************************/
  const loader = function(shared_libs, config){

    // Shared Dependencies (Managed my Main Entry Module)
    Lib = shared_libs;

    // Configuration (Managed my Main Entry Module)
    CONFIG = config;

  };

//////////////////////////// Module-Loader END /////////////////////////////////



///////////////////////////// Module Exports START /////////////////////////////
module.exports = function(shared_libs, config){

  // Run Loader
  loader(shared_libs, config);

  // Return Public Funtions of this module
  return UrlRedirectInput;

};//////////////////////////// Module Exports END //////////////////////////////



///////////////////////////Public Functions START///////////////////////////////
const UrlRedirectInput = { // Public functions accessible by other modules


  /********************************************************************
  Check if valid key for this URL

  @param {String} key - URL Unique key

  @return {Boolean} - true on success
  @return {Boolean} - false if validation fails
  *********************************************************************/
  validateUrlKey: function(key){

    // Check if text-length in within Minimum and Maximum string length
    return Lib.Utils.validateStringRegx(
      key,
      CONFIG.KEY_CHARSET_REGX,
      CONFIG.KEY_MIN_LENGTH, // Minimum Required length
      CONFIG.KEY_MAX_LENGTH // Maximum Allowed length
    );

  },

  /********************************************************************
  Return cleaned Short-Key for non-sql purposes
  Remove all the dangerous characters excluding those who satisfy RegExp

  @param {String} key - KEY (Unique-ID)

  @return {String} - Sanitized String
  *********************************************************************/
  sanitizeUrlKey: function(key){

    // Clean and return
    return Lib.Utils.sanitizeUsingRegx(key.toLowerCase(), CONFIG.KEY_SANATIZE_REGX);

  },

};///////////////////////////Public Functions END///////////////////////////////



//////////////////////////Private Functions START///////////////////////////////
const _UrlRedirectInput = {  // Private methods accessible within this modules only
  // None
};/////////////////////////Private Functions END////////////////////////////////
