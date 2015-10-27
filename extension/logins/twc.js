var checkElementsByIdExists = function(id) {
	if (document.getElementById(id) != null) {
		document.getElementById("loginFormUsername").value = "okbobbo"
		document.getElementById("loginFormPassword").value = "bobs4950"
		document.getElementsByClassName("ctaButton")[0].click()
	} else {
		setTimeout(function() {
			checkElementsByIdExists(id)			
		}, 1000)
	}	
}

checkElementsByIdExists("loginFormUsername")