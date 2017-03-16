$( function() {
    $( document ).tooltip();
  } );

var pageMap = [];

var getPageName = function() {
    var path = window.location.pathname;
    var page = path.split("/").pop();

    return page;
};

var requestPageMap = function(location) {
    if (location === undefined) {
        location = "./tooltips.json";
    }

    console.log("requesting page map " + location);

    $.ajax({
        url: location,
        type: "GET",
        dataType: 'json',
        contentType: "text/plain",
        success: function(data) {
            processPageMap(data);
        },
        error: function(error) {
            console.log(error);
        }
    });
};

var processPageMap = function(pageMapJSON) {
    var pageMapArray = pageMapJSON.pageMap;

    pageMapArray.forEach(function(element, index, array){
        var page = element.page;
        var map = element.map;

        pageMap[page] = map;
    });

    applyMapToPage();
};

var setTitleByName = function(name, helpText) {
    var element = $('[name=' + name + ']');

    if (helpText.length !== 0) {
        element.attr("title", helpText);
    }
};

var setTitleById = function(id, helpText) {
    var element = $('#' + id);

    if (helpText.length !== 0) {
        element.attr("title", helpText);
    }
};

var applyMapToPage = function recursiveApplyMapToPage(page) {
    if (page === undefined) {
        var page = getPageName();
    }

    if (pageMap.hasOwnProperty(page)) {
        var map = pageMap[page];

        for (var i = 0; i < map.length; i++) {
            var element = map[i];

            if (element.hasOwnProperty('name')) {
                setTitleByName(element.name, element.helpText);
            }

            else if (element.hasOwnProperty('id')) {
                setTitleById(element.id, element.helpText);
            }

            else if (element.hasOwnProperty('page')) {
                recursiveApplyMapToPage(element.page);
            }
        }
    }
};