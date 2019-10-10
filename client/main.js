define([
	'text!./main.html',
	'./mvc/mvcapp',
	'./mainTabs/mainTabs',
	'./util/urlParams',
	'./util/cls',
	'./util/request',
	'./util/youtubePlayerSetup',
	'./util/removeAccidentalWhitespace',
	'./util/sendDataToServer',
	'./userMenu/userMenu'
], function(
	main_html,
	mvcapp,
	mainTabs,
	urlParams,
	cls,
	request,
	youtubePlayerSetup,
	removeAccidentalWhitespace,
	sendDataToServer,
	userMenu
) {
	//FIXME: This seems wrong
	var pathRoot = location.pathname;
	if (pathRoot[pathRoot.length-1] != '/') {
		pathRoot += '/';
	}

	return function() {
		urlParams();
		if (window.BrandingPays.urlParams.clearLocalStorage=='1') {
			localStorage.clear();
		}
		var firstTimeUser = !localStorage.lastLogin;
		var model = new mvcapp();
		cls.add(document.body, 'main');
		document.body.innerHTML = removeAccidentalWhitespace(main_html);
		document.body.querySelector('.print').style.display = 'none';
		var pageHeaderUser = document.querySelector('.pageHeaderUser');
		pageHeaderUser.addEventListener('click', function(e) {
			e.preventDefault();
			userMenu.show(pageHeaderUserIconMenu, window.BrandingPays.user);
		}, false);
		var pageHeaderUserName = document.querySelector('.pageHeaderUserName');
		if (!(window.BrandingPays && window.BrandingPays.user && window.BrandingPays.user)) {
			location.href = pathRoot+'startup'+location.search;
		}
		window.BrandingPays.sheetTypes = [ 'Assessment', 'Positioning_Statement', 'Elevator_Pitch', 'Brand_Strategy', 'Ecosystem_Model', 'Action_Plan' ];
		window.BrandingPays.uniqId = Math.ceil(Math.random()*1000000000000);
		//FIXME: Does this trigger an unnecessary redraw?
		if (window.BrandingPays.user.data) {
			if (window.BrandingPays.user.data.workbooks) {
				model.set('workbooks', window.BrandingPays.user.data.workbooks);
			}
			if (window.BrandingPays.user.data.nav) {
				model.set('nav', window.BrandingPays.user.data.nav);
			}
			if (window.BrandingPays.user.data.lastUniqueId) {
				model.set('lastUniqueId', window.BrandingPays.user.data.lastUniqueId);
			}
		}
		pageHeaderUserName.textContent = (window.BrandingPays && window.BrandingPays.user && window.BrandingPays.user.firstName) || '';
/*
		var splitViewParentNode = document.querySelector('.pageTableBodyTD');
		this.splitViewInstance = new splitView(model, splitViewParentNode);
*/
		var mainTabsTabsNode = document.querySelector('.pageHeaderMainTabsTD');
		var mainTabsContentNode = document.querySelector('.pageTableBodyTD');
		this.mainTabsInstance = new mainTabs(model, mainTabsTabsNode, mainTabsContentNode);
		localStorage.lastLogin = window.BrandingPays.user.email;
		var pageHeaderUserIconMenu = document.querySelector('.pageHeaderUserIconMenu');
		pageHeaderUserIconMenu.addEventListener('click', function(e) {
			e.preventDefault();
			userMenu.show(pageHeaderUserIconMenu, window.BrandingPays.user);
		}, false);
		var socketIODomain = window.BrandingPays.system.socketIODomain || location.origin;
		var socketIOPath = window.BrandingPays.system.socketIOPath;
		var socket = window.BrandingPays.socket = io.connect(socketIODomain, {path: socketIOPath});
		socket.on('dataUpdate', function (data) {
			console.log('Client socket received: '+JSON.stringify(data, null, '\t'));
			// We just received a socket message from server saying data has changed
			// for the current email. Refresh the current page to get the new data
			// if the payload's sid does not match this browser sessions sid.
			// Use a small setTimeout to minimize flashing in case another window is
			// in process of entering a number of changes in short period of time
			if (window.BrandingPays.uniqId != data.uniqId) {
				setTimeout(function() {
					location.reload();	
				}, 50);
			}
		});
		// Deal with possible race condition where one window is changing user data in the background
		// at the same time this window is reloading. Check with server to see if this user's data
		// has changed since this page was (re-)loaded.
		if (window.BrandingPays.user.data && window.BrandingPays.user.data.lastModified) {
			request({
				url: pathRoot+'xhr/userDataLastModified',
				method: 'POST',
				body: ''
			}, function(status, responseText) {
				if (status == 200) {
					if (responseText && responseText != window.BrandingPays.user.data.lastModified) {
						setTimeout(function() {
							location.reload();	
						}, 50);
					}
				} else {
					console.error('Error in userDataLastModified. status='+status);
				}
			});
		}

		youtubePlayerSetup();

		// If anything changes in the model, tell the server
		model.watch(/^workbooks/, sendDataToServer.bind(this, model, pathRoot));
		model.watch(/^nav/, sendDataToServer.bind(this, model, pathRoot));
		model.watch(/^lastUniqueId/, sendDataToServer.bind(this, model, pathRoot));
 	};
});
