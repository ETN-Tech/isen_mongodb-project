import React, { useCallback, useEffect, useState } from 'react';
import {BrowserRouter, Route, Switch} from "react-router-dom";

import Client from "./client/Client";
import Business from "./business/Business";
import Home from "./Home";
import Stations from "./business/Stations";

function App() {

  return (
    <BrowserRouter>
      <Switch>
        <Route exact path='/'>
          <Home></Home>
        </Route>

        <Route exact path='/client'>
          <Client></Client>
        </Route>

        <Route exact path='/business'>
          <Business></Business>
        </Route>
        <Route path='/business/stations/:id'>
          <Stations></Stations>
        </Route>
      </Switch>
    </BrowserRouter>
  );

}

export default App;
