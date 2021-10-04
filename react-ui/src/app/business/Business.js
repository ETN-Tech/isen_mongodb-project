import React, {useState} from 'react';
import axios from "axios";

function Business() {
    const [ stationResults, setStationResults ] = useState([]);
    
    const [ x1, setX1 ] = useState(0);
    const [ x2, setX2 ] = useState(0);
    const [ y1, setY1 ] = useState(0);
    const [ y2, setY2 ] = useState(0);

    function findStationByName(searchText) {
        axios.get( process.env.REACT_APP_API_HOST+ "/api/stations/find/" + encodeURIComponent(searchText))
            .then(res => {
                console.log(searchText)
                setStationResults(res.data)
            })
            .catch(err => console.log(err));
    }

    function deactivateStations() {
        axios.get(process.env.REACT_APP_API_HOST+ "/api/stations/deactivate/"+ x1 +"/"+ y1 +"/"+ x2 +"/"+ y2)
            .then(res => console.log(res))
            .catch(err => console.log(err));
    }

    return (
        <>
            <h1>Business App</h1>

            <h2>Deactivate stations in zone</h2>
            
            <label htmlFor="x1">X1</label><br/>
            <input type="text" id="x1" onChange={e => setX1(e.target.value)}/>
            <br/>
            <label htmlFor="x2">X2</label><br/>
            <input type="text" id="x2" onChange={e => setX2(e.target.value)}/>
            <br/>
            <label htmlFor="y1">Y1</label><br/>
            <input type="text" id="y1" onChange={e => setY1(e.target.value)}/>
            <br/>
            <label htmlFor="y2">Y2</label><br/>
            <input type="text" id="y2" onChange={e => setY2(e.target.value)}/>
            <br/>
            <button onClick={deactivateStations}>Update</button>

            <hr/>

            <h2>Find station by name</h2>
            <input type="text" id="search" placeholder='Type something' onChange={e => findStationByName(e.target.value)} />

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
