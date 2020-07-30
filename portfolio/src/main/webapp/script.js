// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const LOCATION_LIMIT_METERS = 5000;

let map;
/** Editable marker that displays when a user clicks in the map */
let editMarker;
let userLocation;
let markers = [];
let fetchedMarkers = [];
let markerLat;
let markerLng;
let addressInput;
let destLat;
let destLng;
let orgLat;
let orgLng;
let routeArray;

/** Creates a map and adds it to the page. */
function createMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: getUserLocation(),
    zoom: 15,
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      mapTypeIds: ['roadmap', 'terrain', 'satellite'],
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  });

  ///grid on map
  const grid = [
      //corners
    { lat: 31.676131, lng:-106.441602},
    { lat: 31.668060999999998, lng:-106.441602},
    { lat: 31.668060999999998 , lng:-106.42384200000005},
    { lat: 31.676131, lng:-106.42384200000005},
    { lat: 31.676131, lng:-106.441602},
    // //rows
    { lat: 31.676131, lng:-106.441602},
    { lat: 31.674786, lng:-106.441602},
    { lat: 31.674786, lng:-106.42384200000005},
    { lat: 31.673441, lng:-106.42384200000005},
    { lat: 31.673441, lng:-106.441602},
    { lat: 31.672096, lng:-106.441602},
    { lat: 31.672096, lng:-106.42384200000005},
    { lat: 31.670751, lng:-106.42384200000005},
    { lat: 31.670751, lng:-106.441602},
    { lat: 31.669406, lng:-106.441602},
    { lat: 31.669406, lng:-106.42384200000005},
    { lat: 31.668060999999998, lng:-106.42384200000005},
    { lat: 31.668060999999998, lng:-106.441602}, 

    // //cols
    { lat: 31.676131, lng:-106.441602},
    { lat: 31.676131, lng:-106.440492},
    { lat: 31.668060999999998, lng:-106.440492},
    { lat: 31.668060999999998, lng:-106.43938200000001},
    { lat: 31.676131, lng:-106.43938200000001},
    { lat: 31.676131, lng:-106.43938200000001},
    { lat: 31.668060999999998, lng:-106.43938200000001},
    { lat: 31.668060999999998, lng:-106.43716200000001},
    { lat: 31.676131, lng:-106.43716200000001},
    { lat: 31.676131, lng:-106.43605200000002},
    { lat: 31.668060999999998, lng:-106.43605200000002},
    { lat: 31.668060999999998, lng:-106.43494200000002},
    { lat: 31.676131, lng:-106.43494200000002},
    { lat: 31.676131, lng:-106.43383200000002},
    { lat: 31.668060999999998, lng:-106.43383200000002},
    { lat: 31.668060999999998, lng:-106.43272200000003},
    { lat: 31.676131, lng:-106.43272200000003},
    { lat: 31.676131, lng:-106.43161200000003},
    { lat: 31.668060999999998, lng:-106.43161200000003},
    { lat: 31.668060999999998, lng:-106.43050200000003},
    { lat: 31.676131, lng:-106.43050200000003},
    { lat: 31.676131, lng:-106.42939200000004},
    { lat: 31.668060999999998, lng:-106.42939200000004},
    { lat: 31.668060999999998, lng:-106.42828200000004},
    { lat: 31.676131, lng:-106.42828200000004},
    { lat: 31.676131, lng:-106.42717200000004},
    { lat: 31.668060999999998, lng:-106.42717200000004},
    { lat: 31.668060999999998, lng:-106.42606200000004},
    { lat: 31.676131, lng:-106.42606200000004},
    { lat: 31.676131, lng:-106.42495200000005},
    { lat: 31.668060999999998, lng:-106.42495200000005},
    { lat: 31.668060999999998, lng:-106.42384200000005},
    { lat: 31.676131, lng:-106.42384200000005},
    { lat: 31.676131, lng:-106.43827200000001},
    { lat: 31.668060999999998, lng:-106.43827200000001}
  ];
  const gridPath = new google.maps.Polyline({
    path: grid,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2
  });
  gridPath.setMap(map);

  /**
   * When the user clicks on the map, show a marker with a form the user can
   * edit.
   */
  map.addListener('click', (event) => {
    markerLat = event.latLng.lat();
    markerLng = event.latLng.lng();
    createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
  });

  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(
    document.getElementById('floating-panel'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(
    document.getElementById('search-reports'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(
    document.getElementById('search-route'));

  map.controls[google.maps.ControlPosition.TOP_CENTER].push(
    document.getElementById('repeatedMarkerUI'));
  
  addressInput = new google.maps.places.Autocomplete(
    document.getElementById('searchBox-input'));

  var originInput = new google.maps.places.Autocomplete(
    document.getElementById('origin-location'));

  var destinationInput = new google.maps.places.Autocomplete(
    document.getElementById('destination-location'));

  originInput.bindTo('bounds', map);
  destinationInput.bindTo('bounds', map);

  /**
   * Listens for the event fired when the user selects a prediction. The
   * report's form pops up.
   */
  addressInput.addListener('place_changed', function() {
    let place = addressInput.getPlace();
    markerLat = place.geometry.location.lat();
    markerLng = place.geometry.location.lng();
    createMarkerForEdit(markerLat, markerLng);
  });

  function typeOfSearch(id, type) {
    let radioButton = document.getElementById(id);

    radioButton.addEventListener('click', function() {
      addressInput.setTypes(type);
    });
  }

  typeOfSearch('type-all', []);
  typeOfSearch('type-address', ['address']);
  typeOfSearch('type-establishment', ['establishment']);
}

//prints only the number of reports of a specific grid
function getReports(){
  fetch("/numberOfReports?row=0&col=0")
  .then(response => response.json())
  .then((reportsInGrid) => {
    console.log("Number of reports in this grid: ");
    console.log(reportsInGrid);
    return reportsInGrid;
  })
  .catch((error) => {
    console.error(error);
  });
}

/** Sends a marker to the backend for saving. */
function postMarker(lat, lng, type, date, time, address, description) {
  const params = new URLSearchParams();

  params.append('lat', lat);
  params.append('lng', lng);
  params.append('crimeType', type);
  params.append('date', date);
  params.append('time', time);
  params.append('address', address);
  params.append('description', description);

  fetch('/markers', {
    method: 'POST',
    body: params
  }).then(response => response.json())
  .then(result => { 
    
    if (result.status != 'SUCCESS') {
      displayRepeatedMarkerUI();
      
      var textError = (result.failure == 'REPEAT') ? "The crime entered was already reported." : "Unknown failure";
      
      document.getElementById('unsuccessfulReport').innerHTML = textError;
    } else {
      location.reload();
    }

  })
  .catch((error) => {
    console.error(error);
  });

}

/** Creates a marker that shows a textbox the user can edit. */
function createMarkerForEdit(lat, lng) {
  /** If we are already showing an editable marker, then remove it. */
  if (editMarker) {
    editMarker.setMap(null);
  }

  editMarker = new google.maps.Marker({
    position: {
      lat: lat,
      lng: lng
    },
    map: map,
    draggable: true
  });

  let infoWindow =
    new google.maps.InfoWindow({
      content: buildInfoWindow(lat, lng)
    });
  
  map.setCenter(new google.maps.LatLng(lat, lng));

  /** When the user closes the editable info window, remove the marker. */
  google.maps.event.addListener(infoWindow, 'closeclick', () => {
    editMarker.setMap(null);
  });

  infoWindow.open(map, editMarker);
}

/**
 * Builds and returns HTML elements that show an editable textbox and submit
 * button.
 */
function buildInfoWindow(lat, lng) {
  const clone = document.getElementById('reportsForm').cloneNode(true);
  clone.id = '';
  clone.style.display = 'block';
  return clone;
}

function clickInfoWindow(markerReport, crimeType, date, time, address, description){
    const text = 
      '<h1>'+crimeType+'</h1>'+
      '<div id="bodyContent">'+
      '<p>'+ date +'-' + time +'</p>'+
      '<p>'+ address +'</p>'+
      '<p>Description: ' + description + '</p>' +
      '</div>';
    var infowindow = new google.maps.InfoWindow({
        content: text
    });

    markerReport.addListener('click', function() {
        infowindow.open(map, markerReport);
    });
}

/** Manages the data of the report once the info window pops up. */
function submitFormData(element) {
  postMarker(
    markerLat, markerLng, getRadioValueCrimes(),
    document.getElementById('date').value,
    document.getElementById('time').value,
    document.getElementById('address').value,
    document.getElementById('description').value);
  editMarker.setMap(null);
}

/** Looks for the value checked in the type of crime report's section. */
function getRadioValueCrimes() {
  if (document.getElementById('homicide').checked) {
    return document.getElementById('homicide').value;
  } else if (document.getElementById('sexualAssault').checked) {
    return document.getElementById('sexualAssault').value;
  } else if (document.getElementById('robbery').checked) {
    return document.getElementById('robbery').value;
  } else if (document.getElementById('harassment').checked) {
    return document.getElementById('harassment').value;
  } else if (document.getElementById('kidnapping').checked) {
    return document.getElementById('kidnapping').value;
  } else if (document.getElementById('drugs').checked) {
    return document.getElementById('drugs').value;
  } else {
    return document.getElementById('other').value;
  }
}

/**
Puts a marker on the user's location
 */
function getUserLocation() {
  var infoWindow = new google.maps.InfoWindow;
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        var marker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: 'User location'
        });
        marker.setMap(map);
        map.setCenter(userLocation);
        initHeatMap();
        console.log("Getting reports");
        getReports();
        //getReportsForGrid();
        let locationLimitCircle = new google.maps.Circle(
          {center: userLocation, radius: LOCATION_LIMIT_METERS});
        addressInput.setBounds(locationLimitCircle.getBounds());
        addressInput.setOptions({strictBounds: true});
      },
      function() {
        handleLocationError(true, infoWindow, map.getCenter());
      });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }
  return userLocation;
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
  infoWindow.open(map);
}

