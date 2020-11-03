
/*!
* Gdprx - Simple GDPR compliant cookie and policy consent v1.0.0
* https://github.com/woptima/gdprx
*
* Copyright 2018, Alberto Miconi
* Released under the MIT license
*/
var $ = jQuery.noConflict();

function _setCookie(name,value,days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
function _getCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function GdprxGetCookie() {
	var cookieVal = _getCookie('gdprx');
	if(cookieVal != undefined) {
		window.gdprxValues = JSON.parse(atob(cookieVal));
	}
}

function Gdprx(options) {

	var $this = this;
	this.cookieName	= "gdprx";
	this.gdprxValues = {
		accepted: false,
		cookiesAccepted: [],
		cookiesDenied: []
	};

	this.init = function() {
		$this.watchers();
		$this.cookieGet();
		$this.generateMarkup();
		$this.appendModal();

		if(!$this.gdprxValues.accepted) {
			$this.loadBar();
		}
	}
	
	this.config = {
		bar_text: "This site uses cookies, you can set you preferences through the settings panel",
		cookie_groups: [
		{
			title: "Required",
			cookies: [
			"phpsession",
			"gdprx",
			],
			required: true,
			default: true,
			info: "Used for a correct uer experience"
		}
		],
		policies: [
		{
			title: "Privacy policy",
			info: "Privacy policy",
			url: ""
		}
		],
		labels: {
			panel_title: "Privacy preferences",
			cookies: "Cookies",
			used_cookies: "Used cookies",
			policies: "Policies",
			required: "Required",
			preferences: "Preferences",
			accept: "Accept",
			view: "View",
			save: "Save"
		},
		ajax: {
			enable: false,
			url: "",
			parameters: {}
		}
	}

	// ovverride default config options
	$.extend(true, $this.config, options);

	this.createSwitch = function(group) {
		if(group.required) {
			return '<div class="required-label">' + $this.config.labels.required +'</div>';
		} else {
			var checked = group.default == true && $this.gdprxValues.cookiesDenied.indexOf(group.title) == -1 ? "checked" : "";
			return  '<label class="gdprx-switch">' +
			'<input type="checkbox" class="gdprx-cookie-check" data-group="' + group.title + '" name="cookies-' + group.title +'" '+ checked +'>' +
			'<span class="gdpr-slider round"></span>' +
			'<span class="gdpr-switch-indicator-on">ON</span>' +
			'<span class="gdpr-switch-indicator-off">OFF</span>' +
			'</label>';
		}
	}

	this.createPoliciesNav = function(policies) {
		if(policies.length > 0) {
			return  '<li data-content="cont-policies" class="active">' + 
			$this.config.labels.policies +
			'</li>';
		} else {
			return;
		}
	}

	this.createPoliciesTab = function(policies) {
		if(policies.length > 0) {
			var output = '<div class="content-tab active" id="cont-policies">' +
			'<div class="policies-title">' + $this.config.labels.policies + '</div>';
			policies.forEach(function(policy, index) {
				output +=   '<div class="cookie-panel">' +
				'<div class="head">' +
				policy.title +
				'<div class="switch"><div class="required-label">' + $this.config.labels.required +'</div></div>' +
				'</div>' +
				'<div class="body">' +
				'<div>' + policy.info + '</div>' +
				'<div class="buttons"><a href="' + policy.url + '" target="_blank" class="btn view">' + $this.config.labels.view + '</a></div>' +
				'</div>' +
				'</div>';
			});

			output += 	'</div>';
			return output;
		} else {
			return;
		}	
	}

	this.createPoliciesLinks = function(policies) {
		if(policies.length > 0) {
			var output = "";
			policies.forEach(function(policy, index) {
				output +=   '<li>' +
				'<a href="' + policy.url + '" target="_blank">' + policy.title + '</a>' +
				'</li>';
			});
			return output;
		} else {
			return;
		}
	}

	this.createCookieNav = function(cookie_groups) {
		var output = "";
		cookie_groups.forEach(function(group, index) {
			index++;
			active = index == 1 && $this.config.policies.length <= 0 ? "active" : "";
			output +=   '<li data-content="cont-' + index +'" class="content-tab ' + active + '">' +
			group.title +
			'</li>';
		});
		return output;
	}

	this.createCookieTabs = function(cookie_groups) {
		var output = "";
		cookie_groups.forEach(function(group, index) {
			index++;
			active = index == 1 && $this.config.policies.length <= 0 ? "active" : "";
			output +=   '<div class="content-tab ' + active + '" id="cont-'+ index +'">' +
			'<div class="cookie-title">' + group.title + '</div>' +
			'<div class="cookie-subtitle">' + group.info + '</div>' +
			'<div class="cookie-panel">' +
			'<div class="head">' +
			$this.config.labels.used_cookies +
			'<div class="switch">' + $this.createSwitch(group) + '</div>' +
			'</div>' +
			'<div class="body">' + group.cookies.join(', ') + '</div>' +
			'</div>' +
			'</div>';
		});
		return output;
	}

	this.generateMarkup = function() {
		$this.bar = '<div id="gdprx-bar" class="gdprx">' +
		'<div class="content">' + $this.config.bar_text + '</div>' +
		'<div class="buttons">' +
		'<button class="preferences">' + $this.config.labels.preferences + '</button>' +
		'<button class="accept">' + $this.config.labels.accept + '</button>' +
		'</div>' +
		'</div>';

		$this.modal = '<div id="gdprx-modal" class="gdprx">' +
		'<div class="modal-content">' +
		'<div class="title">' + $this.config.labels.panel_title + '<div class="close">X</div></div>' +
		'<div class="cookies">' +
		'<div class="navs">' +
		'<ul class="cookies-nav">' +
		$this.createPoliciesNav($this.config.policies) +
		'<li class="list-title">' + $this.config.labels.cookies + '</li>' +
		'<ul class="cookie-list">' +
		$this.createCookieNav($this.config.cookie_groups) +
		'</ul>' +
		'</ul>' +
		'<ul class="policies">' +
		$this.createPoliciesLinks($this.config.policies) +
		'</ul>'+
		'</div>' +
		'<div class="content">' +
		$this.createPoliciesTab($this.config.policies) +
		$this.createCookieTabs($this.config.cookie_groups) +
		'<div class="buttons"><button class="btn save">' + $this.config.labels.save + '</button></div>';
		'</div>' +
		'</div>' +
		'</div>' +
		'</div>';
	}
	

	this.watchers = function() {
		// accept
		$(document)
		.on('click','#gdprx-bar button.accept', function(e) {
			$this.accept()
		})
		// preferences
		.on('click','#gdprx-bar button.preferences', function(e) {
			$this.openModal();
		})
		.on('click','.gdprx-modal-opener', function(e) {
			$this.openModal();
		})
		// close modal
		.on('click','#gdprx-modal .title .close', function(e) {
			$this.closeModal();
		})
		// save preferences
		.on('click','#gdprx-modal .btn.save', function(e) {
			$this.savePreferences();
		})
		// tabs
		.on('click','#gdprx-modal .cookies-nav li[data-content]', function(e) {
			var btn 	= $(this);
			var content = btn.attr('data-content');
			$('#gdprx-modal .cookies-nav > li, #gdprx-modal .content-tab').removeClass('active');
			btn.addClass('active');
			$('#' + content).addClass('active');
		});
	}

	this.appendModal = function() {
		var modal = $($this.modal);
		modal.appendTo('body');
	}

	this.cookieSet = function() {
		window.gdprxValues = $this.gdprxValues;
		var value = btoa(JSON.stringify($this.gdprxValues));
		_setCookie($this.cookieName, value, 365);
	}

	this.cookieGet = function() {
		var cookieVal = _getCookie($this.cookieName);
		if(cookieVal != undefined) {
			$this.gdprxValues = JSON.parse(atob(cookieVal));
		}
		window.gdprxValues  = $this.gdprxValues;
	}

	this.loadBar = function() {
		var bar = $($this.bar);
		bar.appendTo('body');
		setTimeout(function() {
			bar.addClass('active')
		}, 300);
	}

	this.closeBar = function() {
		$('#gdprx-bar').removeClass('active'); 
	}

	this.accept = function() {
		$this.savePreferences();
	}

	this.openModal = function() {
		var modal = $('#gdprx-modal');
		if(!modal.hasClass('active')) {
			modal.addClass('visible');
			setTimeout(function() {
				modal.addClass('active');
			}, 100);
		}
	}

	this.closeModal = function() {
		if($('#gdprx-modal').length) {
			var modal = $('#gdprx-modal');
			modal.removeClass('active');
			setTimeout(function() {
				modal.removeClass('visible');
			}, 500);
		}
	}

	this.savePreferences = function() {
		$this.gdprxValues.cookiesAccepted 	= [];
		$this.gdprxValues.cookiesDenied 	= [];
		$this.gdprxValues.accepted 			= true;

		$this.config.cookie_groups.forEach(function(group, index) {
			if(group.required) {
				$this.gdprxValues.cookiesAccepted.push(group.title);
			}
		});

		$('input.gdprx-cookie-check').each(function(index, el) {
			var check  = $(this);
			var group  = check.attr('data-group'); 
			if(check.is(':checked')) {
				$this.gdprxValues.cookiesAccepted.push(group);
			} else {
				$this.gdprxValues.cookiesDenied.push(group);
			}
		});

		if($this.config.ajax.enable) {
			$this.ajax();
		}

		$this.cookieSet();
		$this.closeModal();
		$this.closeBar();

		$(document).trigger("gdprxAccepted");
	}

	this.ajax = function() {
		var data 	 = $this.config.ajax.parameters;
		data["gdpr"] = $this.gdprxValues;
		$.post( $this.config.ajax.url, data );
	}

	this.init();

}

if (typeof exports === 'object') {
	module.exports.gdprx = Gdprx;
}

	