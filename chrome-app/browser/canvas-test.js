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


function roundRect(context, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }

    if (typeof radius === 'undefined') {
        radius = 5;
    }

    if (typeof radius === 'number') {
        radius = { tl: radius, tr: radius, br: radius, bl: radius };

    } else {
        var defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };

        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }

    context.beginPath();

    context.moveTo(x + radius.tl, y);

    context.lineTo(x + width - radius.tr, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);

    context.lineTo(x + width, y + height - radius.br);
    context.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);

    context.lineTo(x + radius.bl, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);

    context.lineTo(x, y + radius.tl);
    context.quadraticCurveTo(x, y, x + radius.tl, y);

    context.closePath();

    if (fill) {
        context.fill();
    }

    if (stroke) {
        context.stroke();
    }

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

var drawUpperThird = function (image, channelName) {
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

    //logo fill
    var imageWidthBoundingBox = canvasHeight / 4 - topMargin;
    var imageHeightBoundingBox = imageWidthBoundingBox;

    var widthLogoFill = imageWidthBoundingBox;
    var heightLogoFill =imageHeightBoundingBox;

    var xLogoFill = leftMargin;
    var yLogoFill = topMargin;

    context.fillStyle = "rgba(255, 255, 255, 1.0)";
    context.fillRect(xLogoFill, yLogoFill, widthLogoFill, heightLogoFill);

    //channel logo
    drawImageSrc(image, leftMargin * 1.10, topMargin * 1.10, imageWidthBoundingBox * .90, imageHeightBoundingBox * .90, true)


    //advertisement
    var widthAdPlaceholder = 728;
    var heightAdPlaceholder = 90;

    var xAdPlaceholder = rightMargin - widthAdPlaceholder;
    var yAdPlaceholder = topMargin + (imageHeightBoundingBox - heightAdPlaceholder) / 2;


    context.fillStyle = "rgba(109, 0, 25, 1.0)";
    context.fillRect(xAdPlaceholder, yAdPlaceholder, widthAdPlaceholder, heightAdPlaceholder);


    //channel name
    var fontSizeBaseChannelName = 36 * scaleFactor;
    //var fontSizeChannelName = Math.floor(fontSizeBaseChannelName * scaleFactor);

    var widthBoundingBoxChannelName = canvasWidth * 0.9 - imageWidthBoundingBox - widthAdPlaceholder;

    //var channelName = 'FS1';

    var fontSizeChannelName = fitTextBoundingBox(channelName, fontSizeBaseChannelName, 18, "bold", "Helvetica", widthBoundingBoxChannelName, 0);

    var xChannelName = leftMargin + imageWidthBoundingBox * 1.25;
    var yChannelName = topMargin + (imageHeightBoundingBox / 2) + (fontSizeChannelName / 2);

    context.fillStyle = "white";
    context.font = "bold " + fontSizeChannelName + "pt Helvetica";
    context.fillText(channelName, xChannelName, yChannelName);


};

