/*global google*/

/* const formatDuration = (durationMillis) => {
    const totalMinutes = Math.round(durationMillis / 60000);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours} h ${minutes} min`;
    }

    return `${minutes} min`;
};

const findDistance = async (start, end) => {
    try {
        const { RouteMatrix } = await google.maps.importLibrary("routes");

        const { matrix } = await RouteMatrix.computeRouteMatrix({
            origins: [
                {
                    lat: start[0],
                    lng: start[1]
                }
            ],
            destinations: [
                {
                    lat: end[0],
                    lng: end[1]
                }
            ],
            travelMode: "DRIVING",
            fields: [
                "distanceMeters",
                "durationMillis"
            ]
        });

        const result = matrix.rows[0]?.items[0];

        if (!result || result.error) {
            console.error("Route Matrix error:", result?.error);
            return null;
        }

        return {
            distance: (result.distanceMeters / 1000).toFixed(1),
            duration: formatDuration(result.durationMillis)
        };
    } catch (err) {
        console.error("Error to find distance:", err);
        return null;
    }
};

export default { findDistance }; */

const getDistanceMatrix = (service, data) => new Promise((resolve, reject) => {
    service.getDistanceMatrix(data, (response, status) => {
        if(status === 'OK') {
            resolve(response)
        } else {
            reject(response);
        }
    })
});
const findDistance = async (start, end) => {
    try {
        const origin = new google.maps.LatLng(start[0], start[1]);
        const final = new google.maps.LatLng(end[0], end[1]);
        const service = new google.maps.DistanceMatrixService();
        const result = await getDistanceMatrix(
            service,
            {
                origins: [origin],
                destinations: [final],
                travelMode: 'DRIVING'
            }
        )

        return {
            distance: (result.rows[0].elements[0].distance.value / 1000).toFixed(1),
            duration: result.rows[0].elements[0].duration.text
        };
    } catch (err) {
        console.log("Error to find distance!!")
    }

};


export default { findDistance }