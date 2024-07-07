FROM virtuslab/scala-cli:latest as build

COPY *.scala /work/
WORKDIR /work
RUN scala-cli --power package Job.scala -o server.jar --assembly

FROM gcr.io/distroless/java17-debian12
COPY --from=build /work/server.jar /work/
WORKDIR /work
CMD ["/work/server.jar"]