var drawLowerThird = function (programTitle, episodeTitle, description, startTime, endTime, response) {
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
    var fontSizeEpisodeTitle = fitTextBoundingBox(episodeTitle, fontSizeBaseEpisodeTitle, 18, "", "Helvetica", widthBoundingBoxProgramTitle - widthProgramTitle, 0);

    var xEpisodeTitle = leftMargin + widthProgramTitle + Math.floor(20 * scaleFactor);
    //var xEpisodeTitle = leftMargin;
    var yEpisodeTitle = (canvasHeight * 0.75) + (canvasHeight / 4 * 0.05) + (fontSizeEpisodeTitle) + (fontSizeBaseEpisodeTitle - fontSizeEpisodeTitle);


    context.fillStyle = "white";
    context.font = "italic " + fontSizeEpisodeTitle + "pt Helvetica";
    context.fillText(episodeTitle, xEpisodeTitle, yEpisodeTitle);


    //description
    var widthProgramTitle = context.measureText(programTitle).width;

    var fontSizeBaseDescription = fontSizeProgramTitle * .75;

    // var episodeTitle = '';

    //var fontSizeEpisodeTitle = Math.floor(fontSizeBaseEpisodeTitle * scaleFactor);
    var fontSizeDescription = fitTextBoundingBox(description, fontSizeBaseDescription, 18, "", "Helvetica", widthBoundingBoxProgramTitle, 0);

    //var xEpisodeTitle = leftMargin + widthProgramTitle + Math.floor(20 * scaleFactor);
    var xDescription = leftMargin;
    var yDescription = (canvasHeight * 0.75) + (canvasHeight / 4 * 0.05) + (fontSizeProgramTitle * 1.33) + (fontSizeDescription);


    context.fillStyle = "white";
    context.font = fontSizeDescription + "pt Helvetica";
    context.fillText(description, xDescription, yDescription);


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

    var startTimeMoment = moment(response.startTime);
    var currentTimeMoment = moment();
    var endTimeMoment = moment(response.endTime);

    var timeLeft = moment.duration(endTimeMoment.diff(currentTimeMoment))
    var percentComplete = moment.duration(currentTimeMoment.diff(startTimeMoment)) / moment.duration(endTimeMoment.diff(startTimeMoment))

    var statusTime = timeLeft.humanize() + " left | " + Math.round(percentComplete * 100) + "% complete";

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
    var xCurrentTime = leftMargin + (canvasWidth * 0.90 * percentComplete);
    var yCurrentTime = bottomMargin - (canvasHeight * .0167 * 2) - (Math.floor(25 * scaleFactor) * 1.5);

    var fontSizeBaseCurrentTime = 24;
    var fontSizeCurrentTime = Math.floor(fontSizeBaseCurrentTime * scaleFactor);

    var currentTime = currentTimeMoment.format("h:mm A");

    context.fillStyle = "white";
    context.font = fontSizeCurrentTime + "pt Helvetica";
    var widthCurrentTime = context.measureText(currentTime).width;

    context.textAlign = "center"
    if ((widthCurrentTime / 2 + leftMargin) > xCurrentTime) {
        context.textAlign = "left"
        xCurrentTime = leftMargin;
    }

    if ((widthCurrentTime + xCurrentTime) > (canvasWidth * .90 + leftMargin)) {
        context.textAlign = "right"
        xCurrentTime = leftMargin + canvasWidth * .90;
    }


    context.fillText(currentTime, xCurrentTime, yCurrentTime);


    //progress bar
    var xProgressBar = leftMargin;
    var yProgressBar = bottomMargin - (canvasHeight * .0167 * 2) - Math.floor(21 * scaleFactor);

    var widthProgressBar = canvasWidth * .9;
    var heightProgressBar = canvasHeight * .0167;

    context.fillStyle = "rgba(255, 255, 255, .5)";
    context.fillRect(xProgressBar, yProgressBar, widthProgressBar, heightProgressBar);


    //elapsed bar
    var xElapsedBar = leftMargin;
    var yElapsedBar = bottomMargin - (canvasHeight * .0167 * 2) - Math.floor(21 * scaleFactor);

    var widthElapsedBar = canvasWidth * .9 * percentComplete;
    var heightElapsedBar = canvasHeight * .0167;

    context.fillStyle = "rgba(109, 0, 25, .8)";
    context.fillRect(xElapsedBar, yElapsedBar, widthElapsedBar, heightElapsedBar);
}



var testCanvas = function () {
    var channelId = parseInt($("#webview-1").attr('name'));

    var post_data = {
        'channel': channelId
    };

    $.post("https://peaceful-forest-5547.herokuapp.com/api/guide/channel/program", post_data).done(function (response) {
        console.log(response);

        var programTitle = response.programTitle;
        var episodeTitle = "";
        if (response.episodeTitle !== undefined) {
            episodeTitle = response.episodeTitle.trim();
        }
        var description = response.description;
        var startTimeDisplay = response.startTimeDisplay;
        var endTimeDisplay = response.endTimeDisplay;
        var channelName = response.channelName;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', response.image, true);
        xhr.responseType = 'blob';
        xhr.onload = function(e) {
            var image = window.URL.createObjectURL(this.response);

            setTimeout(function () {
                canvas = document.getElementById("canvas-test");
                if (canvas) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
                    drawUpperThird(image, channelName);
                    drawLowerThird(programTitle, episodeTitle, description, startTimeDisplay, endTimeDisplay, response);
                    //drawDebugGridLines();

                    $(canvas).fadeIn(100);

                    setTimeout(function () {
                        $(canvas).fadeOut(800);
                    }, 5000);

                } else {
                    testCanvas();
                }
            }, 500);
        };

        xhr.send();
    })

}
