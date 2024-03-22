import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
// import { Map, View } from 'ol';


// export as "factory" function 
export const getMap = () => new Map({
    target: 'map',
    layers: [
        new TileLayer({
            title: 'OSM',
            source: new OSM(),
            opacity: 0.5,
        })
    ]
});