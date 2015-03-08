/** Copyright 2014 kajjjak
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
     http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.


 This is a wrapper for IAP on Android and iOS Cordova projects
 Requires:
    - https://github.com/j3k0/PhoneGap-InAppPurchase-iOS 

  Notes:
    - http://troybrant.net/blog/2010/01/invalid-product-ids/
*/

function IAPStoreManager(){
    /*
        This class has information on what the buyer has purchased (by storing data to localStorage)
    */
    if (!window.storekit || window.androidstorekit){ throw "window.storekit library required"; }

    this.initialize = function(options, callback_initiated, callback_purchase, callback_restore, callback_failure){
      //should be called by device listener call
      if((!callback_initiated) || (!callback_purchase) || (!callback_restore) || (!callback_failure)){
          throw "IAPStoreManager not correctly initialized.";
      }
      var callback_initiated = callback_initiated;
      var callback_purchase = callback_purchase;
      var callback_restore = callback_restore;
      var callback_failure = callback_failure;
      this.options = options;
      window.storekit.init({

          debug: true, // Because we like to see logs on the console

          purchase: function (transactionId, productId, receipt) {
              // example data: transactionId="1000000142812737", productId="currency.ghostburster.iap02"
            callback_purchase(productId, transactionId, receipt);
            //this.callback_restore(productId, transactionId, receipt, false);
          },
          restore: function (transactionId, productId, transactionReceipt) {
            callback_restore(productId, transactionId, receipt, true);
          },
          restoreCompleted: function () {
             console.log('all restore complete');
          },
          restoreFailed: function (errCode, errorMessage) {
             callback_failure(errorCode, "Restore failed: " + errorMessage);
          },
          error: function (errorCode, errorMessage) {
             callback_failure(errorCode, errorMessage);
          },
          ready: function () {
              var self = this;
              window.storekit.load(options.inventory, function(validProducts, invalidProductIds) {
                  localStorage.setItem("store", JSON.stringify(validProducts));
                  $.each(validProducts, function (i, val) {
                      console.log("id: " + val.id + " title: " + val.title + " val: " + val.description + " price: " + val.price);
                  });
                  if(invalidProductIds.length) {
                      console.log("Invalid Product IDs: " + JSON.stringify(invalidProductIds));
                  }
                  callback_initiated(validProducts, invalidProductIds);
              });
          }
      });

    };

    this.buy = function(id){
        storekit.purchase(id);
    };
    this.restore = function () {
      storekit.restore();
    };    
}


/*

      if (!window.storekit){ return; }
      window.storekit.init({

          debug: true, // Because we like to see logs on the console

          purchase: function (transactionId, productId) {
              console.log('purchased: ' + productId);
          },
          restore: function (transactionId, productId) {
              console.log('restored: ' + productId);
          },
          restoreCompleted: function () {
             console.log('all restore complete');
          },
          restoreFailed: function (errCode) {
              console.log('restore failed: ' + errCode);
          },
          error: function (errno, errtext) {
              console.log('Failed: ' + errtext);
          },
          ready: function () {
              var productIds = [
                "ghostburster.currency1",
                "agc.ghostburster.currency100",
                "agc.ghostburster.currency200",
                "agc.ghostburster.currency300"
              ];
              window.storekit.load(productIds, function(validProducts, invalidProductIds) {
                  localStorage.setItem("store", JSON.stringify(validProducts));
                  $.each(validProducts, function (i, val) {
                      console.log("id: " + val.id + " title: " + val.title + " val: " + val.description + " price: " + val.price);
                  });
                  if(invalidProductIds.length) {
                      console.log("Invalid Product IDs: " + JSON.stringify(invalidProductIds));
                  }
              });
          }
      });

*/