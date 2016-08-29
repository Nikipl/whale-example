var storage = require('storage');
var inventory = require('inventory');
var http = require('http');

function handleEvent(event) {
  var receiptId = event.receiptId
  var state = storage.get("suggestion-process-"+receiptId)
  var newState = processEvent(event, state)
  storage.set("suggestion-process-"+receiptId, newState)
}

function generateSuggestions(receiptId, items) {
  var response = http.send({
    method : "POST",
    path : "suggestions",
    body : {
      receiptId : receiptId,
      items: items
    }
  })
  return response.body;
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
        var suggestions = generateSuggestions(event.receiptId, nextState.items);
        storage.set("receipt-suggestions-"+event.receiptId, suggestions)
        return nextState;
      }
    case 'evo.receipt.productRemoved':
      if (state.finished) {
        return state;
      } else {
        var nextState = state.removeItem(event.productId)
        var suggestions = generateSuggestions(event.receiptId, nextState.items);
        storage.set("receipt-suggestions-"+event.receiptId, suggestions)
        return nextState
      }
    case 'app.suggestion.used':
      return state.markAsUsed;
    case 'evo.receipt.closed':
      http.send({
        method : "POST",
        path : "receipts",
        body : {
          receiptId: event.receiptId,
          items: state.items
        }
      })
      return state;
  }
}
