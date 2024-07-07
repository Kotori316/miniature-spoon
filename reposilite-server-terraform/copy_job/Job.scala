//> using jvm "21"
//> using dep "com.google.cloud:google-cloud-storage:2.40.1"
//> using dep "com.google.firebase:firebase-admin:9.3.0"
//> using dep "software.amazon.awssdk:s3:2.26.16"
//> using dep "software.amazon.awssdk:s3-transfer-manager:2.26.16"
//> using dep "software.amazon.awssdk.crt:aws-crt:0.30.0"
//> using dep "org.slf4j:slf4j-simple:2.0.13"
//> using dep "org.typelevel::cats-core:2.12.0"

import cats.Traverse
import cats.data.EitherT
import cats.implicits.catsSyntaxEitherId
import com.google.auth.oauth2.GoogleCredentials
import com.google.cloud.firestore.FirestoreOptions
import com.google.cloud.storage.{Blob, BlobId, StorageOptions}
import software.amazon.awssdk.auth.credentials.{AwsBasicCredentials, StaticCredentialsProvider}
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3AsyncClient
import software.amazon.awssdk.services.s3.model.{PutObjectRequest, PutObjectResponse}
import software.amazon.awssdk.transfer.s3.S3TransferManager
import software.amazon.awssdk.transfer.s3.model.UploadFileRequest

import java.net.URI
import java.nio.file.Files
import java.util.concurrent.TimeUnit
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
import scala.jdk.CollectionConverters.{ListHasAsScala, MapHasAsScala}
import scala.jdk.javaapi.FutureConverters
import scala.util.Try

case class CopyObject(fireStoreId: String, source: String, destination: String) {
  def sourcePath: String = URI.create(source).getPath

  def sourceBucket: String = URI.create(source).getHost

  def destinationPath: String = URI.create(destination).getPath

  def destinationBucket: String = URI.create(destination).getHost
}

enum ErrorType:
  case TimeOut
  case FireStore(reason: String)
  case StorageReadError(reason: String)
  case AwsWriteError(reason: String)

private val fireStoreOptions = FirestoreOptions.newBuilder()
  .setDatabaseId("(default)")
  .setCredentials(GoogleCredentials.getApplicationDefault)
  .build()
private val db = fireStoreOptions.getService
private val cloudStorageClient = StorageOptions.getDefaultInstance.getService
private val s3Client = S3AsyncClient
  .crtBuilder()
  .endpointOverride(URI.create(sys.env.getOrElse("AWS_ENDPOINT_URL_S3", "https://s3.amazonaws.com")))
  .checksumValidationEnabled(false)
  .build()
private val transferManager = S3TransferManager.builder()
  .s3Client(s3Client)
  .build()
private val collectionName = "MavenCopy"

@main
def main(): Unit =
  println("Hello")

  val targets = getTargets
  val copyTask = targets.flatMap { s =>
    Traverse[Seq].traverse(s)(copy)
  }

  val e = Await.result(copyTask.value, Duration(1, TimeUnit.MINUTES))
  e match
    case Right(value) =>
      println(value)
      println(value.map(t => (t.sourceBucket, t.sourcePath, t.destinationBucket, t.destinationPath)))
    case Left(value) =>
      println(value)

  println("End")
end main

def getTargets: EitherT[Future, ErrorType, Seq[CopyObject]] =
  val allTargets = Future(db.collection(collectionName).limit(2).get())
    .flatMap(f => Future(f.get()))
    .map(q => q.getDocuments.asScala.map { s =>
      val m = s.getData.asScala
      CopyObject(
        source = m("source_url").toString,
        destination = m("destination_url").toString,
        fireStoreId = s.getId,
      )
    })
    .map(_.toSeq)
    .map(s => s.asRight[ErrorType])
  val recovered = allTargets.recover(t => ErrorType.FireStore(t.getMessage).asLeft)
  EitherT(recovered)

def copy(copyObject: CopyObject): EitherT[Future, ErrorType, CopyObject] =
  for {
    blob <- getBlob(copyObject)
    putObjectResponse <- uploadFileToS3(blob, copyObject)
    t <- deleteFinishedWork(copyObject)
  } yield t

def getBlob(o: CopyObject): EitherT[Future, ErrorType, Blob] =
  EitherT.fromEither(
    Try(
      cloudStorageClient.get(BlobId.fromGsUtilUri(o.source))
    ).toEither.left.map(e => ErrorType.StorageReadError(e.getMessage))
  )

def uploadFileToS3(blob: Blob, copyObject: CopyObject): EitherT[Future, ErrorType, PutObjectResponse] =
  EitherT {
    Future {
      val path = Files.createTempFile(null, null)
      blob.downloadTo(path)
      val putObjectRequest = PutObjectRequest.builder()
        .bucket(copyObject.destinationBucket)
        .key(copyObject.destinationPath)
        .build()
      val uploadRequest = UploadFileRequest.builder()
        .source(path)
        .putObjectRequest(putObjectRequest)
        .build()
      transferManager.uploadFile(uploadRequest)
    }.flatMap(uploader => FutureConverters.asScala(uploader.completionFuture()))
      .map(r => r.response().asRight)
      .recover(t => ErrorType.AwsWriteError(t.getMessage).asLeft)
  }

def deleteFinishedWork(copyObject: CopyObject): EitherT[Future, ErrorType, CopyObject] =
  EitherT {
    Future(db.collection(collectionName).document(copyObject.fireStoreId).delete().get())
      .map(r => copyObject.asRight)
      .recover(t => ErrorType.FireStore(t.getMessage).asLeft)
  }
