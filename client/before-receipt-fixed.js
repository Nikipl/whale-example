var storage = require('storage')
var inventory = require('inventory')

function handleMoment(context, navigation) {
  var receipt = context.receipt
  var suggestion = storage.get("receipt-suggestions-"+receipt.id)
  var products =
    suggestion.products
    .map(productId => inventory.getProduct(productId))
    .filter(p => p.isAvailable)

  if (product.length > 0) {
    navigation.pushView("suggestions", {
      products: products,
      receipt: receipt
    })
  } else {
    navigation.pushNext
  }
}
