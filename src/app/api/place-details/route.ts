// app/api/place-details/route.ts (Next.js 13/14 App Router)
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const placeId = request.nextUrl.searchParams.get("place_id");

    if (!placeId) {
        return NextResponse.json({ error: "Missing place_id" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY; // use env var!
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
}
