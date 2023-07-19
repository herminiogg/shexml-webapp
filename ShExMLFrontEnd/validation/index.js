var editor = YASHEML(document.querySelector("#editor"), {
    lineNumbers: true,
    lineWrapping: true,
    theme: "default",
    viewportMargin: Infinity
});
var filmsShExML = `PREFIX ex: <http://example.com/>
PREFIX dbr: <http://dbpedia.org/resource/>
PREFIX schema: <http://schema.org/>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
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

ex:Film ex:[films.id] {
    a ex:Film ;
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
});

if($('#shexEditor').length > 0) {
    var shexEditor = YASHE(document.querySelector("#shexEditor"), {
        value: "",
        lineNumbers: true,
        lineWrapping: true,
        theme: "default",
        viewportMargin: Infinity,
        showShareButton: false
    });
}
if($('#shapeMapEditor').length > 0) {
    var shapeMapEditor = CodeMirror(document.querySelector("#shapeMapEditor"), {
        lineNumbers: true,
        lineWrapping: true,
        theme: "default",
        viewportMargin: Infinity
    });
}

if($('#shaclEditor').length > 0) {
    var shaclEditor = CodeMirror(document.querySelector("#shaclEditor"), {
        lineNumbers: true,
        lineWrapping: true,
        theme: "default",
        viewportMargin: Infinity
    });
}

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

if($('#submitButtonShEx').length > 0) {
    $("#submitButtonShEx").click(function(){
        var shexmldocument = editor.getValue();
        var content = {
            shexml: shexmldocument
        }
        $.ajax("https://shexml.herminiogarcia.com:8080/generateShEx", {
            "data": JSON.stringify(content),
            "type": "POST",
            "processData": false,
            "dataType": "text",
            "contentType": "application/json",
            "success": function(data) {
                shexEditor.setValue(data);
                generateShapeMap(content);
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                createAlert(jqXHR.responseText);
                nonLoadingButtonShEx();
            }
        });
        loadingButtonShEx();
    });

    function generateShapeMap(content) {
        $.ajax("https://shexml.herminiogarcia.com:8080/generateShapeMap", {
            "data": JSON.stringify(content),
            "type": "POST",
            "processData": false,
            "dataType": "text",
            "contentType": "application/json",
            "success": function(data) {
                shapeMapEditor.setValue(data);
                nonLoadingButtonShEx();
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                createAlert(jqXHR.responseText);
                nonLoadingButtonShEx();
            }
        });
    }
}

if($('#submitButtonSHACL').length > 0) {
    $("#submitButtonSHACL").click(function(){
        var shexmldocument = editor.getValue();
        var content = {
            shexml: shexmldocument,
            closed: ($('#closedShapes').val() == 'true')
        }
        $.ajax("https://shexml.herminiogarcia.com:8080/generateSHACL", {
            "data": JSON.stringify(content),
            "type": "POST",
            "processData": false,
            "dataType": "text",
            "contentType": "application/json",
            "success": function(data) {
                shaclEditor.setValue(data);
                nonLoadingButtonSHACL();
            },
            "error": function(jqXHR, textStatus, errorThrown) {
                createAlert(jqXHR.responseText);
                nonLoadingButtonSHACL();
            }
        });
        loadingButtonSHACL();
    });
}

if($('#goToShExButton').length > 0) {
    $('#goToShExButton').click(function(){
        var shexDocument = encodeURIComponent(shexEditor.getValue());
        var resultDocument = encodeURIComponent(resultEditor.getValue());
        var shapeMapDocument = encodeURIComponent(shapeMapEditor.getValue());
        var externalURL = "http://rdfshape.weso.es/shExValidate"+
            "?activeSchemaTab=%23schemaTextArea&activeTab=%23dataTextArea&data=" + resultDocument + 
            "&dataFormat=TURTLE&dataFormatTextArea=TURTLE&endpoint=&inference=None&schema=" + shexDocument +
            "&schemaEmbedded=false&schemaEngine=ShEx&schemaFormat=ShExC&schemaFormatTextArea=ShExC"+
            "&shapeMap="+ shapeMapDocument +"&shapeMapActiveTab=%23shapeMapTextArea&shapeMapFormat=Compact&shapeMapFormatTextArea=Compact&triggerMode=shapeMap" ;
        console.log(externalURL);
        window.open(externalURL);
    });
}

if($('#goToSHACLButton').length > 0) {
    $('#goToSHACLButton').click(function(){
        var shaclDocument = encodeURIComponent(shaclEditor.getValue());
        var resultDocument = encodeURIComponent(resultEditor.getValue());
        var externalURL = "http://rdfshape.weso.es/shaclValidate"+
            "?activeSchemaTab=%23schemaTextArea&activeTab=%23dataTextArea&data=" + resultDocument + 
            "&dataFormat=TURTLE&dataFormatTextArea=TURTLE&inference=None&schema=" + shaclDocument +
            "&schemaEmbedded=false&schemaEngine=SHACLex&schemaFormat=TURTLE&schemaFormatTextArea=TURTLE&schemaInference=none&triggerMode=targetDecls" ;
        console.log(externalURL);
        window.open(externalURL);
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

function loadingButtonShEx() {
    $("#submitButtonShEx").toggle();
    $("#loadingButtonShEx").toggle();
}

function nonLoadingButtonShEx() {
    $("#submitButtonShEx").toggle();
    $("#loadingButtonShEx").toggle();
}

function loadingButtonSHACL() {
    $("#submitButtonSHACL").toggle();
    $("#loadingButtonSHACL").toggle();
}

function nonLoadingButtonSHACL() {
    $("#submitButtonSHACL").toggle();
    $("#loadingButtonSHACL").toggle();
}