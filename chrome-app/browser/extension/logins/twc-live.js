var checkElementsByNameExists = function(id) {
	if (document.getElementsByName(id) != null) {
		document.getElementById("username").value = "okbobbo"
		document.getElementById("password").value = "bobs4950"
		clickLogin()
	} else {
		setTimeout(function() {
			checkElementsByNameExists(id)
		}, 1000)
	}
}

setTimeout(function() {
	checkElementsByNameExists('loginForm')
}, 1000)

var clickLogin = function() {
	document.getElementsByClassName("login-submit")[0].disabled = false;
	document.getElementsByClassName("login-submit")[0].click()
		setTimeout(function() {
			clickLogin()
		}, 3000)
}
