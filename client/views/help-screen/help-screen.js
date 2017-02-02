function Storage() {
	this.get = function(key) {
		return localStorage.getItem(key);
	}

	this.set = function(key, value) {
		localStorage.setItem(key, value)
	} 
}

var storage = new Storage();

(function() {

	var variables = {
		screens : {
			preload : '#preload',
			preload_error : '#preload_error',
			form : '#form',
			success : '#success'
		},
		forms : {
			submit_form : '#submit_form'
		},
		default_values : {
			email : null
		},
		form_field : {
			email : '#email'
		},
		form_errors : {
			no_connection : '#no_connection',
			wrong_email : '#wrong_email'
		},
		buttons : {
			preload_error_resend : '#preload_error_resend',
			form_button : '#form_button',
			success_close : '#success_close'
		},
		currentScreen : '#preload'
	}

	var methods = {
		init : function () {

			methods.preload();
			methods.setHandlers();

		},
		preload : function () {

			// setTimeout(() => {

				var response = http.send({
				    method : "POST",
				    path : "remote/cto-get-email",
				    body : {}
				});
				var jsonObject = JSON.parse(response);
				
				log.log("POST remote/cto-get-email response " + response);
				
				// response = {
				// 	email : 'priwlo@yra.ru',
				// 	result : 0
				// };

				if (response.email || response.result == 59) {
					variables.default_values.email = response.email;
					variables.default_values.email = variables.default_values.email || storage.get('vnc_help_email');

					methods.changeToView(variables.screens.form, () => {
						$(variables.form_field.email).val(variables.default_values.email);
					});

				} else if (response.result) {
					methods.changeToView(variables.screens.preload_error);
				}

			// }, 500);
		},
		changeToView : function (view, cb) {
			console.log('changeToView', view);
			if (variables.currentScreen) {
				$(variables.currentScreen).removeClass('show');
			}
			variables.currentScreen = view;
			$(view).addClass('show');

			cb && cb();
		},
		sendForm : function() {
			var formValue = $(variables.forms.submit_form).serializeArray()
			console.log(formValue);

			let email = formValue[0].value;

			console.log(email);

			if (!email || !email.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/gi)) {
				
				initError('wrong_email');

			} else {

				// setTimeout(() => {

				var response = http.send({
				    method : "POST",
				    path : "remote/cto-help",
				    body: {
				    	email : email
				    }
				});
				log.log("POST remote/cto-help response " + response);
				
					// response = {
					// 	result : 0
					// }

					if (!response) {

						initError('no_connection');

					} else {

						var jsonObject = JSON.parse(response);

						if (!response.result) {
							storage.set('vnc_help_email', email);
							methods.changeToView(variables.screens.success, () => {

								setTimeout(() => {
									navigation.pushNext();
								}, 5000);
							});		

						} else {
							
							initError('no_connection');

						}
					}

				// }, 500);
			}

			function initError(type) {
				$(variables.form_field.email).addClass('invalid');
				$(variables.form_errors[type]).addClass('show');
				$('form .base-text').removeClass('show');

				setTimeout(() => {
					$(variables.form_field.email).removeClass('invalid');
					$(variables.form_errors[type]).removeClass('show');
					$('form .base-text').addClass('show');

					$(variables.form_field.email).focus();
				}, 5000);
			}
		},
		setHandlers : function() {
			$(document).on('click', variables.buttons.preload_error_resend, (event) => {
				methods.changeToView(variables.screens.preload, () => {
					this.preload();
				});
			});

			$(document).on('click', variables.buttons.success_close, (event) => {
				navigation.pushNext();
			});

			$(document).on('submit', variables.forms.submit_form, (event) => {
				event.preventDefault();
				this.sendForm(event);
			});
		}
	}

	methods.init();

})();