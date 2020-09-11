import es.weso.app._
import org.scalatra._
import javax.servlet.ServletContext

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) {
    context.setInitParameter("org.scalatra.cors.allowCredentials", "false")
    context.mount(new MyScalatraServlet, "/*")
  }
}
