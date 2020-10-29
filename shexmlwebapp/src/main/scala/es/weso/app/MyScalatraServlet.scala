package es.weso.app

import java.net.URL

import es.weso.shexml.MappingLauncher
import es.weso.xmlschema2shex.parser.XMLSchema2ShexParser
import javax.xml.transform.stream.StreamSource
import javax.xml.validation.SchemaFactory
import org.json4s.{DefaultFormats, Formats}
import org.scalatra._
import org.scalatra.json._

import scala.io.Source
import scala.util.{Failure, Success, Try}

class MyScalatraServlet extends ScalatraServlet with CorsSupport with JacksonJsonSupport {

  protected implicit lazy val jsonFormats: Formats = DefaultFormats

  options("/*") {
    response.setHeader("Access-Control-Allow-Origin", request.getHeader("Origin"))
  }

  get("/") {
    views.html.hello()
  }

  post("/generate") {
    val content = parsedBody.extract[Content]
    val mappingLauncher = new MappingLauncher()
    val result = Try(mappingLauncher.launchMapping(content.shexml, content.format))
    result match {
      case Success(r) => Ok(r)
      case Failure(error) => BadRequest(error.getMessage)
    }
  }

  post("/generateRML") {
    val content = parsedBody.extract[Content]
    val mappingLauncher = new MappingLauncher()
    val result = Try(mappingLauncher.launchRMLTranslation(content.shexml))
    result match {
      case Success(r) => Ok(r)
      case Failure(error) => BadRequest(error.getMessage)
    }
  }

  post("/generateShEx") {
    val content = parsedBody.extract[ShExGeneration]
    val mappingLauncher = new MappingLauncher()
    val result = Try(mappingLauncher.launchShExGeneration(content.shexml))
    result match {
      case Success(r) => Ok(r)
      case Failure(error) => BadRequest(error.getMessage)
    }
  }

  post("/validateXMLFile") {
    val content = parsedBody.extract[XMLValidation]
    val xml = content.xml
    val xsd = content.xsd
    validateXMLFile(xml, xsd) match {
      case Success(_) => Ok()
      case Failure(error) => BadRequest(error.getMessage)
    }
  }

  post("/generateShexmlFromXSD") {
    val content = parsedBody.extract[XMLValidation]
    val xsd = downloadFileFromURL(content.xsd)
    val xmlURL = content.xml
    val result = Try(XMLSchema2ShexParser().convertToShExML(xsd))
    result match {
      case Success(r) => {
        val response = changeSource(r, xmlURL)
        Ok(response)
      }
      case Failure(error) => BadRequest(error.getMessage)
    }
  }

  private def validateXMLFile(xml: String, xsd: String): Try[Unit] = {
    val schemaLang = "http://www.w3.org/2001/XMLSchema"
    val schemaFactory = SchemaFactory.newInstance(schemaLang)
    val schema = schemaFactory.newSchema(new URL(xsd))
    val validator = schema.newValidator()
    Try(validator.validate(new StreamSource(xml)))
  }

  private def changeSource(r: String, url: String): String = {
    r.split("\n").map(l => {
      if(l.contains("SOURCE")) {
        "SOURCE example <" + url + ">"
      } else l
    }).mkString("\n")
  }

  private def downloadFileFromURL(url: String): String = {
    val source = Source.fromURL(url)
    try {
      source.mkString
    } finally {
      source.close()
    }
  }

}

case class Content(shexml: String, format: String)
case class ShExGeneration(shexml: String)
case class XMLValidation(xml: String, xsd: String)
