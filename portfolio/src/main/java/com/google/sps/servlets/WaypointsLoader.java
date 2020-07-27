package com.google.sps.servlets;

import com.google.gson.Gson;
import com.google.sps.data.Grid;
import com.google.sps.data.Location;
import java.io.BufferedReader; 
import java.io.FileReader;
import java.util.HashMap;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Handles fetching and saving grids data. */
@WebServlet("/grids")
public class WaypointsLoader extends HttpServlet {
  private static final int NUM_GRIDS_ROWS = 6;
  private static final int NUM_GRIDS_COLS = 16;  
  private static final Gson gson = new Gson();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
    HashMap<Grid, Location> MAP = readWaypoints(request);
    String json = gson.toJson(MAP);
    response.setContentType("application/json");
    response.getWriter().println(json);
  }
  
  public static HashMap<Grid,Location> readWaypoints(HttpServletRequest request){
    HashMap<Grid,Location> map = new HashMap<>();

    try{
    int gridRow = 0;
    int gridCol = 0;
    
    BufferedReader waypointsReader = new BufferedReader(
        new FileReader("/home/dpvalles/step148-2020/portfolio/src/main/java/com/google/sps/data/waypoints.txt"));
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