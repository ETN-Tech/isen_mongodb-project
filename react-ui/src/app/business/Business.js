import React, {useState} from 'react';
import axios from "axios";

function Business() {
    const [ stationResults, setStationResults ] = useState([]);

    function findStationByName(searchText) {
        axios.get( process.env.REACT_APP_API_HOST+ "/api/stations/find/" + searchText)
            .then(res => {
                console.log(searchText)
                setStationResults(res.data)
            })
            .catch(err => console.log(err));
    }

    return (
        <>
            <h1>Business App</h1>

            <h2>Find station by name</h2>
            <input type="text" id="search" onChange={e => findStationByName(e.target.value)} />

            {stationResults.map(station => (
                <div key={station._id}>
                    <h3>City: {station.city}</h3>
                    <p>Name: {station.name} - Location: {station.geolocation[0]}:{station.geolocation[1]}</p>
                    <a href={`/business/stations/${station._id}`}>Details ></a>
                    <hr/>
                </div>
            ))}
        </>
    )
}

export default Business;
