// Info: Url-Redirector management SDK.
'use strict';

// Shared Dependencies (Managed by Loader)
var Lib = {};

// Private Dependencies - Parts of same library (Managed by Loader)
var UrlRedirectData;
var UrlRedirectInput;

// Exclusive Dependencies
var CONFIG = require('./config'); // Loader can override it with Custom-Config

/////////////////////////// Module-Loader START ////////////////////////////////

  /********************************************************************
  Load dependencies and configurations

  @param {Set} shared_libs - Reference to libraries already loaded in memory by other modules
  @param {Set} config - Custom configuration in key-value pairs

  @return nothing
  *********************************************************************/
  const loader = function(shared_libs, config){

    // Shared Dependencies (Must be loaded in memory already)
    Lib.Utils = shared_libs.Utils;
    Lib.Debug = shared_libs.Debug;
    Lib.Crypto = shared_libs.Crypto;
    Lib.DynamoDB = shared_libs.DynamoDB;
    Lib.Instance = shared_libs.Instance;

    // Override default configuration
    if( !Lib.Utils.isNullOrUndefined(config) ){
      Object.assign(CONFIG, config); // Merge custom configuration with defaults
    }

    // Private Dependencies
    UrlRedirectData = require('./url_redirect_data')(Lib, CONFIG);
    UrlRedirectInput = require('./url_redirect_input')(Lib, CONFIG);

    // Additional Shared Dependencies
    Lib.UrlRedirectData = UrlRedirectData;
    Lib.UrlRedirectInput = UrlRedirectInput;

  };

//////////////////////////// Module-Loader END /////////////////////////////////

///////////////////////////// Module Exports START /////////////////////////////
module.exports = function(shared_libs, config){

  // Run Loader
  loader(shared_libs, config);

  // Return Public Funtions of this module
  return [UrlRedirect, UrlRedirectInput, UrlRedirectData];

};//////////////////////////// Module Exports END //////////////////////////////



