val ScalatraVersion = "2.8.2"

organization := "es.weso"

name := "ShExMLWebApp"

version := "0.1.0-SNAPSHOT"

scalaVersion := "2.12.8"

resolvers += Classpaths.typesafeReleases

resolvers += "jitpack" at "https://jitpack.io"

libraryDependencies ++= Seq(
  "org.scalatra" %% "scalatra" % ScalatraVersion,
  "org.scalatra" %% "scalatra-scalatest" % ScalatraVersion % "test",
  "ch.qos.logback" % "logback-classic" % "1.2.3" % "runtime",
  "org.eclipse.jetty" % "jetty-webapp" % "9.4.43.v20210629" % "container",
  "javax.servlet" % "javax.servlet-api" % "3.1.0" % "provided",
  "com.herminiogarcia" %% "shexml" % "0.4.2" exclude("io.gatling", "gatling-jsonpath"),
  "com.herminiogarcia" %% "xmlschema2shex" % "0.1.0",
  "org.scalatra" %% "scalatra-json" % ScalatraVersion,
  "org.json4s"   %% "json4s-jackson" % "4.0.1",
)

enablePlugins(SbtTwirl)
enablePlugins(JettyPlugin)