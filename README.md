# GDPRX
Simple javascript GDPR compliant Cookie and Policies consent handler

Config options: 
```
var gdprx_options = {
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
		},
		{
			title: "Statistics",
			cookies: [
				"_ga",
				"_gat",
				"_gid",
				"_gid#",
				"collect"
			],
			required: false,
			default: true,
			info: "Used for site statistics and analitycs"
		}
	],
	policies: [
		{
			title: "Privacy policy",
			info: "Privacy policy",
			url: ""
		},
		{
			title: "Cookie policy",
			info: "Cookie policy",
			url: ""
		},
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
  ```
  Be sure to load Jquery before GDPRX
  
  Add js and css files to your document and simply initialize and pass custom options if needed.
  
  ```
  var gdprx = new Gdprx(gdprx_options);
  ```
  
  GDPRX will triger a DOM event when user accepts, to hook to it simply use:
  
  ```
  jQuery(document).on("gdprxAccepted", function() {
	  ...your code here		
  });
  ```
  Once initiated a global var will instantiated holding the user acceptance values: 
  gdprxValues
  
  You can create a button with class ```.gdprx-modal-opener``` to toggle the preferences panel
  
