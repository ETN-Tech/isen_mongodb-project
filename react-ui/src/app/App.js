import React from 'react';
import {BrowserRouter, Route, Switch} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import Client from "./client/Client";
import Business from "./business/Business";
import Home from "./Home";
import Stations from "./business/Stations";

function App() {

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/'>
          <Home/>
        </Route>

        <Route exact path='/client'>
          <Client/>
        </Route>

        <Route exact path='/business'>
          <Business/>
        </Route>
        <Route path='/business/stations/:id'>
          <Stations/>
        </Route>
      </Switch>
    </BrowserRouter>
  );

}

export default App;
