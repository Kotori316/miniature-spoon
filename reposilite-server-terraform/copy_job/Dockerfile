FROM virtuslab/scala-cli:latest as build

COPY *.scala /work/
WORKDIR /work
RUN scala-cli --power package Job.scala -o server.jar --assembly

FROM eclipse-temurin:21-jre
COPY --from=build /work/server.jar /work/
WORKDIR /work
CMD ["java", "-jar", "/work/server.jar"]
