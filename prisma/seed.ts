import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

// fixed password for all accounts
const FIXED_PASSWORD = "P2002113AWcc";

async function hashPassword(password: string) {
    return await argon2.hash(password, {
        memoryCost: 2 ** 16,
        timeCost: 2,
        parallelism: 1,
    });
}

async function main() {
    console.log("🚀 Starting account creation for existing users...");

    // hash password once
    const hashedPassword = await hashPassword(FIXED_PASSWORD);

    // fetch all users
    await prisma.account.deleteMany()
    const users = await prisma.user.findMany();
    console.log(`👥 Found ${users.length} users.`);

    for (const user of users) {
        // check if account exists
        const existingAccount = await prisma.account.findFirst({
            where: { userId: user.id },
        });

        if (existingAccount) {
            console.log(`⚠️ Account already exists for ${user.email} — skipped.`);
            continue;
        }

        // create account
        await prisma.account.create({

            data: {
                accountId: user.id,
                providerId: "credential",
                userId: user.id,
                password: hashedPassword,
            },
        });

        console.log(`✅ Account created for ${user.email}`);
    }

    console.log("🎉 All missing accounts have been created successfully.");
}

main()
    .catch((e) => {
        console.error("❌ Error creating accounts:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
