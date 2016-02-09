setTimeout(function() {
	document.getElementById("fancastVideoContainer").setAttribute('style', "width: 101% !important");
	setTimeout(function() {
	document.getElementById("fancastVideoContainer").setAttribute('style', "width: 100% !important");
	}, 1000)
}, 30000)

var checkElementsByClassNameExists = function(id) {
	if (document.getElementsByClassName(id).length != 0) {
		document.getElementsByClassName("sign_in")[0].click()
	} else {
		setTimeout(function() {
			checkElementsByClassNameExists(id)			
		}, 1000)
	}	
}