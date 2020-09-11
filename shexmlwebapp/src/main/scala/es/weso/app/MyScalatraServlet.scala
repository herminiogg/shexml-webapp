package es.weso.app

import es.weso.shexml.MappingLauncher
import org.json4s.{DefaultFormats, Formats}
import org.scalatra._
import org.scalatra.json._

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

}

case class Content(shexml: String, format: String)
