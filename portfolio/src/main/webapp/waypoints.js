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

var grid = new Object();
grid.row = 1;
grid.col = 2;

async function getWaypointForGrid(grid) {
  try{
    let response = await fetch('/grids?requestRow=' + grid.row + '&requestCol=' + grid.col);
    let waypoint = await response.json();
    return [waypoint.lat,waypoint.lng];
  }
  catch(error){
    console.error(error);
  }
}

/** Return the safest neighborings grid found [up, down, right, left].
    Assumption: at least one grid will be safe. */
async function getSafeNeighboringGrids(grid,set){
  console.log('111111 Safe neighboring grids');
  let upperGridRow = -1;
  let lowerGridRow = -1;
  let rightGridCol = -1;
  let leftGridCol = -1;
  let safeGrids = [];
  let safeGridUp = new Object();
  let safeGridDown = new Object();
  let safeGridRight = new Object();
  let safeGridLeft = new Object();
  let index = 0;
  let arrDiffGrids = [];

  let upGrid = new Grid(grid.row+1,grid.col);
  let downGrid = new Grid(grid.row-1,grid.col);
  let leftGrid = new Grid(grid.row,grid.col-1);
  let rightGrid = new Grid(grid.row,grid.col+1);

  let upDiff = await diffGrids(passingGrid, upGrid);
  let downDiff = await diffGrids(passingGrid, downGrid);
  let leftDiff = await diffGrids(passingGrid, leftGrid);
  let rightDiff = await diffGrids(passingGrid, rightGrid);

  let up = false;
  let down = false;
  let left = false;
  let right = false;
  
  if ((upDiff == leftDiff) && (upDiff != rightDiff)) {
    if (upDiff > downDiff) {
      console.log('Style 1');
      down = true;
      right = true;
    }
    else if (upDiff == downDiff) {
      console.log('Style 2');
      up = true;
      left = true;
      down = true;
      right = true;
    }
    else {
      console.log('Style 3');
      up = true;
      left = true;
    }
  }
  else if ((upDiff == leftDiff) && (upDiff == rightDiff)) {
      console.log('Style 4');
      up = true;
      left = true;
      down = true;
      right = true;
  }
  else if ((upDiff == rightDiff) && (upDiff != leftDiff)) {
    if (upDiff > downDiff) {
      console.log('Style 5');
      left = true;
      down = true;
    }
    else if (upDiff == downDiff) {
      console.log('Style 6');
      up = true;
      left = true;
      down = true;
      right = true;
    }
    else {
      console.log('Style 7');
      right = true;
      up = true;
    }
  }


  if(grid.row + 1 < 6){
    upperGridRow = grid.row + 1;

    try{
      let response = await fetch('/numberOfReports?row=' + upperGridRow + '&col=' + grid.col);
      let reportsInGrid = await response.json();
      
      if(reportsInGrid == 0){
        safeGridUp.row = upperGridRow;
        safeGridUp.col = grid.col;
        //CHANGED
        if (!set.has(await numGrid(safeGridUp)) && up){
          safeGrids[index] = safeGridUp; 
          index++;           
        }
      }
    }
    catch(error){
      console.error(error);
    }
  }
  
  if(grid.row - 1 > 0){
    lowerGridRow = grid.row - 1;

    try{
      let response = await fetch('/numberOfReports?row=' + lowerGridRow + '&col=' + grid.col);
      let reportsInGrid = await response.json();

      if(reportsInGrid == 0){
        safeGridDown.row = lowerGridRow;
        safeGridDown.col = grid.col;
        //CHANGED
        if (!set.has(await numGrid(safeGridDown)) && down){
          safeGrids[index] = safeGridDown; 
          index++;           
        }
      }
    }
    catch(error){
        console.error(error);
    }
  }

  if(grid.col + 1 < 16){
    rightGridCol = grid.col + 1;
    
    try{
      let response = await fetch('/numberOfReports?row=' + grid.row + '&col=' + rightGridCol);
      let reportsInGrid = await response.json();
    
      if(reportsInGrid == 0){
        safeGridRight.row = grid.row;
        safeGridRight.col = rightGridCol;
        //CHANGED
        if (!set.has(await numGrid(safeGridRight)) && right){
          safeGrids[index] = safeGridRight; 
          index++;           
        }
      }
    }
    catch(error){
        console.error(error);
    }
  }

  if(grid.col - 1 > 0){
    leftGridCol = grid.col -1;

    try{
      let response = await fetch('/numberOfReports?row=' + grid.row + '&col=' + leftGridCol);
      let reportsInGrid = await response.json();
    
      if(reportsInGrid == 0){
        safeGridLeft.row = grid.row;
        safeGridLeft.col = leftGridCol;
        //CHANGED
        if (!set.has(await numGrid(safeGridLeft)) && left ){
          safeGrids[index] = safeGridLeft; 
          index++;           
        }
      }
    }
    catch(error){
        console.error(error);
    }
  }
  console.log(grid);
  console.log(safeGrids);
  return safeGrids;
}

getSafeNeighboringGrids(grid,set); // Remove when everything is merged (also the var grid above).

async function diffGrids(grid1, grid2){
  return await Math.abs(grid1.row - grid2.row) + Math.abs(grid1.col - grid2.col);
}