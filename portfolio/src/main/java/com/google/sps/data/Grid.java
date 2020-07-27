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

public class Grid{
  private final double LIMIT_NORTH = 31.676131;
  private final double LIMIT_WEST = 106.441602;
  private final double LAT_DIFF = 0.001345;
  private final double LNG_DIFF = 0.00111;
  private double lat;
  private double lng;
  private int numOfReports; 

  public Grid(double lat, double lng) {
    this.lat  = lat;
    this.lng = lng;
  }

  public double getLat() {
    return lat; 
  }

  public double getLng() { 
    return lng;
  }

  public int getNumOfReports(){
    return numOfReports;
  }

  public void setNumOfReports(int increaseReports){
    this.numOfReports += increaseReports;
  }

//Converts lat and lng of a point to the x and y coordinate of the grid
  public int[] createFromLatLng(){
    int row = (int)((LIMIT_NORTH - lat) / LAT_DIFF);
    int col = (int)((LIMIT_WEST - Math.abs(lng)) / LNG_DIFF);
    System.out.println("row is: " + row + " col is: " + col);
    return new int[] {row,col}; 
  }
}
