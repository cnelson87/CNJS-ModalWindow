/*
	TITLE: ModalWindow

	DESCRIPTION: Base class to create modal windows

	VERSION: 0.1.0

	USAGE: var myModalWindow = new ModalWindow('Elements', 'Options')
		@param {jQuery Object}
		@param {Object}

	AUTHORS: CN

	DEPENDENCIES:
		- jQuery 1.10+
		- greensock
		- Class.js

*/

var ModalWindow = Class.extend({
	init: function($triggers, objOptions) {

		// defaults
		this.$window = $(window);
		this.$document = $(document);
		this.$body = $('body');
		this.$elTriggers = $triggers;
		this.options = $.extend({
			//selectorTriggers: 'a.modal-trigger',
			modalID: 'modalwindow',
			modalClass: 'modalwindow',
			overlayID: 'modaloverlay',
			closeBtnClass: 'btn-closeX',
			closeBtnInnerHTML: '<span>X</span>', //ex: '<span class="offscreen">close window</span>'
			activeClass: 'active',
			leftOffset: 0,
			topOffset: 0,
			minTopSpacing: 10,
			animDuration: 0.2,
			animEasing: 'Power4.easeIn',
			fadeInOutSpeed: 200,
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
		this.isPosAbs = false; //position:absolute;
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
			}).appendTo(this.$body);//.hide();
		}

		//create modal
		this.$elModal = $('#' + this.options.modalID);
		if (!this.$elModal.length) {
			this.$elModal = $('<div></div>', {
				'id': this.options.modalID,
				'class': this.options.modalClass,
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
				'title': 'close window'
			}).html(this.options.closeBtnInnerHTML).appendTo(this.$elModal);
		}

		//insert into DOM
		this.$elModal.insertAfter(this.$elOverlay);//.hide();

		TweenMax.set(this.$elOverlay, {
			opacity: 0
		});

		TweenMax.set(this.$elModal, {
			opacity: 0
		});

		//top pos assumes position:fixed by defalt, if position:absolute then top pos gets trickier.
		this.isPosAbs = (this.$elModal.css('position') === 'absolute') ? true : false;

	},

	bindEvents: function() {
		var self = this;

		this.$elTriggers.on('click', function(event) {
			event.preventDefault();
			if (!self.isModalActivated) {
				self.$elActiveTrigger = $(this);
				self.__clickTrigger(event);
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
			if (self.isModalActivated && !self.$elModal.get(0).contains(event.target)) {
				self.$elModal.focus();
			}
		});

		this.$document.on('keydown', function(event) {
			if (self.isModalActivated && event.keyCode == 27) {
				self.closeModal();
			}
		});

		this.$window.on('resize', function(event) {
			self.setPosition();
		});

	},


/**
*	Event Handlers
**/

	__clickTrigger: function(event) {
		this.openModal();
	},


/**
*	Public Methods
**/

	setPosition: function() {
		var docWidth = this.$document.width();
		var winHeight = this.$window.height();
		var winScrollTop = this.$window.scrollTop();
		var modalWidth = this.$elModal.outerWidth();
		var modalHeight = this.$elModal.outerHeight();
		var minTopSpacing = this.options.minTopSpacing;
		var leftPos = (((docWidth - modalWidth) / 2) + this.options.leftOffset);
		var topPos = (((winHeight - modalHeight) / 2) + this.options.topOffset);

		if (this.isPosAbs) {
			topPos += winScrollTop;
			if (topPos < winScrollTop + minTopSpacing) {
				topPos = winScrollTop + minTopSpacing;
			}
		} else {
			if (topPos < minTopSpacing) {
				topPos = minTopSpacing;
			}
		}

		this.$elModal.css({left: leftPos + 'px', top: topPos + 'px'});

	},

	// extend or override getContent in subclass to create custom modal
	getContent: function() {
		var targetID = this.$elActiveTrigger.data('targetid') || this.$elActiveTrigger.attr('href').replace('#','');
		var targetEl = $('#' + targetID);
		this.contentHTML = targetEl.html();
		this.setContent();
	},

	// extend or override setContent in subclass to create custom modal
	setContent: function() {
		this.$elContent.html(this.contentHTML);
	},

	openModal: function() {
		var self = this;

		this.isModalActivated = true;

		self.getContent();

		this.setPosition();

		TweenMax.to(this.$elOverlay, this.options.animDuration, {
			display: 'block',
			opacity: 1,
			ease: self.options.animEasing,
			onComplete: function() {

				TweenMax.to(self.$elModal, self.options.animDuration, {
					display: 'block',
					opacity: 1,
					ease: self.options.animEasing,
					onComplete: function() {

						self.$elModal.addClass(self.options.activeClass);

						self.$elModal.focus();

						$.event.trigger(self.options.customEventPrfx + ':modalOpened', [self.options.modalID]);

					}
				});

			}
		});

	},

	closeModal: function() {
		var self = this;



		TweenMax.to(this.$elModal, this.options.animDuration, {
			//display: 'block',
			opacity: 0,
			ease: self.options.animEasing,
			onComplete: function() {
				self.$elModal.removeClass(self.options.activeClass);

				TweenMax.to(self.$elOverlay, self.options.animDuration, {
					//display: 'block',
					opacity: 0,
					ease: self.options.animEasing,
					onComplete: function() {

						TweenMax.set(self.$elModal, {
							display: 'none'
						});

						TweenMax.set(self.$elOverlay, {
							display: 'none'
						});

						self.$elActiveTrigger.focus();

						self.isModalActivated = false;

						$.event.trigger(self.options.customEventPrfx + ':modalClosed', [self.options.modalID]);

					}
				});

			}
		});

	}

});


//uncomment to use as a browserify module
//module.exports = ModalWindow;
