import { Loader } from '@googlemaps/js-api-loader';

let mapsPromise;

export function loadGoogleMaps() {
    if (!mapsPromise) {
        const loader = new Loader({
            apiKey: import.meta.env.VITE_APP_MAP_KEY,
            version: 'weekly',
            libraries: ['places', 'geometry'],
        });
        mapsPromise = loader.load();   // load once
    }
    return mapsPromise;              // reuse same promise
}