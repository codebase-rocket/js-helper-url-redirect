// Info: Contains Functions Related to UrlRedirect Data-Structures
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
  return UrlRedirectData;

};//////////////////////////// Module Exports END //////////////////////////////



///////////////////////////Public Functions START///////////////////////////////
const UrlRedirectData = { // Public functions accessible by other modules

  /********************************************************************
  Return a Url-Info Data object

  @param {String} namespace_id - Namespace-ID (Brand-ID/Store-ID/...)
  @param {String} domain - Namespace-ID (Domain of this URL)
  @param {String} key - Key or Unique-ID for this Url (5 characters by Default)
  @param {String} original_link - Original Url, which is to be Mapped
  @param {Number} expiry - Expiry of the Newly Constructed Url (In minutes)
  @param {String} supplementary_data - Supplementary Data (Additional Data related to Url (Save as-it-is along with Url-Info-Data) )
  @param {Integer} time_of_creation - Time of Creation of this Url (Unix Time)
  @param {Integer} time_of_expiry - Time of Expiry for this Url (Unix Time)

  @return {Set} url_data - Url-Data Object in key-value
  *********************************************************************/
  createData: function(
    namespace_id,
    domain, key,
    original_link,
    link_expiry, supplementary_data,
    time_of_creation, time_of_expiry
  ){

    return {
      'namespace_id': Lib.Utils.fallback(namespace_id),
      'domain': Lib.Utils.fallback(domain),
      'key': Lib.Utils.fallback(key),
      'original_link': Lib.Utils.fallback(original_link),
      'link_expiry': Lib.Utils.fallback(link_expiry),
      'supplementary_data': Lib.Utils.fallback(supplementary_data),
      'time_of_creation': Lib.Utils.fallback(time_of_creation),
      'time_of_expiry': Lib.Utils.fallback(time_of_expiry),
    };

  },


  /********************************************************************
  Create Transaction Data from Database Record Data

  @param {Set} data - Database Record Data

  @return - Transaction Data
  *********************************************************************/
  createDataFromDbData: function(data){

    // Deconstruct-SortKey
    var [key, namespace_id] = UrlRedirectData.deconstructSortKey( data['id'] );

    // Construct Data
    return UrlRedirectData.createData(
      namespace_id, // Namespace-ID
      data['p'], // domain
      key, // KEY
      Lib.Utils.fallback(data['ol']),
      Lib.Utils.fallback(data['ex']),
      Lib.Utils.fallback(data['sd']),
      Lib.Utils.fallback(data['toe']),
      Lib.Utils.fallback(data['toc']),
    );

  },


  /********************************************************************
  Create Database Record Data from Transaction Data

  @param {Set} data - Transaction Data

  @return - Database Record Data
  *********************************************************************/
  createDbDataFromUrlData: function(data){

    // Create Record Object
    var db_record = {};


    if( !Lib.Utils.isEmpty(data['domain']) ){
      db_record['p'] = data['domain'];
    }

    if( !Lib.Utils.isEmpty(data['key']) ){ // Construct Sort-Key
      db_record['id'] = UrlRedirectData.constructSortKey( data['key'], data['namespace_id'] );
    }

    // Add optional keys to Record-Object (Make All Keys Optional for partial Updates)
    if( !Lib.Utils.isEmpty(data['namespace_id']) ){
      db_record['ns'] = data['namespace_id'];
    }

    if( !Lib.Utils.isEmpty(data['original_link']) ){
      db_record['ol'] = data['original_link'];
    }

    if( !Lib.Utils.isEmpty(data['time_of_expiry']) ){
      db_record['ex'] = data['time_of_expiry'];
    }

    if( !Lib.Utils.isEmpty(data['supplementary_data']) ){
      db_record['sd'] = data['supplementary_data'];
    }

    if( !Lib.Utils.isEmpty(data['time_of_expiry']) ){
      db_record['toe'] = data['time_of_expiry'];
    }

    if( !Lib.Utils.isEmpty(data['time_of_creation']) ){
      db_record['toc'] = data['time_of_creation'];
    }


    // Return this DB Record
    return db_record;

  },



  /********************************************************************
  Construct Sort-Key

  @param {String} key - Key or Unique-ID for this Url (5 characters by Default)
  @param {String} namespace_id - Namespace-ID (Brand-ID/Store-ID/...)

  @return {String} printer_state - Printer Status
  *********************************************************************/
  constructSortKey: function(key, namespace_id){

    // Return
    return [key, namespace_id].join('&');
  },


  /********************************************************************
  Deconstruct Sort-Key

  @param {String} sort_key - Sort Key

  @return {String|String} [key, namespace_id] - Return Key, Namespace-Id
  *********************************************************************/
  deconstructSortKey: function(sort_key){

    // Deconstruct key
    var [key, namespace_id] = sort_key.split('&');

    // Return
    return [key, namespace_id];
  },

};///////////////////////////Public Functions END///////////////////////////////



//////////////////////////Private Functions START///////////////////////////////
const _UrlRedirectData = { // Private functions accessible within this modules only

};/////////////////////////Private Functions END////////////////////////////////
