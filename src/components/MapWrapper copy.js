// react
import React, { useState, useEffect, useRef } from 'react';

// openlayers
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import XYZ from 'ol/source/XYZ'
import {transform} from 'ol/proj'
import GeoJSON from 'ol/format/GeoJSON.js';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';
import WFS from 'ol/format/WFS';
import GML from 'ol/format/GML32';
import  {Fill, Stroke, Style, Text, Icon} from 'ol/style'
import BingMaps from 'ol/source/BingMaps'

import {Buffer} from 'buffer';

const GEOSERVER_BASE_URL = 'http://192.168.10.27:8080/geoserver';

function MapWrapper(props) {

  const [featureData, setFeatureData] = useState();

  // refs are used instead of state to allow integration with 3rd party map onclick callback;
  //  these are assigned at the end of the onload hook
  //  https://stackoverflow.com/a/60643670
  const mapRef = useRef();
  const mapElement = useRef();
  const featuresLayerRef = useRef();

  // map click handler - uses state and refs available in closure
  const handleMapClick = async (event) => {

    // get clicked feature from wfs layer
    // TODO: currently only handles a single feature
    const clickedCoord = mapRef.current.getCoordinateFromPixel(event.pixel);
    const clickedFeatures = featuresLayerRef.current.getSource().getFeaturesAtCoordinate(clickedCoord);
    if (!clickedFeatures.length) return; // exit callback if no features clicked
    const feature = clickedFeatures[0];

    // parse feature properties
    const featureData = JSON.parse(feature.getProperties()['data']);

    // iterate prop to test write-back
    if (featureData.iteration) {
      ++featureData.iteration;
    } else featureData.iteration = 1;

    feature.setProperties({ data: JSON.stringify(featureData) });
    console.log('clicked updated feature data', feature.getProperties())
  
    const wfsFormatter = new WFS();
    const gmlFormatter = new GML({
      featureNS: 'https://aks_crowdsourcing',
      featureType: 'wfs_geom2',
      srsName: 'EPSG:3857' // srs projection of map view
    });
    var xs = new XMLSerializer();
    const node = wfsFormatter.writeTransaction(null, [feature], null, gmlFormatter);
    var payload = xs.serializeToString(node);

    // execute POST
    await fetch(GEOSERVER_BASE_URL + '/wfs', {
      headers: new Headers({
        'Authorization': 'Basic ' + Buffer.from('admin:geoserver').toString('base64'),
        'Content-Type': 'text/xml'
      }),
      method: 'POST',
      body: payload
    });

    // clear wfs layer features to force reload from backend to ensure latest properties
    //  are available
    featuresLayerRef.current.getSource().refresh();

    // display updated feature data on map
    setFeatureData(JSON.stringify(featureData));
  }

  // initialize map on first render - logic formerly put into componentDidMount
  useEffect( () => {

    // create geoserver generic vector features layer
    const featureSource = new VectorSource({
      format: new GeoJSON(),
      url: function (extent) {
        return (
          GEOSERVER_BASE_URL + '/PAKISTAN/ows?service=WFS&' +
          'version=1.1.0&request=GetFeature&typeName=wfs_geom2&' + 
          'outputFormat=application%2Fjson&srsname=EPSG:3857&' +
          'bbox=' +
          extent.join(',') +
          ',EPSG:3857'
        );
      },
      strategy: bboxStrategy,
    });
    
    const featureLayer = new VectorLayer({
      source: featureSource,
      // style: new Style({
      //   image: new Icon({
      //     anchor: [0.5, 46],
      //     anchorXUnits: 'fraction',
      //     anchorYUnits: 'pixels',
      //     src: 'images/icon.png'
      //   })
      // })
      // style: {
      //   'stroke-width': 0.75,
      //   'stroke-color': 'white',
      //   'fill-color': 'rgba(100,100,100,0.25)',
      // },
    });

    // create map
    const map = new Map({
      target: mapElement.current,
      layers: [
        
        // USGS Topo
        new TileLayer({
          // source: new XYZ({
          //   url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
          // })
          title: "Bing Aerial",
          baseLayer: true,
          source: new BingMaps({
              key: 'Ai9y3x8v0FM1vGDUXevZDinOzkJVacIW8kJOtSwUDNn8WGpE0ZjxZPJttvIYZg5L',
              imagerySet: 'Aerial'
          })
        }),

        // Google Maps Terrain
        /* new TileLayer({
          source: new XYZ({
            url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
          })
        }), */

        featureLayer

      ],
      view: new View({
        projection: 'EPSG:3857',
        center: transform([69.3451, 30.3753], 'EPSG:4326', 'EPSG:3857'),
        zoom: 8
      }),
      controls: []
    })

    // save map and featureLary references into React refs
    featuresLayerRef.current = featureLayer;
    mapRef.current = map

    // set map onclick handler
    map.on('click', (event) => handleMapClick(event, map, featureLayer))
    return () => map.setTarget(null)
  },[])

  // render component
  return (      
    <div>

      <div ref={mapElement} className="map-container"></div>

      { featureData ?
        (
        <div className="feature-data-display">
          <p>Feature data: {featureData}</p>
        </div>
        ) :
        null
      }

    </div>
  ) 

}

export default MapWrapper