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

let map;
/** Editable marker that displays when a user clicks in the map */
let editMarker;
let userLocation;
let markers = [];
let fetchedMarkers = [];
let markerLat;
let markerLng;
let reportsForMarkers = [];

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
    },
    restriction: {
        latLngBounds: {
            north: 31.747628,
            south: 31.730684,
            west: -106.494043,
            east: -106.473825
        },
        strictBounds: false
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
  var autocomplete = new google.maps.places.Autocomplete(
    document.getElementById('searchBox-input'));

  /**
     Bind the map's bounds property to the autocomplete object, so that the
     autocomplete requests use the current map bounds for the bounds for the
     option in the request.
   */
  autocomplete.bindTo('bounds', map);

  /**
   * Listens for the event fired when the user selects a prediction. The
   * report's form pops up.
   */
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace();
    markerLat = place.geometry.location.lat();
    markerLng = place.geometry.location.lng();
    createMarkerForEdit(markerLat, markerLng);
  });

  function typeOfSearch(id, type) {
    var radioButton = document.getElementById(id);

    radioButton.addEventListener('click', function() {
      autocomplete.setTypes(type);
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
  }).catch((error) => {
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
  fetch('/markers')
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

function
fetchReportMarkers() {
  var markerReport;
  fetch('/markers')
    .then(response => response.json())
    .then((markers) => {
      markers.forEach((marker) => {
        markerReport = new google.maps.Marker({
          position: new google.maps.LatLng(marker.lat, marker.lng),
          map: map
        });
        fetchedMarkers.push(markerReport);
        reportsForMarkers.push(marker);
        markerReport.setMap(map);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

function
route() {
  console.log('HEYYYYYY');
  let directionsService = new google.maps.DirectionsService();
  let directionsDisplay = new google.maps.DirectionsRenderer();
  let request = {
    origin: new google.maps.LatLng(31.742485, -106.485468),
    destination: new google.maps.LatLng(31.774414, -106.501199),
    provideRouteAlternatives: true,
    travelMode: 'DRIVING'
  }

  let markerTry = new google.maps.LatLng({
    lat: 31.761679,
    lng: -106.491667
  });

  directionsDisplay.setMap(map);
  directionsService.route(request, function(result, status) {
    if (status === 'OK') {
      console.log(result.routes.length);

      /*for (var i =0; i < result.routes.length; i++) {
          new google.maps.DirectionsRenderer({
          map: map,
          directions: result,
          routeIndex: i
          });
      }*/

      var counter = 0;

      /*console.log(route.legs[0].steps.length);
      console.log("Here we go again");
      console.log(route.legs[0].steps[0].start_location.lat());
      console.log(route.legs[0].steps[0].start_location.lng());
      console.log(route.legs[0].steps[0].end_location.lat());
      console.log(route.legs[0].steps[0].end_location.lng());
      console.log(route.legs[0].steps[0].distance);*/
      /*superMath(route.legs[0].steps[0].start_location, markerTry
       * ,route.legs[0].steps[0].end_location);*/

      var routeIndex = 0;
      var lessCrimesInRoute = 1000;

      for (var r = 0; r < result.routes.length; r++) {
        var route = result.routes[r];

        for (var j = 0; j < route.legs[0].steps.length; j++) {
          var routeArray = new google.maps.Polyline({
            path: [
              new google.maps.LatLng(
                route.legs[0].steps[j].start_location.lat(),
                route.legs[0].steps[j].start_location.lng()),
              new google.maps.LatLng(
                route.legs[0].steps[j].end_location.lat(),
                route.legs[0].steps[j].end_location.lng())
            ]
          });
          for (var l = 0; l < markers.length; l++) {
            var myPosition = new google.maps.LatLng(
              markers[l].getPosition().lat(), markers[l].getPosition().lng());

            if (google.maps.geometry.poly.isLocationOnEdge(
                myPosition, routeArray, 0.0005)) {
              console.log('Relocate!');
              console.log(l);
              console.log(route.legs[0].steps[j].end_location.lat());
              console.log(route.legs[0].steps[j].end_location.lng());
              counter++;
            }
          }
        }

        if (counter < lessCrimesInRoute) {
          lessCrimesInRoute = counter;
          routeIndex = r;
          console.log(r);
        }
        counter = 0;
      }

      console.log(routeIndex);

      new google.maps.DirectionsRenderer({
        map: map,
        directions: result,
        routeIndex: routeIndex
      });
    }
  });
  console.log('2222222');
}

function superMath(point1, point2, point3) {
  console.log(point1.lat());
  console.log(point1.lng());
  console.log(point2.lat());
  console.log(point2.lng());
  console.log(point3.lat());
  console.log(point3.lng());

  var a = (point1.lat() - point3.lat()) * (point1.lat() - point3.lat());

  var b = (point1.lng() - point3.lng()) * (point1.lng() - point3.lng());

  var c = Math.sqrt(a + b);

  console.log(c);
}
