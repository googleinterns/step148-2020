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