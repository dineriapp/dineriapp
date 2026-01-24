"use server";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

const BUCKET = process.env.AWS_BUCKET_NAME!;
const REGION = process.env.AWS_BUCKET_REGION!;

const acceptedTypes = [
    // Screenshots / images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",

    // Documents
    "application/pdf",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
    "text/plain", // .txt
];


const maxFileSize = 1024 * 1024 * 5;

// ✅ Build public URL
function publicS3Url(key: string) {
    return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
}

/**
 * Generates signed URL for uploading one image.
 */
export async function getSignedURL(
    type: string,
    size: number,
    checksum: string,
    name: string // now required
) {
    if (!acceptedTypes.includes(type)) {
        return { success: false, error: "Invalid File Type" };
    }

    if (size > maxFileSize) {
        return { success: false, error: "File too large" };
    }

    // ✅ New key format: uuid + original name
    const key = `${uuid()}-${name}`;

    const putOriginal = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: type,
        ContentLength: size,
        ChecksumSHA256: checksum,
        CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(s3, putOriginal, { expiresIn: 60 });

    return {
        success: true,
        data: {
            uploadUrl,
            publicUrl: publicS3Url(key),
            key,
        },
    };
}
