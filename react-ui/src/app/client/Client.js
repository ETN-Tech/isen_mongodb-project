import React, {useEffect, useState} from 'react';
import axios from "axios";

function Client() {
    const [ nearStations, setNearStations ] = useState([]);
    const [ longitude, setLongitude ] = useState(50.647236);
    const [ latitude, setLatitude ] = useState(3.059376);

    function findNearStations() {
        axios.get( process.env.REACT_APP_API_HOST+ "/api/stations/near/" + longitude + "/" + latitude)
            .then(res => {
                console.log(longitude +":"+ latitude)
                console.log(res.data)
                setNearStations(res.data)
            })
            .catch(err => console.log(err));
    }

    return (
        <>
            <h1>Client App</h1>

            {nearStations.length ? (
                <>
                    <p>Nearest stations:</p>
                    {nearStations.map(station => (
                        <div key={station._id}>
                            <p>{station.name}</p>
                            <p>Bikes available: {station.data[0].bikesAvailable} - Docks available: {station.data[0].docksAvailable}</p>
                            <hr/>
                        </div>
                    ))}
                </>
            ) : (
                <>
                    <h2>Find nearest stations:</h2>

                    <label htmlFor="longitude">Longitude</label><br/>
                    <input type="text" id="longitude" defaultValue={longitude} onChange={e => setLongitude(e.target.value)} />
                    <br/>
                    <label htmlFor="latitude">Latitude</label><br/>
                    <input type="text" id="latitude" defaultValue={latitude} onChange={e => setLatitude(e.target.value)} />
                    <br/>
                    <button onClick={findNearStations}>Find</button>
                </>
            )}


        </>
    )
}

export default Client;
