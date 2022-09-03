import crypto from "crypto";
export function createBucketName(applicationName: string, applicationId: number) {
  return `${applicationName}_bucket_${crypto
    .createHash("md5")
    .update(applicationName + applicationId)
    .digest("hex")}`;
}
