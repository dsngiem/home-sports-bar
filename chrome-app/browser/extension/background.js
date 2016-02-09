chrome.webRequest.onBeforeRequest.addListener(
	function (details) {
		return {
			redirectUrl: "https://localhost:4433/v1.txt"
		}
	},
	{urls: [		
        "https://services.timewarnercable.com/ipvs/api/smarttv/location/v1*"
	]},
	["blocking"]
)