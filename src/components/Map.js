import { useEffect, useState, useRef } from "react";
import { fromLonLat } from "ol/proj";
import { FullScreen, ZoomSlider, defaults as defaultControls } from "ol/control";
import { OSM } from "ol/source";
import { Group as LayerGroup, Tile as TileLayer } from "ol/layer";
import OlMap from "ol/Map";
import OlView from "ol/View";
import "ol/ol.css";
// import "./Map.scss";

const Map = ({ returnRef = null }) => {
  const [map, setMap] = useState(null);
  const mapElement = useRef();

  useEffect(() => {
    if (!map) {
      const mapTemp = new OlMap({
        target: mapElement.current,
        controls: defaultControls().extend([new FullScreen(), new ZoomSlider()]),
        view: new OlView({
          //North America's center
          center: fromLonLat([69.3451, 30.3753]),
          zoom: 5,
          minZoom: 2,
          maxZoom: 18,
        }),
        layers: [
          new LayerGroup({
            title: "Main Layers",
            combine: false,
            visible: true,
            layers: [
              new TileLayer({
                title: "OSM",
                type: "base",
                visible: true,
                source: new OSM(),
              }),
            ],
          }),
        ],
      });

      setTimeout(() => {
        mapTemp.updateSize();
      }, 0);

      setMap(mapTemp);
      
      if (typeof returnRef === "function") returnRef(mapTemp);
      return () => mapTemp.setTarget(null)
    }
  }, []);

  return (
    <div ref={mapElement} className="map-container">
      <div id="popup-container">
        <div id="popup-content">
          <div id="popup-text"></div>
        </div>
      </div>

      <div id="tooltip-container">
        <div id="tooltip-content"></div>
      </div>
    </div>
  );
};

export default Map;