///////////////////////////Public Functions START//////////////////////////////
const UrlRedirect = { // Public functions accessible by other modules

  /********************************************************************
  Create Short-URL

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} namespace_id - Namespace-ID (Brand-ID/Store-ID/...)
  @param {String} domain - Domain of Url
  @param {String} original_link - Original-Link to be Shortened/Mapped
  @param {Number} key_length - Length of characters of Key to be generated
  @param {String} key - [Optional]  Pre-defined Key (User defined Key)
  @param {Number} expiry - [Optional] Expiry for this URL (in minutes)
  @param {Set} supplementary_data - Additional Data for URL

  @callback - Request Callback(err, url_data)
  * @callback {Error} err - Database Error
  * @callback {Set} url_data - Url-Data
  *********************************************************************/
  create: function(
    instance, cb,
    namespace_id,
    domain,
    original_link,
    key_length, key, expiry,
    supplementary_data
  ){

    // If Expiry provided, create Time-Of-Expiry
    var time_of_expiry;
    if( !Lib.Utils.isNullOrUndefined(expiry) ){ // Check for available Custom Key
      time_of_expiry = ( instance['time'] + (expiry * 60) ); // Current Unixtime + Expiry time in seconds
    }


    // Create Url-Data
    var url_data = UrlRedirectData.createData(
      namespace_id,
      domain, key,
      original_link,
      expiry, // link-expiry (expiry in minutes)
      supplementary_data,
      instance['time'], // Time of Creation
      time_of_expiry // Time of Expiry (Unixtime)
    );


    // If Custom-Key not provided, auto-generate Key
    if( Lib.Utils.isNullOrUndefined(key) ){ // Check for available Custom Key
      _UrlRedirect.generateUniquKeyWithDbCheck(
        instance,
        function(err, generated_key){

          if(err){ // Print Error
            return cb(err); // Invoke callback with error
          }


          // Reach here means all good

          // Assign Newly Generated Key
          url_data['key'] = generated_key;

          // Add Record in DB
          _UrlRedirect.setDataInDynamoDb(
            instance, cb,
            url_data
          );

        },
        domain, key_length
      );
    }
    // When Custom-Key is Provided
    else{
      // Add Record in DB
      _UrlRedirect.setDataInDynamoDb(
        instance, cb,
        url_data
      );
    }

  },


  /********************************************************************
  Get Url Data by Key from database

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} domain - Domain of Url
  @param {String} key - KEY (Unique-ID)

  @return Thru request Callback.

  @callback - Request Callback(err, url_data)
  * @callback {Error} err - In case of error
  * @callback {Boolean} url_data - false if URL Data Not Found
  * @callback {Set} url_data - URL Data
  *********************************************************************/
  getData: function(
    instance, cb,
    domain, key
  ){

    // Get Data from DB
    _UrlRedirect.getDataFromDynamoDB(
      instance, cb,
      domain, key
    );

  },


  /********************************************************************
  Get Original-Url by Domain and Key

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} domain - Domain of Url
  @param {String} key - KEY (Unique-ID)

  @return Thru request Callback.

  @callback - Request Callback( err, [redirect_url, supplementary_data] )
  * @callback {Error} err - In case of error
  * @callback {Boolean} [redirect_url, supplementary_data] - false if Original Redirect-Url Not Found
  * @callback {String|Set} [redirect_url, supplementary_data] - Original-Url and Supplementary-Data
  *********************************************************************/
  getRedirectUrl: function(
    instance, cb,
    domain, key
  ){

    // Get Data from DB
    _UrlRedirect.getDataFromDynamoDB(
      instance,
      function(err, url_data){

        if(err){ // Print Database Error
          return cb(err); // Invoke callback with error
        }


        if(!url_data){ // If Data Not Found, Return 'false'
          return cb(null, false);
        }


        // Reach here means all Good

        // Return Data
        return cb(
          null, // No Error
          [
            url_data['original_link'], // Original Redirect-Url
            url_data['supplementary_data'] // Supplementary-Data
          ]
        );

      },
      domain, key
    );

  },


  /********************************************************************
  Delete Data by Key from database

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} namespace_id - Namespace-ID (Brand-ID/Store-ID/...)
  @param {String} domain - Domain of Url
  @param {String} key - KEY (Unique-ID)

  @return Thru request Callback.

  @callback - Request Callback(err, success)
  * @callback {Error} err - In case of error
  * @callback {Boolean} success - 'false' if Data Not deleted, else 'true'
  *********************************************************************/
  deleteData: function(
    instance, cb,
    namespace_id,
    domain, key
  ){

    // Delete record In DB
    _UrlRedirect.deleteDataInDynamoDB(
      instance, cb,
      namespace_id,
      domain, key
    );

  },


  /********************************************************************
  Update Data by Key from database

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} namespace_id - Namespace-ID (Brand-ID/Store-ID/...)
  @param {String} domain - Namespace-ID (Domain of Url)
  @param {String} key - Short-ID

  @param {Number} expiry - Expiry for this URL (in minutes)
  @param {Boolean} remove_expiry - 'true' If To Remove expiry for this URL, else 'false'
  @param {String} supplementary_data - Supplementary Data (Additional Data related to Url (Save as-it-is along with Url-Info-Data) )

  @return Thru request Callback.

  @callback - Request Callback(err, success)
  * @callback {Error} err - In case of error
  * @callback {Boolean} success - 'false' if Data Not deleted, else 'true'
  *********************************************************************/
  updateData: function(
    instance, cb,
    namespace_id,
    domain, key,
    expiry, remove_expiry,
    supplementary_data
  ){

    // To Remove Expiry for this URL
    if(remove_expiry){

      // Update record In DB
      _UrlRedirect.updateDataInDynamoDB(
        instance, cb,
        namespace_id,
        domain, key,
        expiry, remove_expiry, supplementary_data
      );

    }
    else{

      // Update record In DB
      _UrlRedirect.updateDataInDynamoDB(
        instance, cb,
        namespace_id,
        domain, key,
        expiry, remove_expiry, supplementary_data
      );

    }

  },


  /********************************************************************
  Check Short-ID Availability in database

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} domain - Namespace-ID (Domain for this URL)
  @param {String} key - Key to check for Availability

  @return Thru request Callback.

  @callback - Request Callback(err, is_available)
  * @callback {Error} err - In case of error
  * @callback {Boolean} is_available - 'false' if Key Not available, else 'true'
  *********************************************************************/
  checkKeyAvailablity: function(
    instance, cb,
    domain, key
  ){

    // Get Data
    _UrlRedirect.getDataFromDynamoDB(
      instance,
      function(err, url_data){

        // Return
        return cb(
          null,
          !Boolean(url_data) // If Data not found, means Key is Available
        );

      },
      domain, key
    );

  },

};///////////////////////////Public Functions END//////////////////////////////



