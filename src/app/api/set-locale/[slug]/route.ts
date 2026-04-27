import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const cook = await cookies()
    cook.set(`restaurant_locale_set_${slug}`, 'true');

    return NextResponse.json({ success: true });
}