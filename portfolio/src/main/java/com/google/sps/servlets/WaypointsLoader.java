package com.google.sps.servlets;

import com.google.sps.data.Waypoint;
import java.io.BufferedReader; 
import java.io.IOException;

public class WaypointsLoader {
  final static Map<Grid, Waypoint> map;

  public static void read() throws IOException{
    BufferedReader waypointsReader = new BufferedReader(
        new FileReader("/waypoints.txt"));
    String coordinate;
    
      while((coordinate = waypointsReader.readLine()) != null){
        String[] coordinateWaypoint = coordinate.split(",");
        Waypoint waypoint = new Waypoint(
            Double.parseDouble(coordinateWaypoint[0].trim()), 
            Double.parseDouble(coordinateWaypoint[1].trim()));
      }
  }
}