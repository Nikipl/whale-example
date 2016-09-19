var storage = require('storage')
var inventory = require('inventory')
var navigation = require('navigation')

function handleMoment(context, navigation) {
  var receipt = context.receipt
  var suggestions = JSON.parse(storage.get("receipt-suggestions-"+receipt.id));
  var suggestedProducts =
    suggestions
    .map(function getProduct(productUID){
             return inventory.getProduct(productUID);
         })
    .filter(p => p.isAvailable);
  if (suggestedProducts.length > 0) {
    navigation.pushView("view.html", {
      suggestions: suggestedProducts,
      receipt: receipt
    });
  } else {
    navigation.pushNext();
  }
}



