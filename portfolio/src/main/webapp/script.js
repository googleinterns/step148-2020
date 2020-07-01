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
        zoom:10});
        
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
            createMarkerForDisplay(marker.lat, marker.lng, marker.type);
        });
    });
}

/** Creates a marker that shows a read-only info window when clicked */
function createMarkerForDisplay(lat, lng, type){
    const marker = new google.maps.Marker({position: {lat: lat, lng: lng, map: map}});

    var infoWindow = new google.maps.InfoWindow({content: type});

    marker.addListener('click', () => {
        infoWindow.open(map, marker);
    });
}

/** Sends a marker to the backend for saving */
function postMarker(lat, lng, type){
    const params = new URLSearchParams();

    params.append('lat', lat);
    params.append('lng', lng);
    params.append('type', type);

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
        postMarker(lat, lng,document.getElementById('description'));
        createMarkerForDisplay(lat, lng);
        editMarker.setMap(null);
    }

    var divContainer = document.createElement('div');

    divContainer.appendChild(document.getElementById('reportsForm'));
    divContainer.appendChild(button);

    return divContainer;
}

function initMap() {
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
        }, function() {
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
        ['report1',31.62931,-106.392942],
        ['report2',31.627014,-106.396744],
        ['report3',31.632739,-106.396744],
        ['report4',31.634478,-106.400389]
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

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < reports.length; i++) {
    reports[i].setMap(map);
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

