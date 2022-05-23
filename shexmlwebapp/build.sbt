val ScalatraVersion = "2.6.3"

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
  "org.eclipse.jetty" % "jetty-webapp" % "9.4.9.v20180320" % "container",
  "javax.servlet" % "javax.servlet-api" % "3.1.0" % "provided",
  "com.github.herminiogg" % "shexml" % "master-SNAPSHOT",
  "com.github.herminiogg" % "xmlschema2shex" % "a4d46de",
  "org.scalatra" %% "scalatra-json" % ScalatraVersion,
  "org.json4s"   %% "json4s-jackson" % "3.5.2",
)

enablePlugins(SbtTwirl)
enablePlugins(ScalatraPlugin)
