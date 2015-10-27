var checkElementsByClassNameExists = function(id, timeoutLength) {
	if (document.getElementsByClassName(id).length != 0) {
		document.getElementsByClassName(id)[0].click()
		
	} else if (document.getElementById('fancastVideoContainer') == null) {
		setTimeout(function() {
			checkElementsByClassNameExists(id)			
		}, timeoutLength)
	}	
}

setTimeout(function () {
	checkElementsByClassNameExists("sign_in", 1000)
}, 1000)

setTimeout(function () {
	checkElementsByClassNameExists("refresh", 10000)
}, 10000)