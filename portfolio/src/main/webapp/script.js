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

function getMaps() {
    if (document.images['maps'].src == 'https://8080-dc5833f4-40d8-4c50-aabc-0b228cb084e0.us-central1.cloudshell.dev/images/heatmap.jpg') {
        document.images['maps'].src = '/images/final-route-markers.jpg' ;
    } else if ( document.images['maps'].src == 'https://8080-dc5833f4-40d8-4c50-aabc-0b228cb084e0.us-central1.cloudshell.dev/images/final-route-markers.jpg') {
        document.images['maps'].src = '/images/reportsMarkersMap.png';
    } else if (document.images['maps'].src == 'https://8080-dc5833f4-40d8-4c50-aabc-0b228cb084e0.us-central1.cloudshell.dev/images/reportsMarkersMap.png'){
        document.images['maps'].src = '/images/heatmap.jpg';
    }
    else {
        alert('error');
    }
}
