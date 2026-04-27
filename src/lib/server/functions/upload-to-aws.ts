"use server";

import { BUCKET, REGION, s3 } from "@/lib/aws";
import { acceptedTypes } from "@/lib/utils";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuid } from "uuid";

const maxFileSize = 1024 * 1024 * 10;

// Build public URL
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

    // New key format: uuid + original name
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
