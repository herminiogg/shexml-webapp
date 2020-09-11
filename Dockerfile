FROM ubuntu
COPY ShExMLFrontEnd /frontend
COPY shexmlwebapp /api
RUN apt-get update && apt-get install -y openjdk-8-jdk apache2 git locales gnupg2
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN apt-get install -y apt-transport-https ca-certificates
RUN echo "deb https://dl.bintray.com/sbt/debian /" | tee -a /etc/apt/sources.list.d/sbt.list
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823
RUN apt-get update 
RUN apt-get install -y sbt
RUN cp -R frontend/* /var/www/html
EXPOSE 80 8080
CMD cd api && service apache2 start && sbt "~;jetty:stop;jetty:start"