package com.google.sps.servlets;

import com.google.sps.data.Grid;
import com.google.sps.data.Location;
import java.io.FileReader;
import java.io.BufferedReader; 
import java.util.HashMap;
import java.io.IOException;

public class WaypointsLoader {
  private static final int NUM_GRIDS_ROWS = 6;
  private static final int NUM_GRIDS_COLS = 16;  
  private static final HashMap<Grid, Location> MAP = readWaypoints();
  
  public static HashMap<Grid,Location> readWaypoints(){
    HashMap<Grid,Location> map = new HashMap<>();

    try{
    int gridRow = 0;
    int gridCol = 0;
    
    BufferedReader waypointsReader = new BufferedReader(
        new FileReader("waypoints.txt"));
    String coordinate;
    
      while((coordinate = waypointsReader.readLine()) != null){
        String[] coordinateWaypoint = coordinate.split(",");
        Location waypoint = new Location(
            Double.parseDouble(coordinateWaypoint[0].trim()), 
            Double.parseDouble(coordinateWaypoint[1].trim()));

        map.put(new Grid(gridRow, gridCol), waypoint);
        gridCol++;

        if(gridCol == NUM_GRIDS_COLS){
            gridCol = 0;
            gridRow++;
        }
      }
    }
    catch(IOException error){
        System.out.println(error);
    }

    return map;
  }
}