//////////////////////////Private Functions START//////////////////////////////
const _UrlRedirect = { // Private functions accessible within this modules only

  /********************************************************************
  Set Data in database

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {Set} url_data - Url data

  @return Thru request Callback.

  @callback - Request Callback. No Response, only error
  * @callback {Error} err - Unable to reach UrlRedirect database
  * @callback {Set} url_data - URL Data
  *********************************************************************/
  setDataInDynamoDb: function(
    instance, cb,
    url_data
  ){

    // Create Record Object that is to be saved in Database
    const db_record = UrlRedirectData.createDbDataFromUrlData(url_data);


    // Set data in dynamodb
    Lib.DynamoDB.addRecord(
      instance,
      function(err, is_success){ // Callback function

        if(err){ // Database Error
          return cb(err); // Invoke callback with error
        }

        if(!is_success){ // Transaction Database Error
          return cb( Lib.Utils.error(CONFIG.ERR_DATABASE_WRITE_FAILED) ); // Invoke callback with error
        }


        // Return URL-Data
        cb(
          null,
          url_data
        );

      },
      CONFIG.DB_SOURCE, // Table Name
      db_record // Record to be saved in database
    );

  },


  /********************************************************************
  Get Data from Database

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} domain - Domain of Url
  @param {String} key - Key or Unique-ID

  @return Thru request Callback.

  @callback - Request Callback(err, url_data)
  * @callback {Error} err - In case of error
  * @callback {Boolean} url_data - false if Data Not Found
  * @callback {Set} url_data - Url-Data
  *********************************************************************/
  getDataFromDynamoDB: function(
    instance, cb,
    domain, key
  ){

    // Fetch Records
    Lib.DynamoDB.queryRecords(
      instance,
      function(err, response, count){ // Callback function

        if(err){ // Print Database Error
          return cb(err); // Invoke callback with error
        }

        // Check for No Response (records not found)
        if(!response){
          return cb(null, false); // Key not available, if no records found
        }


        // Reach here means all good

        // Return
        return cb(
          null,
          UrlRedirectData.createDataFromDbData( response[0] ) // Translate DB-Data
        );

      },
      CONFIG.DB_SOURCE, // Table Name
      null, // No Secondary Index
      'p', // Parition Key
      domain,  // Partition value
      null, // Fetch all Fields
      null, // Paging
      { // Ascending Sort
        'asc': true,
        'key': 'id', // condition.key - sort key on which comparison is to be done
        'value': UrlRedirectData.constructSortKey(key), // No Namespace-ID
        'operator': 'begins_with' // condition.operator
      }
    );

  },


  /********************************************************************
  Update Data in DynamoDB

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} namespace_id - Namespace-ID (Brand-ID/Store-ID/...)
  @param {String} domain - Domain of Url
  @param {String} key - Key or Unique-ID

  @param {Number} expiry - Expiry for this URL (in minutes)
  @param {Boolean} remove_expiry - 'true' If To Remove expiry for this URL, else 'false'
  @param {String} supplementary_data - Supplementary Data (Additional Data related to Url (Save as-it-is along with Url-Info-Data) )

  @return Thru request Callback.

  @callback - Request Callback(err)
  * @callback {Error} err - In case of error
  *********************************************************************/
  updateDataInDynamoDB: function(
    instance, cb,
    namespace_id,
    domain, key,
    expiry, remove_expiry, supplementary_data
  ){

    // Create Record-ID
    var record_id = {
      'p': domain,
      'id': UrlRedirectData.constructSortKey(key, namespace_id)
    };


    // Record Data to be Updated
    var updated_record_data = {};
    var remove_keys = [];

    if( remove_expiry ){ // If to Remove Expiry

      // Set link Expiry and time-of-Expiry to null
      remove_keys.push('ex'); // Expiry
      remove_keys.push('toe'); // TOE

    }

    // If Link-Expiry Key exists, Update its Value
    if( !Lib.Utils.isNullOrUndefined(expiry) ){

      // Update DB Record
      updated_record_data['link_expiry'] = expiry;
      updated_record_data['time_of_expiry'] = ( instance['time'] + (expiry * 60) ); // Current Unixtime + Expiry time in seconds

    }
    if( !Lib.Utils.isNullOrUndefined(supplementary_data) ){
      updated_record_data['supplementary_data'] = supplementary_data;
    }


    // Translate URL Data to DB-Data
    updated_record_data = UrlRedirectData.createDbDataFromUrlData(updated_record_data);


    // Update Data in dynamodb
    Lib.DynamoDB.updateRecord(
      instance,
      function(err, is_success){

        if(err){ // Print Database Error
          return cb(err); // Invoke callback with error
        }

        if(!is_success){ // Spooler Database Error
          return cb( Lib.Utils.error(CONFIG.PRINT_SPOOLER_DATABASE_WRITE_FAILED) ); // Invoke callback with error
        }

        // Success
        cb(null, true);

      },
      CONFIG.DB_SOURCE, // Table Name
      record_id, // Partition Key and Sort Key
      updated_record_data, // Updated Data
      remove_keys // remove_keys
    );

  },


  /********************************************************************
  Delete this Record from DB

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} namespace_id - Namespace-ID (Brand-ID/Store-ID/...)
  @param {String} domain - Domain of Url
  @param {String} key - Key or Unique-ID

  @return Thru request Callback.

  @callback - Request Callback(err, customers_list)
  * @callback {Error} err - In case of error
  * @callback {Boolean} is_success - true if Deleted
  *********************************************************************/
  deleteDataInDynamoDB: function(
    instance, cb,
    namespace_id,
    domain, key
  ){

    // Create Record-ID
    var record_id = {
      'p': domain,
      'id': UrlRedirectData.constructSortKey(key, namespace_id)
    };


    // Get Transaction-Data from dynamodb
    Lib.DynamoDB.deleteRecord(
      instance,
      function(err, is_success){ // Callback function

        if(err){ // Print Database Error
          return cb(err); // Invoke callback with error
        }

        // Check If Data Not found
        if(!is_success){
          return cb(null, false)
        }


        // Reach here means All Good

        // Return
        cb(
          null, // No error
          is_success // Successfully deleted record
        );

      },
      CONFIG.DB_SOURCE, // Table Name
      record_id, // id
    );

  },



  /********************************************************************
  Generate a new Key (Recursively check if Generated-Key already exists in DB or Not, else Keep creating New Unique Key)

  @param {reference} instance - Request Instance object reference
  @param {Function} cb - Callback function to be invoked once async execution of this function is finished

  @param {String} domain - Domain of Url
  @param {Number} key_length - Length of characters of Key to be generated

  @callback - Request Callback(err, key)
  * @callback {Error} err - In case of error
  * @callback {String} key - Unique Key
  *********************************************************************/
  generateUniquKeyWithDbCheck: function(
    instance, cb,
    domain, key_length
  ){

    // Generate New Key
    var key = _UrlRedirect.generateKey(key_length);

    // Check If Generated-Key already exists in DB or Not
    UrlRedirect.checkKeyAvailablity(
      instance,
      function(err, is_available){

        if(err){ // Print Database Error
          return cb(err); // Invoke callback with error
        }


        if(!is_available){ // If Key NOT available in DB, Recursively call same function to Generate New and Unique Key

          // Recursive call
          _UrlRedirect.generateUniquKeyWithDbCheck(
            instance,
            cb,
            domain, key_length
          );

        }
        else{ // Return Generated Key
          return cb(null, key);
        }

      },
      domain, key
    );

  },


  /********************************************************************
  Generate a new Key

  @param {reference} instance - Request Instance object reference
  @param {Number} key_length - Length of characters of Key to be generated

  @return {String} transaction_id - Newly Generated Transaction-ID
  *********************************************************************/
  generateKey: function(key_length){

    return Lib.Crypto.generateRandomString( // Time based random ID
      CONFIG.KEY_CHARSET,
      key_length ? key_length : CONFIG.DEFAULT_KEY_LENGTH
    );

  },

};//////////////////////////Private Functions END//////////////////////////////
