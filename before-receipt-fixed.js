var storage = require('storage')
var inventory

function handleMoment(receipt, navigation) {
  var suggestion = storage.get("receipt-suggestions-"+receipt.id)
  var products =
    suggestion.products.map(productId => inventory.getProduct(productId)).filter(_.available)

  if (product.length > 0) {
    navigation.push("suggestions", {
      products: products,
      receipt: receipt
    })
  } else {
    navigation.pushNext
  }

}
