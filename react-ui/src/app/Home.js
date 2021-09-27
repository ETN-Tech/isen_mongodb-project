import React, {useState} from 'react';
import axios from "axios";

function Home() {

    return (
        <>
            <h1>VeloLand App</h1>

            <p>Welcome to VeloLand</p>

            <a href="/client">Client ></a>
            <br/>
            <a href="/business">Business ></a>
        </>
    )
}

export default Home;
