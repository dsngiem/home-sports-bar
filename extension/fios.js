document.getElementById("oo_tab").style.display = "none";

// if (document.getElementsByClassName("nfl_player").length != 0) {
// 	var nfl = document.getElementsByClassName("nfl_player")[0].innerHTML;
// 	document.getElementsByClassName("nfl_player")[0].innerHTML = nfl 
// 	+ '<div id="topOverlay" style="position: fixed; top: 0px; left: 0px; z-index: 9999; width: 100%; height: 30px; background: #000000;"></div>'
// 	+ '<div id="bottomOverlay" style="position: fixed; bottom: 0px; left: 0px; z-index: 9999; width: 100%; height: 30px; background: #000000;"></div>';
// }

if (document.getElementsByClassName("container").length != 0) {
	var containers = document.getElementsByClassName("container");
	for (var i=0; i<containers.length; i++){
		var abc = containers[i].innerHTML;
		containers[i].innerHTML = abc + '<div id="bottomOverlay" style="position: fixed; bottom: 0px; left: 0px; z-index: 10000; width: 100%; height: 30px; background: #000000;" onclick="this.style.zIndex = ' + "'1';" + '" onmouseout="this.style.zIndex = ' + "'10000';" + '"></div>';
	}
}