/**
Show/Hide Heatmap
 */
var heatmap;

function initHeatMap() {
  heatmap =
    new google.maps.visualization.HeatmapLayer({
      data: getPoints(),
      map: map
    });
}

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function getPoints() {
  var heatPoints = [];
  var individualPoint;
  var locationOfUser = locationToArray();
  fetch("/markers?location=" + locationOfUser)
    .then(response => response.json())
    .then((markers) => {
      markers.forEach((marker) => {
        individualPoint = new google.maps.LatLng(marker.lat, marker.lng);
        heatPoints.push(individualPoint);
      });
    })
    .catch((error) => {
      console.error(error);
    });
  return heatPoints;
}

var reportsSideBar = document.getElementById('sideBar');

var filters = document.getElementById('filters');

var span = document.getElementsByClassName('close')[0];

var apply = document.getElementById('apply');

// When the user clicks the button, open the modal
filters.onclick = function() {
  reportsSideBar.style.display = 'block';
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  reportsSideBar.style.display = 'none';
}

apply.onclick = function() {
  reportsSideBar.style.display = 'none';
}

/**
Hide and show markers of reports
 */
function
showMarkers() {
  // Shows any markers currently in the array.
  fetchReportMarkers();
}

function
hideMarkers() {
  // Hides any markers currently in the array.
  for (var i = 0; i < fetchedMarkers.length; i++) {
    fetchedMarkers[i].setMap(null);
  }
}

