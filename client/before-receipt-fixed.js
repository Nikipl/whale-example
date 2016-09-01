var storage = require('storage')
var inventory = require('inventory')

function handleMoment(context, navigation) {
  var receipt = context.receipt
  var suggestions = storage.get("receipt-suggestions-"+receipt.id)
  var products =
    suggestions
    .map(productId => inventory.getProduct(productId))
    .filter(p => p.isAvailable)

  if (products.length > 0) {
    navigation.pushView("suggestions", {
      products: products,
      receipt: receipt
    })
  } else {
    navigation.pushNext
  }
}
