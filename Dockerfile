FROM ubuntu:18.04
RUN apt-get update && apt-get install -y openjdk-11-jdk apache2 git locales gnupg2 curl
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN apt-get install -y apt-transport-https ca-certificates
RUN echo "deb https://repo.scala-sbt.org/scalasbt/debian /" | tee -a /etc/apt/sources.list.d/sbt.list
RUN curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | apt-key add
RUN apt-get update 
RUN apt-get install -y sbt
COPY ShExMLFrontEnd /frontend
COPY shexmlwebapp /api
RUN cp -R frontend/* /var/www/html
EXPOSE 80 8080
CMD cd api && service apache2 start && sbt "~;jetty:stop;jetty:start"