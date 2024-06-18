//> using jvm "21"
//> using dep "com.lihaoyi::cask:0.9.2"
//> using dep "com.google.cloud:google-cloud-storage:2.40.0"
//> using dep "software.amazon.awssdk:s3:2.26.3"
//> using dep "software.amazon.awssdk:s3-transfer-manager:2.26.3"
//> using dep "software.amazon.awssdk.crt:aws-crt:0.29.23"

import cask.endpoints.WebEndpoint
import cask.model.Response.Raw
import cask.model.{Request, Response}
import cask.router.{Decorator, RawDecorator, Result}
import com.google.cloud.storage.{Blob, BlobId, StorageOptions}
import software.amazon.awssdk.auth.credentials.{AwsBasicCredentials, StaticCredentialsProvider}
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3AsyncClient
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.transfer.s3.S3TransferManager
import software.amazon.awssdk.transfer.s3.model.UploadFileRequest
import ujson.Obj

import java.net.URI
import java.nio.file.Files
import java.util.Base64
import scala.collection.mutable
import scala.util.Try

object Server extends cask.MainRoutes:

  override def port: Int = Option(System.getenv("PORT")).flatMap(_.toIntOption).getOrElse(super.port)

  override def host: String = "0.0.0.0"

  @cask.get("/")
  def hello(req: cask.Request, param: cask.QueryParams): cask.Response[String] =
    cask.Response("Hello Cask", 200)
  end hello

  @cask.post("/post")
  def post(req: cask.Request, param: cask.QueryParams): Response[Obj] =
    val jsonEither = Data.readJson(req)

    val storageObject = for {
      json <- jsonEither
      storageObject <- Data.getStorageObject(json)
    } yield storageObject

    storageObject match
      case Left(value) =>
        println(ujson.write(ujson.Obj(
          "reason" -> value.toString,
          "json" -> jsonEither.getOrElse(Map.empty)
        )))
        cask.Response(ujson.Obj("message" -> "Invalid request", "reason" -> value.toString), 400)
      case Right(value) =>

        val result = for {
          blob <- Data.getStorageObjectAsBlob(value)
          r <- Data.uploadFileToS3(blob)
        } yield r
        result match
          case Left(f) =>
            val obj = ujson.Obj(
              "message" -> s"Failed to upload file (${value.name})",
              "reason" -> f.toString,
              "bucket" -> value.bucket,
              "object" -> value.name,
            )
            println(ujson.write(obj))
            cask.Response(obj, 500)
          case Right(_) =>
            val obj = ujson.Obj(
              "message" -> s"OK, uploaded (${value.name})",
              "bucket" -> value.bucket,
              "object" -> value.name
            )
            println(ujson.write(obj))
            cask.Response(obj, 200)

    end match
  end post

  override def mainDecorators: Seq[Decorator[?, ?, ?]] = Seq(
    new LogCalls()
  )

  initialize()

end Server

class LogCalls(implicit logger: cask.Logger) extends RawDecorator:
  override def wrapFunction(ctx: Request, delegate: Delegate): Result[Raw] =
    val requestData = s"${ctx.exchange.getRequestMethod} ${ctx.exchange.getRequestURL}"
    println(ujson.write(ujson.Obj(
      "message" -> requestData,
      "query" -> ctx.queryParams.view.mapValues(_.mkString(",")),
      "header" -> ctx.headers.view.filterKeys(key => !key.equalsIgnoreCase("authorization")).mapValues(_.mkString(",")),
    )))
    delegate(WebEndpoint.buildMapFromQueryParams(ctx))
  end wrapFunction
end LogCalls

object Data:
  enum ErrorType:
    case General
    case ParseError(reason: String)
    case StorageReadError(reason: String)
    case AwsWriteError(reason: String)
  end ErrorType

  case class StorageObject(bucket: String, name: String)

  def readJson(req: cask.Request): Either[Data.ErrorType, mutable.Map[String, ujson.Value]] =
    Try(ujson.read(req.data)).flatMap(v => Try(v.obj)).toEither.left.map(e => Data.ErrorType.ParseError(e.getMessage))

  def parseData(base64String: String): Either[Data.ErrorType, ujson.Value] = Try {
    val decoded = Base64.getDecoder.decode(base64String)
    ujson.read(decoded)
  }.toEither.left.map(e => Data.ErrorType.ParseError(e.getMessage))

  def getStorageObject(json: mutable.Map[String, ujson.Value]): Either[ErrorType, StorageObject] =
    for {
      bucket <- json.get("bucket").toRight(ErrorType.ParseError("Key 'bucket' is not found")).flatMap(_.strOpt.toRight(ErrorType.ParseError("Not a string('bucket')")))
      name <- json.get("name").toRight(ErrorType.ParseError("Key 'bucket' is not found")).flatMap(_.strOpt.toRight(ErrorType.ParseError("Not a string('name')")))
    } yield StorageObject(bucket, name)

  private val cloudStorageClient = StorageOptions.getDefaultInstance.getService
  private val s3Client = S3AsyncClient
    .crtBuilder()
    .endpointOverride(URI.create(System.getenv("CLOUDFLARE_S3_ENDPOINT")))
    .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(System.getenv("CLOUDFLARE_ACCESS_KEY"), System.getenv("CLOUDFLARE_SECRET_KEY"))))
    .region(Region.of("auto"))
    .checksumValidationEnabled(false)
    .build()
  private val transferManager = S3TransferManager.builder()
    .s3Client(s3Client)
    .build()

  def getStorageObjectAsBlob(obj: StorageObject): Either[ErrorType, Blob] =
    Try(cloudStorageClient.get(BlobId.of(obj.bucket, obj.name))).toEither.left.map(e => Data.ErrorType.StorageReadError(e.getMessage))

  def uploadFileToS3(blob: Blob): Either[Data.ErrorType, Unit] =
    Try {
      val path = Files.createTempFile(null, null)
      blob.downloadTo(path)
      val putObjectRequest = PutObjectRequest.builder()
        .bucket("kotori316-maven")
        .key(blob.getName.substring(blob.getName.indexOf("/") + 1))
        .build()
      val uploadRequest = UploadFileRequest.builder()
        .source(path)
        .putObjectRequest(putObjectRequest)
        .build()
      val uploader = transferManager.uploadFile(uploadRequest)
      uploader.completionFuture().join()
      ()
    }.toEither.left.map(t => ErrorType.AwsWriteError(t.getMessage))
end Data
