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
let reportsForMarkers = [];
let addressInput;
let destLat;
let destLng;
let orgLat;
let orgLng;

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
            reportsForMarkers.push(marker);
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
      pickSafestRoute(result);
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
    console.log(locArray[0]);
    return locArray;
}

/** Receives an array of routes, finds the safest one using a rating system */
function pickSafestRoute(routesFromSafeNeighborGrids){
  var counter = 0;
  var routeIndex = 0;
  var lessCrimesInRoute = 1000;

  for (var r = 0; r < routesFromSafeNeighborGrids.routes.length; r++) {
    var route = result.routes[r];

    for (var j = 0; j < routesFromSafeNeighborGrids.legs[0].steps.length; j++) {
      var routeArray = new google.maps.Polyline({
        path: [
            new google.maps.LatLng(routesFromSafeNeighborGrids.legs[0].steps[j].start_location.lat(),
              routesFromSafeNeighborGrids.legs[0].steps[j].start_location.lng()),
            new google.maps.LatLng(routesFromSafeNeighborGrids.legs[0].steps[j].end_location.lat(), 
              routesFromSafeNeighborGrids.legs[0].steps[j].end_location.lng())
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

  new google.maps.DirectionsRenderer({
    map: map,
    directions: result,
    routeIndex: routeIndex
  });    
}

function getWaypointForGrid(grid) {
  fetch('/grids?requestRow=' + grid.row + '&requestCol=' + grid.col)
  .then(response => response.json())
  .then((waypoint) => {
    let waypointForGrid = {
      location: new google.maps.LatLng(waypoint.lat, waypoint.lng),
      stopover: true
    }
    
  return waypointForGrid;
  })
  .catch((error) => {
    console.error(error);
  }); 
}

/** Return the safest neighborings grid found [up, down, right, left].
    Assumption: at least one grid will be safe. */
function getSafeNeighboringGrids(grid){
  let upperGridRow = -1;
  let lowerGridRow = -1;
  let rightGridCol = -1;
  let leftGridCol = -1;
  let safeGrids = [];
  let safeGridUp;
  let safeGridDown;
  let safeGridRight;
  let safeGridLeft;
  let index = 0;

  if(grid.row + 1 < 6){
    upperGridRow = grid.row + 1;

    // Might need to change the parameters once the class for the numberOfReports is merged.
    fetch('/numberOfReports?row=' + upperGridRow + '&col=' + grid.col)
    .then(response => response.json())
    .then((reportsInGrid) => {
        if(reportsInGrid == 0){
        safeGridUp.row = upperGridRow;
        safeGridUp.col = grid.col;
        safeGrids[index] = safeGridUp; 
        index++;
        }
    })
    .catch((error) => {
        console.error(error);
    });
  }
  
  if(grid.row - 1 > 0){
    lowerGridRow = grid.row - 1;

    fetch('/numberOfReports?row=' + lowerGridRow + '&col=' + grid.col)
    .then(response => response.json())
    .then((reportsInGrid) => {
      if(reportsInGrid == 0){
        safeGridDown.row = lowerGridRow;
        safeGridDown.col = grid.col;
        safeGrids[index] = safeGridDown; 
        index++;
      }
    })
    .catch((error) => {
        console.error(error);
    });
  }

  if(grid.col + 1 < 16){
    rightGridCol = grid.col + 1;

    fetch('/numberOfReports?row=' + grid.row + '&col=' + rightGridCol)
    .then(response => response.json())
    .then((reportsInGrid) => {
      if(reportsInGrid == 0){
        safeGridRight.row = grid.row;
        safeGridRight.col = rightGridCol;
        safeGrids[index] = safeGridRight; 
        index++;
      }
    })
    .catch((error) => {
        console.error(error);
    });
  }

  if(grid.col - 1 > 0){
    leftGridCol = grid.col -1;

    fetch('/numberOfReports?row=' + grid.row + '&col=' + leftGridCol)
    .then(response => response.json())
    .then((reportsInGrid) => {
      if(reportsInGrid == 0){
        safeGridLeft.row = grid.row;
        safeGridLeft.col = leftGridCol;
        safeGrids[index] = safeGridLeft;
        index++;
      }
    })
    .catch((error) => {
        console.error(error);
    });
  }

  return safeGrids;
}
