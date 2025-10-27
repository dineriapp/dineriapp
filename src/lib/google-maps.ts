let isLoaded = false;
let isLoading = false;
const callbacks: (() => void)[] = [];

export function loadGoogleMapsScript(apiKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (isLoaded) {
            resolve();
            return;
        }

        if (isLoading) {
            callbacks.push(resolve);
            return;
        }

        isLoading = true;

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            isLoaded = true;
            isLoading = false;
            resolve();
            callbacks.forEach(cb => cb());
            callbacks.length = 0;
        };

        script.onerror = () => {
            isLoading = false;
            reject(new Error("Failed to load Google Maps"));
        };

        document.head.appendChild(script);
    });
}

export function isGoogleMapsLoaded(): boolean {
    return isLoaded && typeof window !== "undefined" && !!window.google;
}