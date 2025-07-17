import { useQuery } from '@tanstack/react-query';

const fetchGoogleReviews = async (placeId: string | null | undefined) => {
    const res = await fetch(`/api/reviews?placeId=${placeId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch Google reviews');
    }
    return res.json();
};

export const useGoogleReviews = (placeId: string | null | undefined) =>
    useQuery({
        queryKey: ['googleReviews', placeId],
        queryFn: () => fetchGoogleReviews(placeId),
        enabled: !!placeId,
        staleTime: 5 * 60 * 1000, // 5 minutes

    });
