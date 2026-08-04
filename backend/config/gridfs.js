import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket;

/**
 * Call this ONCE, right after mongoose.connect() resolves (in server.js).
 * GridFS stores files as chunks in two collections:
 *   studentDocuments.files  (metadata)
 *   studentDocuments.chunks (binary data, 255KB chunks)
 * This avoids the 16MB BSON document-size limit you'd hit embedding
 * raw file buffers directly inside StudentProfile.documents.
 */
export function initGridFS() {
  const db = mongoose.connection.db;
  bucket = new GridFSBucket(db, { bucketName: "studentDocuments" });
  console.log("GridFS bucket 'studentDocuments' ready");
  return bucket;
}

export function getBucket() {
  if (!bucket) {
    throw new Error(
      "GridFS bucket not initialized. Call initGridFS() after mongoose connects."
    );
  }
  return bucket;
}