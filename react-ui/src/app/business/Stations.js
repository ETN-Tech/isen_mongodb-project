
import React, {useEffect, useState} from 'react';
import axios from "axios";
import {useParams} from "react-router-dom";

function Stations() {
    const { id } = useParams();
    const [ station, setStation ] = useState([]);

    const [ stationName, setStationName ] = useState("");
    const [ stationSize, setStationSize ] = useState(null);
    const [ stationTpe, setStationTpe ] = useState(null);
    const [ stationAvailable, setStationAvailable ] = useState([]);


    useEffect(() => {
        getStation();
    }, []);

    function getStation() {
        axios.get(process.env.REACT_APP_API_HOST+ "/api/stations/" + id)
            .then(res => {
                console.log(res.data)
                setStation(res.data);

                setStationName(res.data.name);
                setStationSize(res.data.size);
                setStationTpe(res.data.tpe);
                setStationAvailable(res.data.available);
            })
            .catch(err => console.log(err));
    }

    function updateStation(searchText) {
        axios.put( process.env.REACT_APP_API_HOST+ "/api/stations/" + id, {
            stationId: station.stationId,
            city: station.city,
            name: stationName,
            geolocation: station.geolocation,
            size: stationSize,
            tpe: stationTpe,
            available: stationAvailable,
        })
            .then(() => getStation())
            .catch(err => console.log(err));
    }

    function deleteStation() {
        axios.delete(process.env.REACT_APP_API_HOST+ "/api/stations/" + id)
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }

    return (
        <>
            <h1>Station Details</h1>

            {station.name ? (
                <>
                    <div key={station._id}>
                        <h3>City: {station.city}</h3>
                        <p>StationId: {station.stationId}</p>
                        <p>Name: {station.name}</p>
                        <p>Geolocation: {station.geolocation[0]}:{station.geolocation[1]}</p>
                        <p>Size: {station.size}</p>
                        <p>TPE: {station.tpe ? "true" : "false"}</p>
                        <p>Available: {station.available ? "true" : "false"}</p>
                    </div>

                    <hr/>

                    <h1>Update station details</h1>

                    <label htmlFor="name">Name</label><br/>
                    <input type="text" id="name" defaultValue={station.name} onChange={e => setStationName(e.target.value)}/>
                    <br/>
                    <label htmlFor="size">Size</label><br/>
                    <input type="text" id="size" defaultValue={station.size} onChange={e => setStationSize(e.target.value)}/>
                    <br/>
                    <label htmlFor="tpe">TPE</label><br/>
                    <input type="text" id="tpe" defaultValue={station.tpe} onChange={e => setStationTpe(e.target.value)}/>
                    <br/>
                    <label htmlFor="available">Available</label><br/>
                    <input type="text" id="available" defaultValue={station.available} onChange={e => setStationAvailable(e.target.value)}/>
                    <br/>
                    <button onClick={updateStation}>Update</button>

                    <hr/>

                    <button onClick={deleteStation}>Delete station</button>
                </>
            ) : null}
        </>
    )
}

export default Stations;
