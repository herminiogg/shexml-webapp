var editor = YASHEML(document.querySelector("#editor"), {
    lineNumbers: true,
    lineWrapping: true,
    theme: "default",
    viewportMargin: Infinity
})
var filmsShExML = ``

var resultEditor = CodeMirror(document.querySelector("#resultEditor"), {
    lineNumbers: true,
    lineWrapping: true,
    theme: "default",
    viewportMargin: Infinity
})

var urlParams = new URLSearchParams(window.location.search);

if (urlParams.has("result")) {
    var value = urlParams.get("result") === "" ? "" : urlParams.get("result");
    resultEditor.setValue(value);
} else resultEditor.setValue("");

if (urlParams.has("input")) {
    var value = urlParams.get("input") === "" ? "" : urlParams.get("input");
    editor.setValue(value);
} else editor.setValue(filmsShExML);

$("#submitButton").click(function(){
    var shexmldocument = editor.getValue();
    var content = {
        shexml: shexmldocument,
        format: $("#conversionFormat").val()
    }
    $.ajax("https://shexml.herminiogarcia.com/api/generate", {
        "data": JSON.stringify(content),
        "type": "POST",
        "processData": false,
        "dataType": "text",
        "contentType": "application/json",
        "success": function(data) {
            resultEditor.setValue(data);
            nonLoadingButton();
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            createAlert(jqXHR.responseText);
            nonLoadingButton();
        }
    });
    loadingButton();
});

$("#submitButtonRML").click(function(){
    var shexmldocument = editor.getValue();
    var content = {
        shexml: shexmldocument,
        format: $("#conversionFormat").val()
    }
    $.ajax("https://shexml.herminiogarcia.com/api/generateRML", {
        "data": JSON.stringify(content),
        "type": "POST",
        "processData": false,
        "dataType": "text",
        "contentType": "application/json",
        "success": function(data) {
            resultEditor.setValue(data);
            nonLoadingButtonRML();
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            createAlert(jqXHR.responseText);
            nonLoadingButtonRML();
        }
    });
    loadingButtonRML();
});

$('#permalinkButton').click(function(){
    var shexmlDocument = encodeURIComponent(editor.getValue());
    var resultDocument = encodeURIComponent(resultEditor.getValue());
    var newURL = "?input=" + shexmlDocument + "&result=" + resultDocument;
    window.history.pushState(null, null, newURL);
    createInfoAlert("Permalink created! Copy the URL in the address bar.");
})

$('#generateShExML').click(function() {
    var xsdURL = $('#xsdURL').val()
    var xmlURL = $('#xmlURL').val()
    var content = {
        xml: xmlURL,
        xsd: xsdURL
    }
    $.ajax("https://shexml.herminiogarcia.com/api/validateXMLFile", {
        "data": JSON.stringify(content),
        "type": "POST",
        "processData": false,
        "dataType": "text",
        "contentType": "application/json",
        "success": function(data) {
            callForShExMLGeneration(content);
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            createAlert("The given XML file does not validate against the given XML Schema");
            nonLoadingButtonGenerateShExML();
        }
    });
    loadingButtonGenerateShExML();
})

function callForShExMLGeneration(content) {
    $.ajax("https://shexml.herminiogarcia.com/api/generateShexmlFromXSD", {
        "data": JSON.stringify(content),
        "type": "POST",
        "processData": false,
        "dataType": "text",
        "contentType": "application/json",
        "success": function(data) {
            editor.setValue(data);
            nonLoadingButtonGenerateShExML();
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            createAlert(jqXHR.responseText);
            nonLoadingButtonGenerateShExML();
        }
    });
}

function createAlert(errorMessage) {
    var alertHTML = '<div class="alert alert-danger alert-dismissible fade show" role="alert">' +
        errorMessage + 
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '  <span aria-hidden="true">&times;</span>' +
        '</button>' +
        '</div>';
    console.log(errorMessage);
    var alertElement = jQuery(alertHTML);
    $("#mainContainer").prepend(alertElement);
}

function createInfoAlert(infoMessage) {
    var alertHTML = '<div class="alert alert-info alert-dismissible fade show" role="alert">' +
        infoMessage + 
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '  <span aria-hidden="true">&times;</span>' +
        '</button>' +
        '</div>';
    console.log(infoMessage);
    var alertElement = jQuery(alertHTML);
    $("#mainContainer").prepend(alertElement);
}

function loadingButton() {
    $("#submitButton").toggle();
    $("#loadingButton").toggle();
}

function nonLoadingButton() {
    $("#submitButton").toggle();
    $("#loadingButton").toggle();
}

function loadingButtonRML() {
    $("#submitButtonRML").toggle();
    $("#loadingButtonRML").toggle();
}

function nonLoadingButtonRML() {
    $("#submitButtonRML").toggle();
    $("#loadingButtonRML").toggle();
}

function loadingButtonGenerateShExML() {
    $("generateShExML").toggle();
    $("loadingGenerateShExML").toggle();
}

function nonLoadingButtonGenerateShExML() {
    $("generateShExML").toggle();
    $("loadingGenerateShExML").toggle();
}