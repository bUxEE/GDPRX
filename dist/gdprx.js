
/*!
* Gdprx - Simple GDPR compliant cookie and policy consent v1.0.0
* https://github.com/woptima/gdprx
*
* Copyright 2018, Alberto Miconi
* Released under the MIT license
*/

class Gdprx {
	
	constructor(options) {
		this.cookieName = "gdprx";
		this.gdprxValues = {
			accepted: false,
			cookiesAccepted: [],
			cookiesDenied: []
		};

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

		this.config = Object.assign({}, this.config, options);

		this.watchers();
		this.cookieGet();
		this.generateMarkup();
		this.appendModal();

		if(!this.gdprxValues.accepted) {
			this.loadBar();
		}
	}

	_setCookie(name,value,days) {
		let expires = "";
		if (days) {
			let date = new Date();
			date.setTime(date.getTime() + (days*24*60*60*1000));
			expires = "; expires=" + date.toUTCString();
		}
		document.cookie = name + "=" + (value || "")  + expires + "; path=/";
	}
	
	_getCookie(name) {
		let nameEQ = name + "=";
		let ca = document.cookie.split(';');
		for(let i=0;i < ca.length;i++) {
			let c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}

	createWindowCookieMethod() {
		window.GdprxGetCookie = () => {
			let cookieVal = this._getCookie('gdprx');
			if(cookieVal != undefined) {
				window.gdprxValues = JSON.parse(atob(cookieVal));
			}
		}
	}

	createSwitch(group) {
		if(group.required) {
			return '<div class="required-label">' + this.config.labels.required +'</div>';
		} else {
			let checked = group.default == true && this.gdprxValues.cookiesDenied.indexOf(group.title) == -1 ? "checked" : "";
			return  '<label class="gdprx-switch">' +
			'<input type="checkbox" class="gdprx-cookie-check" data-group="' + group.title + '" name="cookies-' + group.title +'" '+ checked +'>' +
			'<span class="gdpr-slider round"></span>' +
			'<span class="gdpr-switch-indicator-on">ON</span>' +
			'<span class="gdpr-switch-indicator-off">OFF</span>' +
			'</label>';
		}
	}

	createPoliciesNav(policies) {
		if(policies.length > 0) {
			return  '<li data-content="cont-policies" class="active">' + 
			this.config.labels.policies +
			'</li>';
		} else {
			return;
		}
	}

	createPoliciesTab(policies) {
		if(policies.length > 0) {
			let output = '<div class="content-tab active" id="cont-policies">' +
			'<div class="policies-title">' + this.config.labels.policies + '</div>';
			policies.forEach((policy, index) => {
				output += '<div class="policies-panel">' +
				'<div class="head">' +
				policy.title +
				'<div class="switch"><div class="required-label">' + this.config.labels.required +'</div></div>' +
				'</div>' +
				'<div class="body">' +
				'<div>' + policy.info + '</div>' +
				'<div class="buttons"><a href="' + policy.url + '" target="_blank" class="btn view">' + this.config.labels.view + '</a></div>' +
				'</div>' +
				'</div>';
			});

			output +=   '</div>';
			return output;
		} else {
			return;
		} 
	}

	createPoliciesLinks(policies) {
		if(policies.length > 0) {
			let output = "";
			policies.forEach((policy, index) => {
				output +=   '<li>' +
				'<a href="' + policy.url + '" target="_blank">' + policy.title + '</a>' +
				'</li>';
			});
			return output;
		} else {
			return;
		}
	}

	createCookieNav(cookie_groups) {
		let output = "";
		cookie_groups.forEach((group, index) => {
			index++;
			let active = index == 1 && this.config.policies.length <= 0 ? "active" : "";
			output +=   '<li data-content="cont-' + index +'" class="content-tab ' + active + '">' +
			group.title +
			'</li>';
		});
		return output;
	}

	createCookieTabs(cookie_groups) {
		let output = "";
		cookie_groups.forEach((group, index) => {
			index++;
			let active = index == 1 && this.config.policies.length <= 0 ? "active" : "";
			output +=   '<div class="content-tab ' + active + '" id="cont-'+ index +'">' +
			'<div class="cookie-title">' + group.title + '</div>' +
			'<div class="cookie-subtitle">' + group.info + '</div>' +
			'<div class="cookie-panel">' +
			'<div class="head">' +
			this.config.labels.used_cookies +
			'<div class="switch">' + this.createSwitch(group) + '</div>' +
			'</div>' +
			'<div class="body">' + group.cookies.join(', ') + '</div>' +
			'</div>' +
			'</div>';
		});
		return output;
	}

	generateMarkup() {
		this.bar = '<div id="gdprx-bar" class="gdprx">' +
		'<div class="content">' + this.config.bar_text + '</div>' +
		'<div class="buttons">' +
		'<button class="preferences">' + this.config.labels.preferences + '</button>' +
		'<button class="accept">' + this.config.labels.accept + '</button>' +
		'</div>' +
		'</div>';

		this.modal = '<div id="gdprx-modal" class="gdprx">' +
		'<div class="main-content">' +
		'<div class="content-inner">' +
		'<div class="title">' + this.config.labels.panel_title + '<div class="close">X</div></div>' +
		'<div class="content-body">' +
		'<div class="navs">' +
		'<ul class="cookies-nav">' +
		this.createPoliciesNav(this.config.policies) +
		'<li class="list-title">' + this.config.labels.cookies + '</li>' +
		'<ul class="cookie-list">' +
		this.createCookieNav(this.config.cookie_groups) +
		'</ul>' +
		'</ul>' +
		'<ul class="policies">' +
		this.createPoliciesLinks(this.config.policies) +
		'</ul>'+
		'</div>' +
		'<div class="content">' +
		this.createPoliciesTab(this.config.policies) +
		this.createCookieTabs(this.config.cookie_groups) +
		'<div class="buttons"><button class="btn save">' + this.config.labels.save + '</button></div>';
		'</div>' +
		'</div>' +
		'</div>' +
		'</div>';
	}
	

	watchers() {
		// accept
		document.addEventListener('click', (e) => {
				const element = e.target;
				switch(true) {
					case element.matches('#gdprx-bar button.accept'):
						e.preventDefault();
						this.accept()
						break;
					case element.matches('#gdprx-bar button.preferences'):
						e.preventDefault();
						this.openModal()
						break;
					case element.matches('.gdprx-modal-opener'):
						e.preventDefault();
						this.openModal()
						break;
					case element.matches('#gdprx-modal .title .close'):
						e.preventDefault();
						this.closeModal()
						break;
					case element.matches('#gdprx-modal .btn.save'):
						e.preventDefault();
						this.savePreferences()
						break;
					case element.matches('#gdprx-modal .cookies-nav li[data-content]'):
						e.preventDefault();
						let content = element.getAttribute('data-content');
						let els = document.querySelectorAll('#gdprx-modal .cookies-nav li[data-content], #gdprx-modal .content .content-tab')
						if(els && els.length) {
							els.forEach(el => {
								el.classList.remove('active');
							})
						}
						element.classList.add('active');
						document.querySelector('#' + content).classList.add('active');
						break;
				}
			})
	}

	cookieSet() {
		window.gdprxValues = this.gdprxValues;
		let value = btoa(JSON.stringify(this.gdprxValues));
		this._setCookie(this.cookieName, value, 365);
	}

	cookieGet() {
		let cookieVal = this._getCookie(this.cookieName);
		if(cookieVal != undefined) {
			this.gdprxValues = JSON.parse(atob(cookieVal));
		}
		window.gdprxValues = this.gdprxValues;
	}

	appendModal() {
		document.body.insertAdjacentHTML('beforeend', this.modal)
	}

	loadBar() {
		document.body.insertAdjacentHTML('beforeend', this.bar)
		setTimeout(() => {
			document.getElementById('gdprx-bar').classList.add('active')
		}, 300);
	}

	closeBar() {
		let bar = document.getElementById('gdprx-bar');
		if(bar && bar.classList.contains('active')) {
			bar.classList.remove('active');
		}
	}

	accept() {
		this.savePreferences();
	}

	openModal() {
		let modal = document.getElementById('gdprx-modal');
		if(modal && !modal.classList.contains('active')) {
			modal.classList.add('visible');
			setTimeout(() => {
				modal.classList.add('active');
			}, 100);
		}
	}

	closeModal() {
		let modal = document.getElementById("gdprx-modal");
		if(modal) {
			modal.classList.remove('active');
			setTimeout(() => {
				modal.classList.remove('visible');
			}, 500);
		}
	}

	savePreferences() {
		this.gdprxValues.cookiesAccepted = [];
		this.gdprxValues.cookiesDenied = [];
		this.gdprxValues.accepted = true;

		this.config.cookie_groups.forEach((group, index) => {
			if(group.required) {
				this.gdprxValues.cookiesAccepted.push(group.title);
			}
		});

		let elements = document.querySelectorAll('input.gdprx-cookie-check');
		elements.forEach((el,i) => {
			let group = el.getAttribute('data-group'); 
			if(el.checked) {
				this.gdprxValues.cookiesAccepted.push(group);
			} else {
				this.gdprxValues.cookiesDenied.push(group);
			}
		});

		if(this.config.ajax.enable) {
			this.ajax();
		}

		this.cookieSet();
		this.closeModal();
		this.closeBar();

		const event = new Event('gdprxAccepted');
		document.dispatchEvent(event);
	}

	ajax() {
		let data = Object.assign({},this.config.ajax.parameters);
		data["gdpr"] = this.gdprxValues;

		fetch(this.config.ajax.url, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
	}
}