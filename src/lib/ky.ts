import ky, { HTTPError } from "ky";

const kyInstance = ky.create({
    timeout: 30000, // 30 seconds
    parseJson: (text) =>
        JSON.parse(text, (key, value) => {
            if (key.endsWith("At")) return new Date(value);
            return value;
        }),
});

export default kyInstance;

export async function handleApiError(err: unknown, fallback: string): Promise<never> {
    if (err instanceof HTTPError) {
        const data = (await err.response.json()) as { error?: string };
        throw new Error(data.error || fallback);
    }

    if (err instanceof Error) throw err;

    throw new Error(fallback);
}