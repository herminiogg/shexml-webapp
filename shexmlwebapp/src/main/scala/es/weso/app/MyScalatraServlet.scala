package es.weso.app

import java.net.URL
import com.herminiogarcia.shexml.MappingLauncher
import com.herminiogarcia.shexml.streaming.StreamMappingLauncher
import com.herminiogarcia.xmlschema2shex.parser.XMLSchema2ShexParser
import monix.execution.Scheduler
import javax.xml.transform.stream.StreamSource
import javax.xml.validation.SchemaFactory
import scala.concurrent.Await
import scala.concurrent.duration.Duration
//import org.json4s.{DefaultFormats, Formats}
import org.json4s._
import org.scalatra._
import org.scalatra.json._
import scala.io.Source
import scala.util.{Failure, Success, Try}
import monix.execution.Scheduler.Implicits.global

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
    val mappingLauncher = new MappingLauncher(
      inferenceDatatype = Try(content.inferDatatypes.toString.toBoolean).getOrElse(false), 
      normaliseURIs = Try(content.normaliseURLs.toString.toBoolean).getOrElse(false)
    )
    if(shexmlContainsFunctions(content.shexml)) {
      BadRequest("Functions execution is not allowed in this playground due to security reasons")
    } else {
      val result = Try(mappingLauncher.launchMapping(content.shexml, content.format))
      result match {
        case Success(r) => Ok(r)
        case Failure(error) => BadRequest(error.getMessage)
      }
    }
  }

  post("/generateRML") {
    val content = parsedBody.extract[RMLContent]
    val mappingLauncher = new MappingLauncher()
    val prettify = Try(content.prettify.toString.toBoolean).getOrElse(false)
    println(prettify)
    val result = Try(mappingLauncher.launchRMLTranslation(content.shexml, prettify))
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

  post("/generateShapeMap") {
    val content = parsedBody.extract[ShExGeneration]
    val mappingLauncher = new MappingLauncher()
    val result = Try(mappingLauncher.launchShapeMapGeneration(content.shexml))
    result match {
      case Success(r) => Ok(r)
      case Failure(error) => BadRequest(error.getMessage)
    }
  }

  post("/generateSHACL") {
    val content = parsedBody.extract[SHACLGeneration]
    val mappingLauncher = new MappingLauncher()
    val result = Try(mappingLauncher.launchSHACLGeneration(content.shexml, content.closed))
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
        val response = if(xmlURL.nonEmpty) changeSource(r, xmlURL) else r
        Ok(response)
      }
      case Failure(error) => BadRequest(error.getMessage)
    }
  }

  post("/streaming") {
    val content = parsedBody.extract[Content]
    response.setContentType("text/event-stream")
    response.setStatus(200)
    response.setHeader("Cache-Control", "no-cache")
    response.setHeader("Connection", "keep-alive")
    val writer = response.getWriter
    val mappingLauncher = new StreamMappingLauncher(
      inferenceDatatype = Try(content.inferDatatypes.toString.toBoolean).getOrElse(false),
      normaliseURIs = Try(content.normaliseURLs.toString.toBoolean).getOrElse(false)
    )
    if(shexmlContainsFunctions(content.shexml)) {
      BadRequest("Functions execution is not allowed in this playground due to security reasons")
    } else Try {
      val result = mappingLauncher.launchMapping(content.shexml, content.format)
      val future = result.flatMap(_.foreachL(e => {
        e.lines().forEach(l => {
          writer.write(s"data: $l\n")
          writer.flush()
        })
        writer.write("\n")
        writer.flush()
      })).runToFuture
      Await.ready(future, Duration.Inf)
      writer.close()
    }.getOrElse(e => InternalServerError(e))
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

  private def shexmlContainsFunctions(shexml: String): Boolean = {
    "[Ff][Uu][Nn][Cc][Tt][Ii][Oo][Nn][Ss]".r.findFirstIn(shexml).isDefined
  }

}

case class Content(shexml: String, format: String, inferDatatypes: String, normaliseURLs: String)
case class RMLContent(shexml: String, format: String, prettify: String)
case class ShExGeneration(shexml: String)
case class SHACLGeneration(shexml: String, closed: Boolean)
case class XMLValidation(xml: String, xsd: String)
