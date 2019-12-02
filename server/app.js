const express = require('express')
const got = require("got");
const geolib = require("geolib");
const childProcess = require("child_process");
const fs = require('fs');
const download = require('download');
const path = require('path')


const getFeedList = async () => {
  const info = await got("https://api.tfl.gov.uk/Place/Type/JamCam/?app_id=a20e2f12&app_key=732436bb1747a061ed9ec411023b9315", { json: true });
  return info;
};

const findFeed = (feedList) => {
  return feedList.filter(feed => feed.id === "JamCams_00001.09726")[0];
}

const findClosestFeed = (inputCoordRange, feedList, searchRadiusInM = 100) => {
  const centerCoords = geolib.getCenter(inputCoordRange);
  const closestfeedList = feedList.filter(feed => {
    const distanceBetweenInputAndCamera = geolib.getDistance({latitude: feed.lat, longitude:feed.lon}, centerCoords);
     return distanceBetweenInputAndCamera < searchRadiusInM
    });
  return closestfeedList[0];
};

const kerbdata = require("../public/kerbdata.json");
const getFeatureCoordRange = (featureId) => {
  const feature = kerbdata.features.filter(feature => feature.properties.location.objectId === featureId)[0];
  const [featureStart, featureEnd] = feature.geometry.coordinates;
  const coordRange = [{ latitude: featureStart[1], longitude: featureStart[0] }, { latitude: featureEnd[1], longitude: featureEnd[0] }];
  return coordRange;
}

const app = express();

const getTakenUpParkingSpaceInM = (featureCoordRange) => {
  return new Promise((resolve, reject) => {
    try{
      const pythonProcess = childProcess.spawn('python3',["pythonscripts/script.py"]);
      let allData = "";
      pythonProcess.stdout.on('data', (data) => {
        allData += data;
      });
      pythonProcess.stdout.on('end', () => {
        const parseableData = "{" + allData.toString().split("{")[1] 
        const {" car ": carCount, " truck ": vanCount} = JSON.parse(parseableData);
        const spaceTakenUpInM = carCount * 4.5 + vanCount * 6.7
        resolve(spaceTakenUpInM)
      });
    } catch (err){
      reject(err);
    }
  })
};

app.use((req, res, next) => {
  console.log(req.url);
  next();
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..","public",'index.html'))
})

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "..","public",'style.css'))
})

app.get("/logic.js", (req, res) => {
  res.sendFile(path.join(__dirname, "..","public",'logic.js'))
});

app.get("/kerbdata.json", (req, res) => {
  res.sendFile(path.join(__dirname, "..","public",'kerbdata.json'));
})


app.get('/api/feature/:featureid/space-probability', async (req, res) => {
  const {featureid: featureId} = req.params;
  const featureCoordRange = getFeatureCoordRange(featureId);
  if(featureId === "demofeatureid-upper" || featureId === "demofeatureid-camden"){
    const { body: allCameraFeeds} = await getFeedList();
    const closestFeed = await findClosestFeed(featureCoordRange, allCameraFeeds);
    const feedImageUrl = closestFeed.additionalProperties.filter(props => props.key === "imageUrl")[0].value;
    const lengthOfFeature = geolib.getDistance(...featureCoordRange);
    const isImageSaved = await download(feedImageUrl).then((data)=> fs.writeFileSync('volume/road.jpg', data));
    const spaceTakenUpInM = await getTakenUpParkingSpaceInM(featureCoordRange);
    const remainingLengthInFeature = lengthOfFeature-spaceTakenUpInM;
    const remainingSpaces = Math.floor(remainingLengthInFeature/4.5);
    const totalSpaces = Math.floor(lengthOfFeature/4.5);
    const spacesTaken = totalSpaces-remainingSpaces;
    return res.status(200).json({totalSpaces,spacesTaken, remainingSpaces});
  } else {
    const remainingSpaces = Math.floor(Math.random()*5);
    const probabilityOfASpaceBeingAvailable = Math.random().toFixed(2);
    return res.status(200).json({probabilityOfASpaceBeingAvailable, remainingSpaces });
  }
})

app.use((req,res) => {
  res.status(404).send("404")
})


app.listen(3000);

module.exports = app;
