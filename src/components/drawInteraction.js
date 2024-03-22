// react
import React, { useState, useEffect, useRef } from 'react';
// import Map from './Map.js'
// import { useId } from 'react';

// openlayers
import Draw from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from "ol/layer/Vector";
import { Select } from '@chakra-ui/react'

const vectorSource = new VectorSource({
  wrapX: false
});
let draw = null
function ShapeDraw({ map }) {
  const [selectedItem, setSelectedItem] = useState("")
  const handleChange = (e) => {
    if(e.target.value){
      try {
        map.removeInteraction(draw);
      } catch (error) {
        console.log(error);
      }
      setSelectedItem(e.target.value);
      draw = new Draw({
        source: vectorSource,
        type: e.target.value
        // style
      });
      map.addInteraction(draw);
    }
  }
  // console.log(map);
  useEffect( () => {
    
    const vectorLayer = new VectorLayer({ source: vectorSource });
    map.addLayer(vectorLayer);
    return () => {
      map.removeInteraction(draw);
      // map.removeInteraction(modify);
      // map.dispose();
    };
  },[])
  // render component
  return (      
    <label className='draw-control'>
      Geometry Type:
      <Select bg='#eee'
        borderColor='#eee'
        color='#000'
        placeholder='Select option' value={selectedItem} onChange={handleChange}>
        <option value='Point'>Point</option>
        <option value='Polygon'>Polygon</option>
        <option value='LineString'>Line</option>
      </Select>
      {/* <select value={selectedItem} onChange={handleChange}>
        <option value="Point">Point</option>
        <option value="Polygon">Polygon</option>
        <option value="LineString">Line</option>
      </select> */}
    </label>
  ) 

}

export default ShapeDraw