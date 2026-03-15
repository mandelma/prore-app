import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loadGoogleMaps } from '@/components/controllers/loadGoogleMap'

export const useMapStore = defineStore('location', () => {
    const mapsReady = ref(false)

    const userPos = ref(null)       // freshest location
    const lastKnownPos = ref(null)  // cached location for instant map open
    const isLocating = ref(false)
    const locationError = ref('')

    const getCurrentPos = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    resolve({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    })
                },
                (err) => {
                    console.error('Geolocation error:', err.code, err.message)
                    reject(err)
                },
                {
                    enableHighAccuracy: false,
                    timeout: 12000,
                    maximumAge: 300000, // allow cached browser location up to 5 min
                }
            )
        })
    }

    const loadLastKnownPos = () => {
        try {
            const raw = localStorage.getItem('lastKnownPos')
            if (!raw) return null
            return JSON.parse(raw)
        } catch {
            return null
        }
    }

    const saveLastKnownPos = (pos) => {
        try {
            localStorage.setItem('lastKnownPos', JSON.stringify(pos))
        } catch {
            // ignore storage errors
        }
    }

    const init = async () => {
        if (!mapsReady.value) {
            await loadGoogleMaps()
            mapsReady.value = true
        }

        // instant fallback from previous successful location
        if (!lastKnownPos.value) {
            lastKnownPos.value = loadLastKnownPos()
        }

        // if no fresh location yet, use cached one for initial render
        if (!userPos.value && lastKnownPos.value) {
            userPos.value = lastKnownPos.value
        }

        isLocating.value = true
        locationError.value = ''

        try {
            const freshPos = await getCurrentPos()
            userPos.value = freshPos
            lastKnownPos.value = freshPos
            saveLastKnownPos(freshPos)
        } catch (e) {
            console.error('Location init failed:', e)
            locationError.value = e?.message || 'Location failed'

            // keep cached location if available
            if (!userPos.value && lastKnownPos.value) {
                userPos.value = lastKnownPos.value
            }
        } finally {
            isLocating.value = false
        }
    }

    return {
        mapsReady,
        userPos,
        lastKnownPos,
        isLocating,
        locationError,
        init,
    }
})