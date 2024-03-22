import './App.css';

// react
import React, {useState} from 'react';

import { ChakraProvider } from '@chakra-ui/react'
// components
import Map from './components/Map'
import ShapeDraw from './components/drawInteraction';
// import { useState } from 'react';
// import Home from "./pages/Home/Home";

function App() {
  const [map, setMap] = useState(null);
  return (
    <ChakraProvider>
      <div className="App">    
        <Map returnRef={setMap} />
        {map != null
                  ? <ShapeDraw map={map}/>
                  : <p>Loading...</p>
              }
      </div>
    </ChakraProvider>
  )
}

export default App
