/*
	TITLE: ModalWindow

	DESCRIPTION: Base class to create modal windows

	VERSION: 0.2.0

	USAGE: var myModalWindow = new ModalWindow('Elements', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHOR: CN

	DEPENDENCIES:
		- jQuery 2.1.4+
		- Class.js

*/

var ModalWindow = Class.extend({
	init: function($triggers, objOptions) {

		// defaults
		this.$document = $(document);
		this.$body = $('body');
		this.$elTriggers = $triggers;
		this.options = $.extend({
			//selectorTriggers: 'a.modal-trigger',
			modalID: 'modalwindow',
			modalClass: 'modalwindow',
			extraClasses: '',
			overlayID: 'modaloverlay',
			closeBtnClass: 'btn-closeX',
			closeBtnInnerHTML: '<span>X</span>', //ex: '<span class="offscreen">close window</span>'
			activeClass: 'active',
			activeBodyClass: 'modal-active',
			animDuration: 400,
			customEventPrfx: 'CNJS:ModalWindow'
		}, objOptions || {});

		// element references
		this.$elActiveTrigger = null;
		this.$elOverlay = null;
		this.$elModal = null;
		this.$elContent = null;
		this.$btnClose = null;

		// setup & properties
		this.isModalActivated = false;
		this.contentHTML = null;

		this.initDOM();

		this.bindEvents();

	},


/**
*	Private Methods
**/

	initDOM: function() {

		//create overlay
		this.$elOverlay = $('#' + this.options.overlayID);
		if (!this.$elOverlay.length) {
			this.$elOverlay = $('<div></div>',{
				'id': this.options.overlayID
			}).appendTo(this.$body);
		}

		//create modal
		this.$elModal = $('#' + this.options.modalID);
		if (!this.$elModal.length) {
			this.$elModal = $('<div></div>', {
				'id': this.options.modalID,
				'class': this.options.modalClass + ' ' + this.options.extraClasses,
				'role': 'dialog',
				'tabindex': '-1'
			});
		}

		//create modal content
		this.$elContent = this.$elModal.find('.' + this.options.modalClass + '-content');
		if (!this.$elContent.length) {
			this.$elContent = $('<div></div>', {
				'class': this.options.modalClass + '-content'
			}).appendTo(this.$elModal);
		}

		//insert close button
		this.$btnClose = this.$elModal.find('.' + this.options.closeBtnClass);
		if (!this.$btnClose.length) {
			this.$btnClose = $('<a></a>', {
				'class': this.options.closeBtnClass,
				'href': '#close',
				'title': 'close'
			}).html(this.options.closeBtnInnerHTML).appendTo(this.$elModal);
		}

		//insert into DOM
		this.$elModal.insertAfter(this.$elOverlay);

	},

	bindEvents: function() {
		var self = this;

		this.$elTriggers.on('click', function(event) {
			event.preventDefault();
			if (!self.isModalActivated) {
				self.$elActiveTrigger = $(this);
				self.openModal();
			}
		});

		this.$btnClose.on('click', function(event) {
			event.preventDefault();
			if (self.isModalActivated) {
				self.closeModal();
			}
		});

		this.$elOverlay.on('click', function(event) {
			if (self.isModalActivated) {
				self.closeModal();
			}
		});

		this.$document.on('focusin', function(event) {
			if (self.isModalActivated && !self.$elModal[0].contains(event.target)) {
				self.$elModal.focus();
			}
		});

		this.$document.on('keydown', function(event) {
			if (self.isModalActivated && event.keyCode === 27) {
				self.closeModal();
			}
		});

	},


/**
*	Public Methods
**/

	// extend or override getContent in subclass to create custom modal
	getContent: function() {
		var targetID = this.$elActiveTrigger.data('targetid') || this.$elActiveTrigger.attr('href').replace('#','');
		var targetEl = $('#' + targetID);
		this.contentHTML = targetEl.html();
		this.setContent();
	},

	setContent: function() {
		this.$elContent.html(this.contentHTML);
	},

	openModal: function() {
		var self = this;

		this.isModalActivated = true;

		this.getContent();

		this.$body.addClass(this.options.activeBodyClass);
		this.$elOverlay.show();
		this.$elModal.show();

		setTimeout(function() {

			this.$elOverlay.addClass(this.options.activeClass);
			this.$elModal.addClass(this.options.activeClass);

			setTimeout(function() {
				this.$elModal.focus();
				$.event.trigger(this.options.customEventPrfx + ':modalOpened', [this.options.modalID]);
			}.bind(this), this.options.animDuration);

		}.bind(this), 10);

	},

	closeModal: function() {
		var self = this;

		this.$body.removeClass(this.options.activeBodyClass);
		this.$elOverlay.removeClass(this.options.activeClass);
		this.$elModal.removeClass(this.options.activeClass);

		setTimeout(function() {
			this.isModalActivated = false;
			this.$elOverlay.hide();
			this.$elModal.hide();
			this.$elContent.empty();
			this.$elActiveTrigger.focus();
			$.event.trigger(this.options.customEventPrfx + ':modalClosed', [this.options.modalID]);
		}.bind(this), this.options.animDuration);

	}

});

//uncomment to use as a browserify module
//module.exports = ModalWindow;
