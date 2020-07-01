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

/** Creates a map and adds it to the page. */
function createMap(){
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 37.422, lng: -122.084 }, 
        zoom:10});
        
    /** When the user clicks on the map, show a marker with a form the user can edit. */ 
    map.addListener('click', (event) => {
        createMarkerForEdit(event.latLng.lat(), event.latLng.lng());
    });

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
    // const textbox = document.createElement('textarea');
    const button = document.createElement('button');
    button.appendChild(document.createTextNode('Submit'));

    button.onclick = () => {
        postMarker(lat, lng, textbox.value);
        createMarkerForDisplay(lat, lng);
        editMarker.setMap(null);
    }

    var createForm = document.createElement('form');

    var typeOfCrime = document.createElement('label');
    typeOfCrime.innerHTML = 'Type of crime: ';
    createForm.appendChild(typeOfCrime);
    createForm.appendChild(document.createElement('br'));

    var inputCrime1 = document.createElement('input');
    var labelCrime1 = document.createElement('label');
    labelCrime1.innerHTML = 'Homicide';
    inputCrime1.setAttribute('type', 'radio');
    inputCrime1.value = 'Homicide';
    labelCrime1.appendChild(inputCrime1);
    createForm.appendChild(labelCrime1);
    createForm.appendChild(document.createElement('br'));

    var inputCrime2 = document.createElement('input');
    var labelCrime2 = document.createElement('label');
    labelCrime2.innerHTML = 'Sexual Assault';
    inputCrime2.setAttribute('type', 'radio');
    inputCrime2.value = 'Sexual Assault';
    labelCrime2.appendChild(inputCrime2);
    createForm.appendChild(labelCrime2);

    const containerDiv = document.createElement('div');
    containerDiv.setAttribute('id', 'reports');
    containerDiv.appendChild(createForm);
    containerDiv.appendChild(document.createElement('br'));
    containerDiv.appendChild(button);

    return containerDiv;
}
