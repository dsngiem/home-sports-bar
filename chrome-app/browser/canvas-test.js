var canvas = document.getElementById("canvas-test");

var fitTextBoundingBox = function(text, baseFontSize, minFontSize, fontWeight, fontFamily, width, height) {
  var context = canvas.getContext("2d");
  var currentSize = baseFontSize;

  context.font = fontWeight + " " + currentSize + "pt " + fontFamily;
  var currentWidth = context.measureText(text).width;

  while (currentWidth > width) {
    currentSize = currentSize - 1;

    context.font = fontWeight + " " + currentSize + "pt " + fontFamily;
    currentWidth = context.measureText(text).width;

    if (currentSize <= minFontSize) {
      return minFontSize;
    }
  }

  return currentSize;
};

var drawUpperThird = function() {

};

var drawLowerThird = function(programTitle, episodeTitle, startTime, endTime) {
  var context = canvas.getContext("2d");
  
  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height;

  var leftMargin = canvasWidth * 0.05;
  var rightMargin = canvasWidth * 0.95;
  var topMargin = canvasHeight * 0.05;
  var bottomMargin = canvasHeight * 0.95;

  var scaleFactor = canvasHeight / 1080;


  //back fill
  var xBackFill = 0;
  var yBackFill = canvasHeight * 2/3;

  var widthBackFill = canvasWidth;
  var heightBackFill = canvasHeight / 3;

  var gradientBackFill = context.createLinearGradient(0, yBackFill, 0, canvasHeight);
  gradientBackFill.addColorStop(0, 'rgba(0, 0, 0, .0)');
  gradientBackFill.addColorStop(1 - 25/33, 'rgba(0, 0, 0, .8)');
  gradientBackFill.addColorStop(1, 'rgba(0, 0, 0, .8)');

  context.fillStyle = gradientBackFill;  
  context.fillRect(xBackFill, yBackFill, widthBackFill, heightBackFill);


  //program title
  var fontSizeBaseProgramTitle = 36 * scaleFactor;
  //var fontSizeProgramTitle = Math.floor(fontSizeBaseProgramTitle * scaleFactor);

  var widthBoundingBoxProgramTitle = canvasWidth * 0.9;

  var programTitle = "MLB Whiparound presented by Washington Mutual";

  var fontSizeProgramTitle = fitTextBoundingBox(programTitle, fontSizeBaseProgramTitle, 18, "bold", "Helvetica", widthBoundingBoxProgramTitle, 0);

  var xProgramTitle = leftMargin;
  var yProgramTitle = (canvasHeight * 0.75) + (canvasHeight / 4 * 0.05) + (fontSizeProgramTitle);

  context.fillStyle = "white";
  context.font = "bold " + fontSizeProgramTitle + "pt Helvetica";
  context.fillText(programTitle, xProgramTitle, yProgramTitle);


  //episode title
  var widthProgramTitle = context.measureText(programTitle).width;
  
  var fontSizeBaseEpisodeTitle = fontSizeProgramTitle;

  var episodeTitle = "Postgame Show";

  //var fontSizeEpisodeTitle = Math.floor(fontSizeBaseEpisodeTitle * scaleFactor);
  var fontSizeEpisodeTitle = fitTextBoundingBox(episodeTitle, fontSizeBaseEpisodeTitle, 18, "", "Helvetica", widthBoundingBoxProgramTitle, 0);

  //var xEpisodeTitle = leftMargin + widthProgramTitle + Math.floor(20 * scaleFactor);
  var xEpisodeTitle = leftMargin;
  var yEpisodeTitle = (canvasHeight * 0.75) + (canvasHeight / 4 * 0.05) + (fontSizeEpisodeTitle * 2.5);


  context.fillStyle = "white";
  context.font = fontSizeEpisodeTitle + "pt Helvetica";
  context.fillText(episodeTitle, xEpisodeTitle, yEpisodeTitle);


  //start time
  var xStartTime = leftMargin;
  var yStartTime = bottomMargin;

  var fontSizeBaseStartTime = 24;
  var fontSizeStartTime = Math.floor(fontSizeBaseStartTime * scaleFactor);

  var startTime = "1:00 AM";

  context.fillStyle = "white";
  context.font = fontSizeStartTime + "pt Helvetica";
  context.fillText(startTime, xStartTime, yStartTime);


  //status time  
  var xStatusTime = leftMargin + (canvasWidth * 0.90 * .5);
  var yStatusTime = bottomMargin;

  var fontSizeBaseStatusTime = 24;
  var fontSizeStatusTime = Math.floor(fontSizeBaseStatusTime * scaleFactor);

  var statusTime = "15 minutes left | 75% complete";

  context.fillStyle = "white";
  context.font = fontSizeStatusTime + "pt Helvetica";
  context.textAlign = "center"
  context.fillText(statusTime, xStatusTime, yStatusTime);


  //end time
  var xEndTime = rightMargin
  var yEndTime = bottomMargin

  var fontSizeBaseEndTime = 24;
  var fontSizeEndTime = Math.floor(fontSizeBaseEndTime * scaleFactor);

  var endTime = "2:00 AM";

  context.fillStyle = "white";
  context.font = fontSizeEndTime + "pt Helvetica";
  context.textAlign = "left"

  var widthEndTime = context.measureText(endTime).width;
  xEndTime = xEndTime - widthEndTime;
  context.fillText(endTime, xEndTime, yEndTime);


  //current time
  var xCurrentTime = leftMargin + (canvasWidth * 0.90 * .75);
  var yCurrentTime = bottomMargin - (canvasHeight * .0167 * 2) - (Math.floor(25 * scaleFactor) * 1.5);

  var fontSizeBaseCurrentTime = 24;
  var fontSizeCurrentTime = Math.floor(fontSizeBaseCurrentTime * scaleFactor);

  var currentTime = "1:45 AM";

  context.fillStyle = "white";
  context.font = fontSizeCurrentTime + "pt Helvetica";
  context.textAlign = "center"
  var widthCurrentTime = context.measureText(currentTime).width;
  
  context.fillText(currentTime, xCurrentTime, yCurrentTime);


  //progress bar
  var xProgressBar = leftMargin;
  var yProgressBar = bottomMargin - (canvasHeight * .0167 * 2) - Math.floor(24 * scaleFactor);

  var widthProgressBar = canvasWidth * .9;
  var heightProgressBar = canvasHeight * .0167;

  context.fillStyle = "rgba(255, 255, 255, .5)";
  context.fillRect(xProgressBar, yProgressBar, widthProgressBar, heightProgressBar);


  //elapsed bar
  var xElapsedBar = leftMargin;
  var yElapsedBar = bottomMargin - (canvasHeight * .0167 * 2) - Math.floor(24 * scaleFactor);

  var widthElapsedBar = canvasWidth * .9 * .75;
  var heightElapsedBar = canvasHeight * .0167;

  context.fillStyle = "rgba(255, 0, 0, .5)";
  context.fillRect(xElapsedBar, yElapsedBar, widthElapsedBar, heightElapsedBar);
}



var testCanvas = function() {
  setTimeout( function() {
    canvas = document.getElementById("canvas-test");
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      drawLowerThird();


      setTimeout( function() {
        $(canvas).fadeOut(800);
      }, 5000);

    } else {
      testCanvas();
    }
  }, 500);
}
