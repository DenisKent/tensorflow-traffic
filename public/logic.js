mapboxgl.accessToken =
  "pk.eyJ1IjoidHNxdWlyZTUiLCJhIjoiY2pvanRudmRpMDB0aTNrbnk3NXpyc205ayJ9.VebVhb0D-yXiqv8ZVMCI0Q";

var map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
  center: [-0.142150, 51.539504], // starting position [lng, lat]
  zoom: 12
});
// 
map.on("load", function() {
  fetch(
    "/kerbdata.json", // used for speed purposes https://fordkerbhack.azure-api.net/features?viewport=51.3935663,-0.2287717,51.6609623,-0.1088357"
    {
      headers: {
        "Ocp-Apim-Subscription-Key": "fb692dfd71834bc5b40d2bf3aef7be2c"
      }
    }
  )
    .then(response => response.json())
    .then(curbLR => {
    var demoFeatures = curbLR.features.filter(feature => feature.properties.location.objectId.includes("demofeatureid"))
    const nonDemoFeatures = curbLR.features.filter(feature => !feature.properties.location.objectId.includes("demofeatureid"));
    curbLR.features = nonDemoFeatures;
      map.addLayer({
        id: "bays",
        type: "line",
        source: {
          type: "geojson",
          data: curbLR
        },
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#139DCD",
          "line-width": 2
        }
      });
    curbLR.features = demoFeatures;
    map.addLayer({
      id: "demobays",
        type: "line",
        source: {
          type: "geojson",
          data: curbLR
        },
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "red",
          "line-width": 5
        }
    })
    });
});

// When a click event occurs on a feature in the places layer, open a popup at the
// location of the feature, with description HTML from its properties.
const makeRequest = (e) => {
  const featureId = JSON.parse(e.features[0].properties.location).objectId;
  var coordinates = e.features[0].geometry.coordinates.slice();
  const featureLong = coordinates[0][0];
  const featureLat = coordinates[0][1];
  fetch("/api/feature/"+featureId+"/space-probability")
    .then(response => response.json())
    .then((spaceData) => {
      const innerHtml = `<h2>Spaces remaining: ${spaceData.remainingSpaces}</h2>
      <p>availability on arrival: ${(Number(spaceData.probabilityOfASpaceBeingAvailable)*100).toFixed(0)}%</p>`;
      new mapboxgl.Popup()
        .setLngLat([featureLong,featureLat])
        .setHTML(innerHtml)
        .addTo(map);
    })
}
map.on('click', 'bays', makeRequest);
map.on("click", "demobays", makeRequest);

map.on('mouseenter', 'bays', function () {
  map.getCanvas().style.cursor = 'pointer';
});
 map.on('mouseleave', 'bays', function () {
  map.getCanvas().style.cursor = '';
});

map.on('mouseenter', 'demobays', function () {
  map.getCanvas().style.cursor = 'pointer';
});
 map.on('mouseleave', 'demobays', function () {
  map.getCanvas().style.cursor = '';
});
