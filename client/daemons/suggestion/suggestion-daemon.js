var storage = require('storage');
var inventory = require('inventory');
var http = require('http');

var StateFactory = {
  initialState: function () {
    return new State([], false);
  },
  fromJson: function (json) {
    var data = JSON.parse(json);
    return new State(data.items, data.used);
  }
}

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

  this.toJson = function () {
    return JSON.stringify({
      items: items,
      used: used
    });
  }
}

function handleEvent(event) {
  var receiptId = event.receiptId;
  var savedData = storage.get("suggestion-process-"+receiptId);
  var state = (function () {
    return savedData ? StateFactory.fromJson(savedData) : StateFactory.initialState();
  })();
  var newState = processEvent(event, state)
  storage.set("suggestion-process-"+receiptId, newState.toJson());
}
/*
  Возвращает массив строковых идентификаторов предложенных товаров
*/
function generateSuggestions(receiptId, items) {
  var response = http.send({
    method : "POST",
    path : "recommendations",
    body : items
  })
  return response.body.products;
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
        storage.set("receipt-suggestions-"+event.receiptId, Json.stringify(suggestions));
        return nextState;
      }
    case 'evo.receipt.productRemoved':
      if (state.isUsed) {
        return state;
      } else {
        var nextState = state.removeItem(event.productId);
        var suggestions = generateSuggestions(event.receiptId, nextState.items);
        storage.set("receipt-suggestions-"+event.receiptId, JSON.stringify(suggestions));
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
