val ScalatraVersion = "3.1.1"

ThisBuild / scalaVersion := "3.3.4"
ThisBuild / organization := "es.weso"

lazy val shexmlwebapp = (project in file("."))
  .settings(
    name := "ShExMLWebApp",
    version := "0.1.0-SNAPSHOT",
    libraryDependencies ++= Seq(
      "org.scalatra" %% "scalatra-jakarta" % ScalatraVersion,
      "org.scalatra" %% "scalatra-scalatest-jakarta" % ScalatraVersion % "test",
      "ch.qos.logback" % "logback-classic" % "1.5.6" % "runtime",
      "jakarta.servlet" % "jakarta.servlet-api" % "6.0.0" % "provided",
      "org.scalatra" %% "scalatra-json-jakarta" % ScalatraVersion,
      "org.json4s"   %% "json4s-jackson" % "4.0.6",
      "com.herminiogarcia" %% "shexml" % "0.5.4",
      "com.herminiogarcia" %% "xmlschema2shex" % "0.1.0"
    ),
  )

enablePlugins(SbtTwirl)
enablePlugins(SbtWar)

Test / fork := true