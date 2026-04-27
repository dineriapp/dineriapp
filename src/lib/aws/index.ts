
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export const BUCKET = process.env.AWS_BUCKET_NAME!;
export const REGION = process.env.AWS_BUCKET_REGION!;

export async function deleteS3Objects(inputs: string[]): Promise<{
    success: boolean;
    deleted: string[];
    failed: string[];
}> {
    // Convert URLs to keys if needed
    const keys = inputs
        .filter(Boolean)
        .map((input) => {
            try {
                if (input.startsWith("http")) {
                    // Extract key from URL path
                    return decodeURIComponent(new URL(input).pathname.slice(1));
                }
                return input; // Already a key
            } catch {
                return input; // fallback in case URL parsing fails
            }
        });

    // Deduplicate keys
    const uniqueKeys = [...new Set(keys)];

    if (uniqueKeys.length === 0) {
        return { success: true, deleted: [], failed: [] };
    }

    const results = await Promise.allSettled(
        uniqueKeys.map((key) =>
            s3.send(
                new DeleteObjectCommand({
                    Bucket: BUCKET,
                    Key: key,
                })
            )
        )
    );

    const deleted: string[] = [];
    const failed: string[] = [];

    results.forEach((res, idx) => {
        const key = uniqueKeys[idx];
        if (res.status === "fulfilled") {
            deleted.push(key);
        } else {
            failed.push(key);
            console.warn(`⚠️ Failed to delete [${key}]:`, res.reason);
        }
    });

    return {
        success: failed.length === 0,
        deleted,
        failed,
    };
}