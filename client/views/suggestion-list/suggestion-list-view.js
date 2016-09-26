var EventsService = function() {
  var service = this;
  this.callbacks = {};
  this.forced = {};
  this.obj = {};

  this.methods = {
    set : function(param, value) {
      // console.warn('set', param, 'to', value);
      service.checkParam(param, value);
      service.obj[param] = value;
    },
    subscribe : function(param, callback, forced) {
      //console.warn('subscribe', param);
      service.callbacks[param] = service.callbacks[param] || [];
      service.callbacks[param].push(callback);

      if (forced) {
        service.forced[param] = true;
      }
    }
  }

  this.checkParam = function(param, value) {
    if (this.obj[param] != value || this.forced[param]) {
      this.emit(param, value);
    }
  }
  this.emit = function(param, value) {
    if (!this.callbacks[param]) return;
    for (i in this.callbacks[param]) {
      this.callbacks[param][i](value);
    }
  }
  return this.methods;
},
eventsService = new EventsService(),
misc = {
  createElem : function(elemName, className, text) {
      var el = document.createElement(elemName);
      el.className = className;
      el.innerText = text || '';
      return el;
  },
  makePrice : function(price) {
    return price + ' ₽';
  }
};

window.onload = function() {
    var bindings = {
    // id : { ...bindings }
    }
    var root = document.getElementById('root'),
      title,
      container;

    var build = function() {
      container = misc.createElem('div', 'container');
      root.appendChild(container);
      var suggestedProducts = context.data.suggestions;
      for (var i in suggestedProducts) {
      var prod = suggestedProducts[i];
        a = misc.createElem('div', 'each-product');
        a.id = prod.id;
        text = misc.createElem('span', 'product__title', prod.name);
        buttons_container = misc.createElem('span', 'product__buttons-container');

        decr_button = misc.createElem('span', 'product__button remove listened-button inactive', '-');
        decr_button.productId = prod.id;
        decr_button.actionType = 'remove';
        decr_button.addEventListener('click', listeners.buttonIncDecr, false);

        counter = misc.createElem('span', 'product__counter inactive', '0');

        price = misc.createElem('span', 'product__price', prod.price);

        incr_button = misc.createElem('span', 'product__button add listened-button', '+');
        incr_button.productId = prod.id;
        incr_button.actionType = 'add';
        incr_button.addEventListener('click', listeners.buttonIncDecr, false);

        next_button = misc.createElem('button', 'next-button', 'Итого');
        next_button.addEventListener('click', listeners.buttonNext, false);

        (function(prod, inc_button, decr_button, counter) {
          eventsService.subscribe(prod.id, function(value) {
            if (!value || value <= 0) {
                if (decr_button.className.match('inactive')) return;
                decr_button.className += ' inactive';
                counter.innerText = 0;
                counter.className = counter.className += ' inactive';
            } else {
                decr_button.className = decr_button.className.replace(' inactive', '');
                counter.innerText = value || 0;
                counter.className = counter.className.replace(' inactive', '');
            }
          }, true);
        })(prod, incr_button, decr_button, counter);

        buttons_container.appendChild(decr_button);
        buttons_container.appendChild(counter);
        buttons_container.appendChild(incr_button);
        a.appendChild(text);
        a.appendChild(price);
        a.appendChild(buttons_container);
        container.appendChild(a);
      }

      final_price = misc.createElem('span', 'final-price', misc.makePrice(0));

      root.appendChild(next_button);
      next_button.appendChild(final_price);

      eventsService.subscribe('change', function() {
            var _final_price = 0;
            for (var i in suggestedProducts) {
              if (receipt.products[suggestedProducts[i].id]) {
                _final_price += suggestedProducts[i].price * receipt.products[suggestedProducts[i].id];
              }
            }
            final_price.innerText = misc.makePrice(_final_price);
      }, true);
    }

    var receipt = context.receipts.getById(context.data.receiptId);
    var listeners = {
      buttonIncDecr : function(evt) {
        var target = evt.currentTarget;
        receipt[target.actionType](target.productId);
        eventsService.set(target.productId, receipt.products[target.productId]);
        eventsService.set('change', true);
      },
      buttonNext : function() {
        console.log(receipt);
        context.navigation.pushNext();
      }
    }
    build();
};
