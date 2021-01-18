var editor = YASHEML(document.querySelector("#editor"), {
    lineNumbers: true,
    lineWrapping: true,
    theme: "default",
    viewportMargin: Infinity
})
var filmsShExML = `PREFIX ex: <http://example.com/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX schema: <http://schema.org/>
PREFIX xs: <http://www.w3.org/2001/XMLSchema#>
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
}
ITERATOR film_json <jsonpath: $.films[*]> {
    FIELD id <id>
    FIELD name <name>
    FIELD year <year>
    FIELD country <country>
    FIELD directors <crew.director>
    FIELD screenwritters <crew.screenwritter>
    FIELD music <crew.music>
}
EXPRESSION films <films_xml_file.film_xml UNION films_json_file.film_json>

ex:Films ex:[films.id] {
    schema:name [films.name] ;
    ex:year dbr:[films.year] ;
    schema:countryOfOrigin dbr:[films.country] ;
    schema:director dbr:[films.directors] ;
    ex:screenwritter dbr:[films.screenwritters] ;
    schema:musicBy dbr:[films.music] ;
}
`

var resultEditor = CodeMirror(document.querySelector("#resultEditor"), {
    lineNumbers: true,
    lineWrapping: true,
    theme: "default",
    viewportMargin: Infinity
})

var shexEditor = YASHE(document.querySelector("#shexEditor"), {
    value: "",
    lineNumbers: true,
    lineWrapping: true,
    theme: "default",
    viewportMargin: Infinity,
    showShareButton: false
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
    $.ajax("http://shexml.herminiogarcia.com:8080/generate", {
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

$("#submitButtonShEx").click(function(){
    var shexmldocument = editor.getValue();
    var content = {
        shexml: shexmldocument
    }
    $.ajax("http://shexml.herminiogarcia.com:8080/generateShEx", {
        "data": JSON.stringify(content),
        "type": "POST",
        "processData": false,
        "dataType": "text",
        "contentType": "application/json",
        "success": function(data) {
            shexEditor.setValue(data);
            nonLoadingButtonShEx();
        },
        "error": function(jqXHR, textStatus, errorThrown) {
            createAlert(jqXHR.responseText);
            nonLoadingButtonShEx();
        }
    });
    loadingButtonShEx();
});

$('#goToShExButton').click(function(){
    var shexDocument = encodeURIComponent(shexEditor.getValue());
    var resultDocument = encodeURIComponent(resultEditor.getValue());
    var externalURL = "http://rdfshape.weso.es/shExValidate"+
        "?activeSchemaTab=%23schemaTextArea&activeTab=%23dataTextArea&data=" + resultDocument + 
        "&dataFormat=TURTLE&dataFormatTextArea=TURTLE&endpoint=&inference=None&schema=" + shexDocument +
        "&schemaEmbedded=false&schemaEngine=ShEx&schemaFormat=ShExC&schemaFormatTextArea=ShExC"+
        "&shapeMap= &shapeMapActiveTab=%23shapeMapTextArea&shapeMapFormat=Compact&shapeMapFormatTextArea=Compact&triggerMode=shapeMap" ;
    console.log(externalURL);
    window.open(externalURL);
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

function loadingButtonShEx() {
    $("#submitButtonShEx").toggle();
    $("#loadingButtonShEx").toggle();
}

function nonLoadingButtonShEx() {
    $("#submitButtonShEx").toggle();
    $("#loadingButtonShEx").toggle();
}