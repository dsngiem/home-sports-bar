var checkElementsByClassNameExists = function(id) {
	if (document.getElementsByClassName(id)[0] != null) {
		document.getElementsByClassName("user")[0].value = "dsngiem@gmail.com"
		document.getElementsByClassName("pass")[0].value = "chhomrith"
		setTimeout(function() {
			document.getElementsByClassName("submit")[0].click()
		}, 5000)
	} else {
		setTimeout(function() {
			checkElementsByClassNameExists(id)			
		}, 10000)
	}	
}

setTimeout(function() {
	checkElementsByClassNameExists("signin")
}, 10000)


