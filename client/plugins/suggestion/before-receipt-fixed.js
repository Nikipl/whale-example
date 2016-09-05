var storage = require('storage')
var inventory = require('inventory')

function handleMoment(context, navigation) {
  var receipt = context.receipt
  var suggestions = JSON.parse(storage.get("receipt-suggestions-"+receipt.id));
  var suggestedProducts =
    suggestions
    .map(productId => inventory.getProduct(productId))
    .filter(p => p.isAvailable)

  if (suggestedProducts.length() > 0) {
    navigation.pushView("suggestion-list", {
      suggestions: suggestedProducts,
      receipt: receipt
    })
  } else {
    navigation.pushNext();
  }
}
