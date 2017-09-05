(function($) {
	'use strict';

	$.fn.FormEZ = function(settings) {
		this.FormEZ = new FormEZ(this, settings);
		return this;
	};

	var FormEZ = window.FormEZ || {};

	FormEZ = (function() {
		var inID = 0;

		function FormEZ(form, settings) {
			var _f = this;

			_f.defaults = {
				transform: true,
				rules: {},
				action: '',
				submitCallbacks: {},
				inputEvents: 'keyup change blur focus'
			};

			_f.initials = {
				formValidationRules: {}
			};
			$.extend(_f, _f.initials);

			_f.settings = $.extend({}, _f.defaults, settings);

			_f.form = $(form);
			_f.formID = '#' + _f.form.attr('id');
			_f.formName = _f.formID.toLowerCase().replace(/[-_#]/g, '');
			_f.instance = inID++;

			_f.init();
		};

		return FormEZ;
	}());

	FormEZ.prototype.init = function() {
		var t = this,
			s = t.settings;

		if (t.settings.transform) {
			t.build();
		}
		t.setEvents(s.inputEvents);
	};

	FormEZ.prototype.reinit = function() {
		return;
	};

	FormEZ.prototype.build = function() {
		var _f = this,
			s = _f.settings,
			formID = _f.formID,
			labels = s.labels,
			errors = s.errors,
			layout = s.layout,
			rules = s.rules,
			inputs = $(
				_f.form.children(
					'input,select,textarea'
				)
				.not(
					'[type="submit"],[id*="submit"],[class*="submit"]'
				)
			),
			i, j,
			classes = {
				1: 'twelve',
				2: 'six',
				3: 'four',
				4: 'three',
				6: 'two',
				12: 'one'
			},
			cols = parseInt(layout.columns),
			colClass = classes[layout.columns];

		var rows = Math.ceil(inputs.length / cols);

		for (i = 0; i < rows; i++) {
			var row = $(document.createElement('div')).addClass('row ' + (i + 1)),
				containers = [];

			for (j = i * cols; j < Math.min(cols + (i * cols), inputs.length); j++) {
				var input = inputs[j],
					id = $(input).attr('id'),
					text = labels[id],
					error = errors[id],
					required = rules[id].required,
					container = $(document.createElement('div')).addClass(colClass + ' columns');

				var label = $(document.createElement('label')).attr('for', id).text(text);
				if (required) {
					var span = $(document.createElement('span')).addClass('required').text('*');
					label.append(span);
				}
				container.append(label);

				$(input).insertAfter(label);

				var error = $(document.createElement('span')).addClass('error').attr('id', id + '-error').text(error);;
				container.append(error);

				row.append(container);
			}

			$(formID).append(row).append($(formID).find('input[type="submit"]'));
		}
	};

	FormEZ.prototype.setEvents = function(inputEvents) {
		var _f = this,
			id = _f.formID,
			s = _f.settings,
			rules = s.rules,
			data = {formEZ: _f};

		$(_f.formID).on('submit', data, _f.submit);

		$(
			_f.formID + ' input:not([type="hidden"],[type="submit"]),' + 
			_f.formID + ' textarea,' + 
			_f.formID + ' select'
		).on(inputEvents, data, _f.validate);
	};

	FormEZ.prototype.destroy = function() {
		return;
	};

	FormEZ.prototype.prepareFormData = function() {
		var formArray = $(this.formID).serializeArray();
	  	var returnArray = {};
	  	for (var i = 0; i < formArray.length; i++) {
	    	returnArray[formArray[i]['name']] = formArray[i]['value'];
		}
		return returnArray;
	};

	FormEZ.prototype.POST = function(data, callbacks, url, async) {
		$.ajax({
			type: "POST",
			url: url || '',
			data: data || {},
			async: async || true,
			beforeSend: callbacks.AJAXBefore || function(xhr, settings) {return;},
			error: callbacks.AJAXError || function(xhr, eCode, ex) {return;},
			dataFilter: callbacks.AJAXFilter || function(data, dataType) {return data;},
			success: callbacks.AJAXSuccess || function(data, sCode, xhr) {return;},
			complete: callbacks.AJAXAfter || function(xhr, code) {return;}
		});
	};

	FormEZ.prototype.setFormInputInvalid = function(input) {
		input.removeClass('valid').addClass('invalid');

		var error = $('#' + input.attr('id') + '-error');
		if (error.length) {
			error.addClass('visible');
		}
	};
	FormEZ.prototype.setFormInputValid = function(input) {
		input.removeClass('invalid').addClass('valid');

		var error = $('#' + input.attr('id') + '-error');
		if (error.length) {
			error.removeClass('visible');
		}
	};
	FormEZ.prototype.isFormElementValid = function(input) {
		return input.hasClass('valid');
	};

	FormEZ.prototype.toggleSubmitButton = function() {
		var valid = [],
			_f = this,
			id = _f.formID;

		$(id + ' input:not(:hidden,[type="submit"]), ' + id + ' textarea,' + id + ' select').each(
			function() {
				valid.push(_f.isFormElementValid($(this)));
			}
		);

		var submit = $(id + '-submit').length ? $(id + '-submit') : $(id).find('input[type="submit"]');
		submit.prop('disabled', valid.indexOf(false) !== -1);
	};

	FormEZ.prototype.submit = function(event) {
		event.preventDefault();
		event.stopPropagation();

		var _f = event.data.formEZ;

		if (typeof _f.settings.submitCallbacks.beforeAJAX === 'function') {
			_f.settings.submitCallbacks.beforeAJAX();
		}

		_f.POST(
			_f.prepareFormData(),
			_f.settings.submitCallbacks,
			_f.settings.action
		);
	};

	FormEZ.prototype.validate = function(event) {
		var	input = $(this),
			name = input.attr('name'),
			val = input.val().trim(),
			_f = event.data.formEZ,
			rule = _f.settings.rules[name],
			required = input.hasClass('element-required') || rule.required,
			empty = (val == '' || val.length === 0);

		if (required && empty) {
			_f.setFormInputInvalid(input);
		}
		else {
			if (rule.type === 'invalid') {
				if (rule.pattern().test(val)) {
					_f.setFormInputInvalid(input);
				}
				else {
					_f.setFormInputValid(input);
				}
			}
			else {
				if (rule.pattern().test(val)) {
					_f.setFormInputValid(input);
				}
				else {
					_f.setFormInputInvalid(input);
				}
			}
		}
		_f.toggleSubmitButton();
	};
})(jQuery);