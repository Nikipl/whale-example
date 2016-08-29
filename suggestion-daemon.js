var storage = require('storage');
var inventory = require('inventory');
var http = require('http');

function handleEvent(event) {
  var receiptId = event.receiptId
  var state = storage.get("suggestion-process-"+receiptId)
  var newState = processEvent(event, state)
  storage.set("suggestion-process-"+receiptId, newState)
}

function processEvent(event, state) {
  switch (event.type) {
    case 'evo.receipt.opened':
      return state
    case 'evo.receipt.productAdded':
      if (state.finished) {
        return state;
      } else {
        var nextState = state.addItem(event.productId)
        var reponse = http.send({
          method : "POST", // default method
          path : "suggestion",
          body : {
            receiptId: event.receiptId,
            items: nextState.items
          }
        })
        var suggestions = response.body;
        storage.set("receipt-suggestions-"+event.receiptId, suggestions)
        return nextState;
      }
    case 'evo.receipt.productRemoved':
      var nextState = state.removeItem(event.productId)
      var response = http.send({
        method : "POST",
        path : "suggestion",
        body : {
          receiptId: event.receiptId,
          items: nextState.items
        }
      })
      var suggestions = response.body
      storage.set("receipt-suggestions-"+event.receiptId, suggestions)
      return nextState
    case 'app.suggestion.used':
      state.markAsUsed
    case 'evo.receipt.closed':
      http.send({
        method : "POST",
        path : "receipts",
        body : {
          receiptId: event.receiptId,
          items: state.items
        }
      })
      state
  }
}
