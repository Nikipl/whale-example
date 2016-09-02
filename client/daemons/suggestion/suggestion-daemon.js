var storage = require('storage');
var inventory = require('inventory');
var http = require('http');


function State(items, used) {
  this.items = items
  this.isUsed = used

  this.addItem = function (item) {
    return new State(items.concat([item]), used);
  }
  this.removeItem = function (item) {
    var index = items.indexOf(item);
    var newItems = (function () {
      if (index > -1) {
        var itemsCopy = items.slice(0);
        itemsCopy.splice(index, 1);
        return itemsCopy;
      } else {
        return items;
      }
    })();
    return new State(newItems, used);
  }
  this.markAsUsed = function () {
    return new State(items, true);
  }
}

function handleEvent(event) {
  var receiptId = event.receiptId;
  var savedState = storage.get("suggestion-process-"+receiptId);
  var state = savedState || new State([], false);
  var newState = processEvent(event, state)
  storage.set("suggestion-process-"+receiptId, newState)
}
/*
  Возвращает массив строковых идентификаторов предложенных товаров
*/
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
      return state;
    case 'evo.receipt.productAdded':
      if (state.isUsed) {
        return state;
      } else {
        var nextState = state.addItem(event.productId);
        var suggestions = generateSuggestions(event.receiptId, nextState.items);
        storage.set("receipt-suggestions-"+event.receiptId, suggestions);
        return nextState;
      }
    case 'evo.receipt.productRemoved':
      if (state.isUsed) {
        return state;
      } else {
        var nextState = state.removeItem(event.productId);
        var suggestions = generateSuggestions(event.receiptId, nextState.items);
        storage.set("receipt-suggestions-"+event.receiptId, suggestions);
        return nextState;
      }
    case 'app.suggestion.used':
      return state.markAsUsed();
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
