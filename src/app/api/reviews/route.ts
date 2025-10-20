// app/api/reviews/route.ts
import { getTranslations } from 'next-intl/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const t = await getTranslations("reviews_api")
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get('placeId');

    if (!placeId) {
        return NextResponse.json({ error: t("errors.missing_place_id") }, { status: 400 });
    }

    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (
            response.ok &&
            data.status === 'OK' &&
            data.result?.rating !== undefined &&
            data.result?.user_ratings_total !== undefined
        ) {
            return NextResponse.json({
                rating: data.result.rating,
                user_ratings_total: data.result.user_ratings_total,
            });
        } else {
            console.warn('Google Place API error or missing fields:', data);
            return NextResponse.json({ error: t("errors.invalid_google_api_response"), details: data }, { status: 502 });
        }
    } catch (err) {
        console.error('Error fetching Google Place reviews:', err);
        return NextResponse.json({ error: t("errors.server_error"), details: err }, { status: 500 });
    }
}
