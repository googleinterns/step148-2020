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

package com.google.sps.data;


import java.lang.Math; 
import java.util.Objects;
import com.google.sps.servlets.MarkerServlet;

public class Grid {
  private static final double LAT_DIFF = 0.001345;
  private static final double LNG_DIFF = 0.00111;
  public int numOfReports; 
  public final int row;
  public final int col;

  public Grid(int row, int col){
    this.row = row;
    this.col = col;
  }

  @Override
  public int hashCode(){
    return Objects.hash(new Integer(row), new Integer(col));
  }

  @Override
  public boolean equals(Object other){
    if(other == null || !(other instanceof Grid)){
      return false;
    }

    Grid otherGrid = (Grid) other;
    return this.row == otherGrid.row && this.col == otherGrid.col;
  }

  //Converts lat and lng of a point to the x and y coordinate of the grid
  public static Grid createFromLatLng(double lat, double lng){
    int row = (int)((MarkerServlet.LAT_NORTH_LIMIT - lat) / LAT_DIFF);
    int col = (int)((Math.abs(MarkerServlet.LNG_WEST_LIMIT) - Math.abs(lng)) / LNG_DIFF);
    System.out.println("row is: " + row + " col is: " + col);
    return new Grid(row, col); 
  }
}
