var canvas = document.getElementById("canvas-test");

var fitTextBoundingBox = function (text, baseFontSize, minFontSize, fontWeight, fontFamily, width, height) {
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

var drawDebugGridLines = function () {
    var context = canvas.getContext("2d");

    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    var leftMargin = canvasWidth * 0.05;
    var rightMargin = canvasWidth * 0.95;
    var topMargin = canvasHeight * 0.05;
    var bottomMargin = canvasHeight * 0.95;

    var scaleFactor = canvasHeight / 1080;

    //action safe zone
    context.beginPath();
    context.strokeStyle = "#FF0000";
    context.lineWidth = 1;

    context.moveTo(0, topMargin);
    context.lineTo(canvasWidth, topMargin);

    context.moveTo(0, bottomMargin);
    context.lineTo(canvasWidth, bottomMargin);

    context.moveTo(leftMargin, 0);
    context.lineTo(leftMargin, canvasHeight);

    context.moveTo(rightMargin, 0);
    context.lineTo(rightMargin, canvasHeight);

    context.stroke();


    //thirds
    context.beginPath();
    context.strokeStyle = "#00FF00";
    context.lineWidth = 1;

    context.moveTo(0, canvasHeight / 3);
    context.lineTo(canvasWidth, canvasHeight / 3);

    context.moveTo(0, canvasHeight * 2 / 3);
    context.lineTo(canvasWidth, canvasHeight * 2 / 3);

    context.moveTo(canvasWidth / 3, 0);
    context.lineTo(canvasWidth / 3, canvasHeight);

    context.moveTo(canvasWidth * 2 / 3, 0);
    context.lineTo(canvasWidth * 2 / 3, canvasHeight);

    context.stroke();

    //quarters
    context.beginPath();
    context.strokeStyle = "#0000FF";
    context.lineWidth = 1;

    context.moveTo(0, canvasHeight / 4);
    context.lineTo(canvasWidth, canvasHeight / 4);

    context.moveTo(0, canvasHeight / 2);
    context.lineTo(canvasWidth, canvasHeight / 2);

    context.moveTo(0, canvasHeight * 3 / 4);
    context.lineTo(canvasWidth, canvasHeight * 3 / 4);

    context.moveTo(canvasWidth / 4, 0);
    context.lineTo(canvasWidth / 4, canvasHeight);

    context.moveTo(canvasWidth / 2, 0);
    context.lineTo(canvasWidth / 2, canvasHeight);

    context.moveTo(canvasWidth * 3 / 4, 0);
    context.lineTo(canvasWidth * 3 / 4, canvasHeight);

    context.stroke()
}


var fitDimensionsBoundingBox = function (iwidth, iheight, bwidth, bheight) {
    var nw = bwidth
    var nh = bheight

    var ratio = iwidth / iheight
    if (bwidth / bheight > ratio) {
        //height is the constraint
        nw = Math.floor(nh * ratio)
    } else if (bwidth / bheight < ratio) {
        //width is the constraint
        nh = Math.floor(nw / ratio)
    }

    return [nw, nh]
}

var drawImageSrc = function (src, x, y, bwidth, bheight, center) {
    var context = canvas.getContext("2d");

    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;

    var leftMargin = canvasWidth * 0.05;
    var rightMargin = canvasWidth * 0.95;
    var topMargin = canvasHeight * 0.05;
    var bottomMargin = canvasHeight * 0.95;

    var scaleFactor = canvasHeight / 1080;

    var image = new Image();
    image.src = src;
    image.onload = function () {
        var dimensions = fitDimensionsBoundingBox(image.width, image.height, bwidth, bheight);
        var nw = dimensions[0];
        var nh = dimensions[1];

        var offsetX = 0;
        var offsetY = 0;

        if (center) {
            offsetX = (bwidth - nw) / 2;
            offsetY = (bheight - nh) / 2;
        }

        context.drawImage(image, x + offsetX, y + offsetY, nw, nh);
    }
}

var drawUpperThird = function () {
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
    var yBackFill = canvasHeight * 2 / 3;

    var widthBackFill = canvasWidth;
    var heightBackFill = canvasHeight / 3;

    var gradientBackFill = context.createLinearGradient(0, 0, 0, heightBackFill);
    gradientBackFill.addColorStop(1, 'rgba(0, 0, 0, .0)');
    gradientBackFill.addColorStop(25 / 33, 'rgba(0, 0, 0, .8)');
    gradientBackFill.addColorStop(0, 'rgba(0, 0, 0, .8)');

    context.fillStyle = gradientBackFill;
    context.fillRect(0, 0, widthBackFill, heightBackFill);

    //channel logo
    drawImageSrc("fox.png", leftMargin, topMargin, canvasHeight / 4 - topMargin, canvasHeight / 4 - topMargin, true)

    //advertisement
    var widthAdPlaceholder = 728;
    var heightAdPlaceholder = 90;

    var xAdPlaceholder = rightMargin - widthAdPlaceholder;
    var yAdPlaceholder = topMargin + (canvasHeight / 4 - topMargin - heightAdPlaceholder) / 2;


    context.fillStyle = "rgba(109, 0, 25, 1.0)";
    context.fillRect(xAdPlaceholder, yAdPlaceholder, widthAdPlaceholder, heightAdPlaceholder);
};

var drawLowerThird = function (programTitle, episodeTitle, startTime, endTime) {
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
    var yBackFill = canvasHeight * 2 / 3;

    var widthBackFill = canvasWidth;
    var heightBackFill = canvasHeight / 3;

    var gradientBackFill = context.createLinearGradient(0, yBackFill, 0, canvasHeight);
    gradientBackFill.addColorStop(0, 'rgba(0, 0, 0, .0)');
    gradientBackFill.addColorStop(1 - 25 / 33, 'rgba(0, 0, 0, .8)');
    gradientBackFill.addColorStop(1, 'rgba(0, 0, 0, .8)');

    context.fillStyle = gradientBackFill;
    context.fillRect(xBackFill, yBackFill, widthBackFill, heightBackFill);


    //program title
    var fontSizeBaseProgramTitle = 36 * scaleFactor;
    //var fontSizeProgramTitle = Math.floor(fontSizeBaseProgramTitle * scaleFactor);

    var widthBoundingBoxProgramTitle = canvasWidth * 0.9;

    // var programTitle = '';

    var fontSizeProgramTitle = fitTextBoundingBox(programTitle, fontSizeBaseProgramTitle, 18, "bold", "Helvetica", widthBoundingBoxProgramTitle, 0);

    var xProgramTitle = leftMargin;
    var yProgramTitle = (canvasHeight * 0.75) + (canvasHeight / 4 * 0.05) + (fontSizeProgramTitle);

    context.fillStyle = "white";
    context.font = "bold " + fontSizeProgramTitle + "pt Helvetica";
    context.fillText(programTitle, xProgramTitle, yProgramTitle);


    //episode title
    var widthProgramTitle = context.measureText(programTitle).width;

    var fontSizeBaseEpisodeTitle = fontSizeProgramTitle;

    // var episodeTitle = '';

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

    //var startTime = ;

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

    //var endTime = ;

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

    context.fillStyle = "rgba(109, 0, 25, .8)";
    context.fillRect(xElapsedBar, yElapsedBar, widthElapsedBar, heightElapsedBar);
}



var testCanvas = function () {
    var post_data = {
        'channel': 82547
    };

    $.post("https://peaceful-forest-5547.herokuapp.com/api/guide/channel/program", post_data).done(function (response) {
        var programTitle = response.programTitle;
        var episodeTitle = response.episodeTitle;
        var startTimeDisplay = response.startTimeDisplay;
        var endTimeDisplay = response.endTimeDisplay;

        setTimeout(function () {
            canvas = document.getElementById("canvas-test");
            if (canvas) {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
                drawUpperThird();
                drawLowerThird(programTitle, episodeTitle.trim(), startTimeDisplay, endTimeDisplay);
                drawDebugGridLines();

                setTimeout(function () {
                    //$(canvas).fadeOut(800);
                }, 5000);

            } else {
                testCanvas();
            }
        }, 500);
    })

}
