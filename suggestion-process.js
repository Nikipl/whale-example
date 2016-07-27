val storage = require('storage')
val inventory = require('inventory')
val rpc = require('rpc')

function handleEvent(event, correlationId) {
  val receiptId = correlationId
  val state = storage.get("suggestion-process-"+receiptId)
  val newState = processEvent(event, state)
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
        val nextState = state.addItem(event.productId)
        val suggestions = rpc.call("getSuggestions")({
          receiptId: event.receiptId
          items: nextState.items
        })
        storage.set("receipt-suggestions-"+event.receiptId, suggestions)
        nextState
      }
    case 'evo.receipt.productRemoved':
      val nextState = state.removeItem(event.productId)
      val suggestions = rpc.call("getSuggestions")({
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
