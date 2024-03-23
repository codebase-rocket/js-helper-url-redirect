# v1.0 #

------------
AWS DynamoDB
------------


----------------------------------
Create table - URL Builder
----------------------------------
Url Info data

* Table Name: ctp_url_redirect
* Partition Key: p [string]
* Sort Key: id [string]

* Secondary Index: [NONE]
* Read/write capacity mode: On-demand

* Global Secondary Indexes -> Create Index-
  * Partition Key: ns [String]
  * Sort Key: toc [Number]
  * Index Name: namespace-index
  * Projected Attributes: all

* After Table is Created-
* Overview -> Table details -> Time to live attribute -> Manage TTL
    * Time to live attribute: toe

Table Structure [For Url-Info-Data]
---------------
* p (String)           -> [Partition Key] Domain for this URL
* id (String)          -> [Sort Key] Key for this Url + '&' + Namespace-ID
* ns (String)          -> Namespace-ID (Brand-ID/Deployment-ID/...)
* ol (String)          -> Original Url, which is to be Mapped
* ex (Integer)         -> Expiry of the Newly Constructed Url (In minutes)
* sd (Set)             -> Supplementary Data (Additional Data related to Url (Save as-it-is along with Url-Info-Data) )
* toc (Number)         -> Time of Creation of this Url (Unix Time)
* toe (Number)         -> Time of Expiry for this Url (Unix Time)
