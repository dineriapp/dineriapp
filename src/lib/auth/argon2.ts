import argon2 from "argon2";

export async function hashPassword(password: string) {
    return await argon2.hash(password, {
        memoryCost: 2 ** 16,
        timeCost: 2,
        parallelism: 1,
    });
}

export async function verifyPassword(data: { password: string; hash: string }) {
    const { password, hash } = data;
    return await argon2.verify(hash, password);
}
