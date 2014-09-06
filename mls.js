document.getElementById("playerContent").style.width = "100%";
document.getElementById("playerContent").style.height = "100%";

document.getElementById("playerObject").style.top = "-20px";
document.getElementById("playerObject").style.margin = "0px";
document.getElementById("playerObject").style.width = "100%";
document.getElementById("playerObject").style.height = "100%";


var anchors = document.getElementsByTagName('a');
for (var i=0; i<anchors.length; i++){
	anchors[i].setAttribute('target', '_self');
}