var storage = require('storage')
var inventory = require('inventory')
var rpc = require('rpc')

function handleEvent(event, correlationId) {
  var receiptId = correlationId
  var state = storage.get("suggestion-process-"+receiptId)
  var newState = processEvent(event, state)
  storage.set("suggestion-process-"+receiptId, newState)
}

function processEvent(event, state) {
  switch (event.type) {
    case 'evo.receipt.opened':
      state
    case 'evo.receipt.productAdded':
      if (state.finished) {
        state
      } else {
        var nextState = state.addItem(event.productId)
        var suggestions = rpc.call("getSuggestions")({
          receiptId: event.receiptId
          items: nextState.items
        })
        storage.set("receipt-suggestions-"+event.receiptId, suggestions)
        nextState
      }
    case 'evo.receipt.productRemoved':
      var nextState = state.removeItem(event.productId)
      var suggestions = rpc.call("getSuggestions")({
        receiptId: event.receiptId
        items: nextState.items
      })
      storage.set("receipt-suggestions-"+event.receiptId, suggestions)
      nextState
    case 'app.suggestion.used':
      state.markAsUsed
    case 'evo.receipt.closed':
      rpc.call("finalReceipt")({
        receiptId: event.receiptId
        items: state.items
      })
      state
  }
}
