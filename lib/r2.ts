import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;

export const r2 = accountId
  ? new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!r2) throw new Error("R2 not configured");
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function putJsonToR2(key: string, data: unknown): Promise<void> {
  if (!r2) throw new Error("R2 not configured");
  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: JSON.stringify(data, null, 2),
      ContentType: "application/json",
    })
  );
}

export async function getJsonFromR2<T>(key: string): Promise<T | null> {
  if (!r2) return null;
  try {
    const res = await r2.send(
      new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key })
    );
    const body = await res.Body?.transformToString();
    return body ? (JSON.parse(body) as T) : null;
  } catch {
    return null;
  }
}