function fetchReportMarkers(){
    var markerReport;
    var locationOfUser = locationToArray();
    fetch("/markers?location=" + locationOfUser)
    .then(response => response.json())
    .then((markers) => {
        markers.forEach((marker) => {
            markerReport =new google.maps.Marker({
            position: new google.maps.LatLng(marker.lat, marker.lng),
            map: map
            }); 
            fetchedMarkers.push(markerReport);
            markerReport.setMap(map);
            clickInfoWindow(markerReport, marker.crimeType, marker.date, marker.time, marker.address, marker.description);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

function route() {
  var addressOrigin = document.getElementById('origin-location').value;
  console.log("Origin address: " + addressOrigin);

  var addressDestination = document.getElementById('destination-location').value;
  console.log("Destination address: " + addressDestination);

  var geocoderDestination = new google.maps.Geocoder();
  var geocoderOrigin = new google.maps.Geocoder();

  geocoderOrigin.geocode({
    address: addressOrigin
  }, function(results, status) {
    if (status === "OK") {
      orgLat = results[0].geometry.location.lat();
      orgLng = results[0].geometry.location.lng();
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });

  geocoderDestination.geocode({
    address: addressDestination
  }, function(results, status) {
    if (status === "OK") {
      destLat = results[0].geometry.location.lat();
      destLng = results[0].geometry.location.lng();
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });

  let directionsService = new google.maps.DirectionsService();
  let directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(null);
  let request = {
    origin: new google.maps.LatLng(orgLat, orgLng),
    destination: new google.maps.LatLng(destLat, destLng),
    provideRouteAlternatives: true,
    travelMode: document.getElementById('travel').value
  }

  directionsDisplay.setMap(map);
  directionsService.route(request, function(result, status) {
    if (status === 'OK') {
      console.log("Number of alternative routes: " + result.routes.length);

      var counter = 0;
      var routeIndex = 0;
      var lessCrimesInRoute = 1000;

      for (var r = 0; r < result.routes.length; r++) {
        var route = result.routes[r];

        for (var j = 0; j < route.legs[0].steps.length; j++) {
          routeArray = new google.maps.Polyline({
            path: [
              new google.maps.LatLng(route.legs[0].steps[j].start_location.lat(), route.legs[0].steps[j].start_location.lng()),
              new google.maps.LatLng(route.legs[0].steps[j].end_location.lat(), route.legs[0].steps[j].end_location.lng())
            ]
          });
          fetch('/markers').then(response => response.json()).then((markers) => {
            markers.forEach((marker) => {
              var myPosition = new google.maps.LatLng(marker.lat, marker.lng);
              if (google.maps.geometry.poly.isLocationOnEdge(myPosition, routeArray, 0.0064)) {
                counter += rateCrime(marker.crimeType);
                console.log("Rating" + counter);
                console.log(marker.lat);
                console.log(marker.lng);
              }
            });
          });
        }
        console.log("Rating" + counter);
        if (counter < lessCrimesInRoute) {
          lessCrimesInRoute = counter;
          routeIndex = r;
        }
        counter = 0;
      }

      console.log("Chosen route index: " + routeIndex);
      /*directionsDisplay.setDirections(result);*/

      new google.maps.DirectionsRenderer({
        map: map,
        directions: result,
        routeIndex: routeIndex
      });
    }
  });
}

function rateCrime(crime) {
  console.log("Crime along the route: " + crime);
  if (crime === "Homicide") return 6;
  else if (crime === "Sexual Assault") return 5;
  else if (crime === "Kidnapping") return 4;
  else if (crime === "Robbery") return 3;
  else if (crime === "Drug Related") return 2;
  else if (crime === "Harassment") return 1;
  else {
    console.error('Unsupported crime type: ' + crime);
  }
}

function displayDirectionsAPI() {
  let d1 = document.getElementById('search-reports');
  let d2 = document.getElementById('search-route');
  if (d2.style.display == "none") {
    d1.style.display = "none";
    d2.style.display = "block";
  } else {
    d1.style.display = "block";
    d2.style.display = "none";
  }
}

function displayRepeatedMarkerUI() {
  document.getElementById('repeatedMarkerUI').style.display = "block";
}

function hideRepeatedMarkerPopup() {
  document.getElementById('repeatedMarkerUI').style.display = "none";
}

function locationToArray(){
  var locArray = [];
  locArray[0] = userLocation.lat;
  locArray[1] = userLocation.lng;
  return locArray;
}

/** Hardcoded function to get the waypoint for a given grid */
function getWaypointFromGrid() {
    fetch('/grids?requestRow=0&requestCol=0')
    .then(response => console.log(response.json()))
    .then((waypoint) => {
        console.log('Row 0 Col 0, waypoint: ' + waypoint);
    })
    .catch((error) => {
        console.error(error);
    }); 
}

class Grid {
  constructor(row, col) {
    this.row = row;
    this.col = col;
  }
  static convertToRowCol(lat, lng){
    var row = Math.trunc(Number((31.676131 - lat) / 0.001345));
    var col = Math.trunc(Number((106.441602 - Math.abs(lng)) / 0.00111));
    console.log("row is: " + row + " col is: " + col);
  }
}

// See https://www.geeksforgeeks.org/bresenhams-line-generation-algorithm/
function getGridsThatStepPassesThru(step){ //step is a DirectionsStep object
  var grids = [];
  var start_point = Grid.convertToRowCol(step.startLocation.lat, step.startLocation.lng); //start and end location are LatLng objects
  var end_point = Grid.convertToRowCol(step.endLocation.lat, step.endLocation.lng);
  var row1 = start_point.row;
  var col1 = start_point.col;
  var row2 = end_point.row;
  var col2 = end_point.col;
  var m_new = 2 * (row2 - row1); 
  var slope_error_new = m_new - (col2 - col1);
  for (col = col1, row = row1; col <= col2; col++){ 
    console.log("passing grid (" + row + "," + col + ")"); 
    grids.push(new Grid(row , col));
    // Add slope to increment angle formed 
    slope_error_new += m_new; 
    // Slope error reached limit, time to 
    // increment row and update slope error. 
    if (slope_error_new >= 0){ 
      row++; 
      slope_error_new -= 2 * (col2 - col1);
    } 
  } 
  return grids;
}  

findAndDrawRoute = async (orgLat, orgLng, destLat, destLng) =>  {
  let waypoints = await getSafestRoute(orgLat, orgLng, destLat, destLng); //Get waypoints of the safest route

  let directionsService = new google.maps.DirectionsService();
  let directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(null);
  let request = {
    origin: new google.maps.LatLng(orgLat, orgLng),
    destination: new google.maps.LatLng(destLat, destLng),
    waypoints: waypoints, //Set waypoints
    travelMode: document.getElementById('travel').value
  }
  directionsDisplay.setMap(map);

  directionsService.route(request, function(result, status) {
    if (status === 'OK') {
      //Displays the route in the map
      new google.maps.DirectionsRenderer({
        map: map,
        directions: result
      });
    }
  });
}

getSafestRoute = async (orgLat, orgLng, destLat, destLng) => {
  let finalRoute = [];
  let route = await getSafestRouteUsingMapsApi(orgLat, orgLng, destLat, destLng); //RETURNS full ROUTE

  for (var j = 0; j < route.legs[0].steps.length; j++) {
    let passingGrids = getGridsThatStepPassesThru(route.legs[0].steps[j]);
    if (passingGrids.length == 1) { 
      return [{location: route.legs[0].start_location, stopover: true },
        {location: route.legs[0].end_location, stopover: true}];  //Return the start and end of the step as waypoints
    }
    
    for (var g = 0; g < passingGrids.length; g++) {

      if (passingGrids[g].hasCrime && !validLocationInsideGrid(orgLat, orgLng, passingGrids[g])
        && !validLocationInsideGrid(destLat, destLng, passingGrids[g])) {
        let safeNeighboringGrids =  getSafeNeighboringGrids(passingGrids[g]);
        let routesFromSafeNeighborGrids = findAllRoutes(route.legs[0].steps[j].start_location.lat(),
        route.legs[0].steps[j].start_location.lng(), safeNeighboringGrids, destLat, destLng); //Get all possible routes
        let bestRoute = pickSafestRoute(routesFromSafeNeighborGrids); //Get WAYPOINTS for the best route

        return finalRoute.concat(bestRoute); //CONCAT WAYPOINTS UNTIL NOW and THE BEST ROUTE FROM THERE
      }
    }
    finalRoute.push({ //ADD STEP by creating waypoint
      location: route.legs[0].steps[j].start_location,
      stopover: true
    });
  }
  return finalRoute; //RETURNS ARRAY OF WAYPOINTS
}

function findAllRoutes(orgLat, orgLng, safeNeighboringGrids, destLat, destLng) {
  let routes = [];
  for (var i = 0; i < safeNeighboringGrids.length; i++) {
    let waypoint = getWaypointForGrid(safeNeighboringGrids[i]);
    let firstPartOfRoute = getSafestRoute(orgLat, orgLng, waypoint); //RETURNS WAYPOINTS
    let secondPartOfRoute = getSafestRoute(waypoint, destLat, destLng); //RETURNS WAYPOINTS
    routes = routes.push(firstPartOfRoute.concat(secondPartOfRoute)); //CONCAT WAYPOINTS and ADD TO "routes"
  }
  return routes;
}

//CHECKS if point lies inside a specific grid 
function validLocationInsideGrid(pointLat, pointLng, grid) {
  var pointRow = Math.floor((31.676131 - pointLat) / 0.001345);
  var pointCol = Math.floor((-106.441602 - Math.abs(pointLng)) / 0.00111);
  return (grid.row == pointRow && grid.col == pointCol); // CHecking if grid of point is the same as grid passed
}

getSafestRouteUsingMapsApi = async (orgLat, orgLng, destLat, destLng) => {
  let directionsService = new google.maps.DirectionsService();
  let directionsDisplay = new google.maps.DirectionsRenderer();
  directionsDisplay.setMap(null);
  let request = {
    origin: new google.maps.LatLng(orgLat, orgLng),
    destination: new google.maps.LatLng(destLat, destLng),
    travelMode: 'DRIVING'
  }
  directionsDisplay.setMap(map);
  
  let safestRoute = await directionsServiceFunction(directionsService,request) 
  return safestRoute.routes[0]; //Returns complete route
}

const directionsServiceFunction = (directionsService, request) => 
  new Promise((resolve, reject) =>  {
  directionsService.route(request, function (result, status){
    if(status === 'OK') {
      resolve(result);
    } else {
      reject(result);
    }
  })
});        
