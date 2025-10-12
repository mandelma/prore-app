/*global google*/

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