var editor = YASHEML(document.querySelector("#editor"), {
    lineNumbers: true,
    lineWrapping: true,
    theme: "default",
    viewportMargin: Infinity
})
var filmsShExML = `PREFIX : <http://example.com/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX schema: <http://schema.org/>
SOURCE films_xml_file <http://shexml.herminiogarcia.com/files/films.xml>
SOURCE films_json_file <http://shexml.herminiogarcia.com/files/films.json>
ITERATOR film_xml <xpath: //film> {
    FIELD id <@id>
    FIELD name <name>
    FIELD year <year>
    FIELD country <country>
    FIELD directors <crew/directors/director>
    FIELD screenwritters <crew//screenwritter>
    FIELD music <crew/music>
    FIELD photography <crew/photography>
    ITERATOR actors <cast/actor> {
        FIELD name <name>
        FIELD role <role>
        FIELD film <../../@id>
    }
    ITERATOR actresses <cast/actress> {
        FIELD name <name>
        FIELD role <role>
        FIELD film <../../@id>
    }
}
ITERATOR film_json <jsonpath: $.films[*]> {
    FIELD id <id>
    FIELD name <name>
    FIELD year <year>
    FIELD country <country>
    FIELD directors <crew.director>
    FIELD screenwritters <crew.screenwritter>
    FIELD music <crew.music>
    FIELD photography <crew.cinematography>
    ITERATOR actors <cast[*]> {
        FIELD name <name>
        FIELD role <role>
    }
}
EXPRESSION films <films_xml_file.film_xml UNION films_json_file.film_json>

:Films :[films.id] {
    schema:name [films.name] ;
    :year dbr:[films.year] ;
    schema:countryOfOrigin dbr:[films.country] ;
    schema:director dbr:[films.directors] ;
    :screenwritter dbr:[films.screenwritters] ;
    schema:musicBy dbr:[films.music] ;
    :cinematographer dbr:[films.photography] ;
    schema:actor @:Actor ;
    schema:actor @:Actress ;
}

:Actor dbr:[films.actors.name] {
    :name [films.actors.name] ;
    :appear_on :[films.actors.film] ;
}

:Actress dbr:[films.actresses.name] {
    :name [films.actresses.name] ;
    :appear_on :[films.actresses.film] ;
}
`

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
    $.ajax("https://shexml.herminiogarcia.com:8080/generate", {
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
    var useBlankNodes = $("#rmlBlankNodes").val();
    var content = {
        shexml: shexmldocument,
        format: $("#conversionFormat").val(),
        prettify: useBlankNodes
    }
    $.ajax("https://shexml.herminiogarcia.com:8080/generateRML", {
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