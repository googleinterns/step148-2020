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
let reports;

/** Creates a map and adds it to the page. */
function createMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.422, lng: -122.084 }, 
        zoom:15});
        
    /** When the user clicks on the map, show a marker with a form the user can edit. */ 
    map.addListener('click', (event) => {
        createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
    });
    var controlDiv = document.getElementById('floating-panel');
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
    fetchMarkers();
}

/** Fetches markers from the backend and adds them to the map */
function fetchMarkers(){
    fetch('/markers').then(response => response.json()).then((markers) => {
        markers.forEach((marker) => {
            createMarkerForDisplay(marker.lat, marker.lng, marker.crimeType);
        });
    });
}

/** Creates a marker that shows a read-only info window when clicked */
function createMarkerForDisplay(lat, lng, crimeType){
    const marker = new google.maps.Marker({position: {lat: lat, lng: lng, map: map}});

    var infoWindow = new google.maps.InfoWindow({content: crimeType});

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

/** Sends a marker to the backend for saving */
function postMarker(lat, lng, type){
    const params = new URLSearchParams();

    params.append('lat', lat);
    params.append('lng', lng);
    params.append('crimeType', type);
    // params.append('date', date);
    // params.append('time', time);
    // params.append('address', address);
    // params.append('description', description);

    fetch('/markers', {method: 'POST', body: params})
    .catch((error) => {
        console.error(error);
    });
}

/** Creates a marker that shows a textbox the user can edit */
function createMarkerForEdit(lat, lng){
    /** If we are already showing an editable marker, then remove it */
    if(editMarker){
        editMarker.setMap(null);
    }

    editMarker = new google.maps.Marker({position: {lat: lat, lng: lng}, map: map});

    console.log()

    let infoWindow = new google.maps.InfoWindow({content: buildInfoWindow(lat, lng)});

    /** When the user closes the editable info window, remove the marker */
    google.maps.event.addListener(infoWindow, 'closeclick', () => {
        editMarker.setMap(null);
    });

    infoWindow.open(map, editMarker);
}

/** Builds and returns HTML elements that show an editable textbox and submit button */
function buildInfoWindow(lat, lng){
    const button = document.createElement('button');
    button.appendChild(document.createTextNode('Submit'));

    button.onclick = () => {
        postMarker(lat, lng, getRadioValueCrimes());
        createMarkerForDisplay(lat, lng, getRadioValueCrimes());
        editMarker.setMap(null);
    }

    var divContainer = document.createElement('div');

    divContainer.appendChild(document.getElementById('reportsForm'));
    divContainer.appendChild(button);

    return divContainer;
}

function getRadioValueCrimes(){
    if(document.getElementById('homicide').checked) {
        return document.getElementById('homicide').value;
    }else if(document.getElementById('sexualAssault').checked) {
        return document.getElementById('sexualAssault').value;
    }else if(document.getElementById('robbery').checked) {
        return document.getElementById('robbery').value;
    }else if(document.getElementById('harrassment').checked) {
        return document.getElementById('harrassment').value;
    }else if(document.getElementById('kidnapping').checked) {
        return document.getElementById('kidnapping').value;
    }else if(document.getElementById('drugs').checked) {
        return document.getElementById('drugs').value;
    }
    else{
        return document.getElementById('other').value;
    }
}

function getUserLocation() {
    var infoWindow = new google.maps.InfoWindow;
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
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
        hardcodedMarkers();
        initHeatMap();
        }, 
        function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
          // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function hardcodedMarkers(){
    reports = [
        ['Robbery',31.62931,-106.392942],
        ['Murder',31.627014,-106.396744],
        ['Harassment',31.632739,-106.396744],
        ['Robbery',31.634478,-106.400389]
    ];

    var infowindow = new google.maps.InfoWindow();
    var marker, i;
    for (i = 0; i < reports.length; i++) {  
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(reports[i][1], reports[i][2]),
        map: map
      });

      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        return function() {
          infowindow.setContent(reports[i][0]);
          infowindow.open(map, marker);
        }
      })(marker, i));
    }
}
var heatmap;

function initHeatMap() {
    heatmap = new google.maps.visualization.HeatmapLayer({
    data: getPoints(),
    map: map
    });
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}
      
function getPoints() {
    return [
          new google.maps.LatLng(reports[0][1], reports[0][2]),
          new google.maps.LatLng(reports[1][1], reports[1][2]),
          new google.maps.LatLng(reports[2][1], reports[2][2]),
          new google.maps.LatLng(reports[3][1], reports[3][2])
    ];
}

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

var apply = document.getElementById("apply");

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

apply.onclick = function(){
    modal.style.display = "none";
}

var map;
var markers = [];

function initMap() {
  var haightAshbury = { lat: 37.769, lng: -122.446 };

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: haightAshbury,
    mapTypeId: "terrain"
  });

  // This event listener will call addMarker() when the map is clicked.
  map.addListener("click", function(event) {
    addMarker(event.latLng);
  });

  // Adds a marker at the center of the map.
  addMarker(haightAshbury);
}

// Adds a marker to the map and push to the array.
function addMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  markers.push(marker);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}