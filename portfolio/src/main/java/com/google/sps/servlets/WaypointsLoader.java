package com.google.sps.servlets;

import com.google.gson.Gson;
import com.google.sps.data.Grid;
import com.google.sps.data.Location;
import java.util.HashMap;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Handles fetching and saving grids data. */
@WebServlet("/grids")
public class WaypointsLoader extends HttpServlet {
  private static final int NUM_GRIDS_ROWS = 7;
  private static final int NUM_GRIDS_COLS = 16; 
  private static final Gson GSON = new Gson();
  private static final double[] COORDINATES_WAYPOINT = {31.675605, -106.44099,
                                                        31.675589, -106.44,
                                                        31.67552, -106.43857,
                                                        31.67596, -106.43724,
                                                        31.675946, -106.43662,
                                                        31.675899, -106.43542,
                                                        31.675863, -106.4342,
                                                        31.675829, -106.43349,
                                                        31.675768, -106.43202,
                                                        31.675742, -106.43081,
                                                        31.675742, -106.43019,
                                                        31.675785, -106.42895,
                                                        31.675781, -106.42748,
                                                        31.675764, -106.42653,
                                                        31.675688, -106.42541,
                                                        31.675724, -106.42477,
                                                        31.674257, -106.44098,
                                                        31.674932, -106.44003,
                                                        31.674883, -106.43874,
                                                        31.674847, -106.43787,
                                                        31.674833, -106.43669,
                                                        31.67478, -106.43545,
                                                        31.674736, -106.43428,
                                                        31.67469, -106.43356,
                                                        31.674601, -106.43209,
                                                        31.674576, -106.43087,
                                                        31.674554, -106.43024,
                                                        31.674486, -106.42902,
                                                        31.674464, -106.42783,
                                                        31.674391, -106.42661,
                                                        31.674339, -106.42563,
                                                        31.674283, -106.42479,
                                                        31.673641, -106.44103,
                                                        31.673569, -106.43993,
                                                        31.673528, -106.43893,
                                                        31.673475, -106.43798,
                                                        31.673446, -106.43675,
                                                        31.673408, -106.43556,
                                                        31.673353, -106.43433,
                                                        31.673286, -106.43294,
                                                        31.673257, -106.43217,
                                                        31.673184, -106.43095,
                                                        31.673174, -106.42973,
                                                        31.673109, -106.42851,
                                                        31.673091, -106.42792,
                                                        31.67305, -106.4267,
                                                        31.672864, -106.42513,
                                                        31.673572, -106.42464,
                                                        31.672564, -106.44111,
                                                        31.672313, -106.44023,
                                                        31.672233, -106.4384,
                                                        31.672748, -106.438,
                                                        31.672731, -106.43681,
                                                        31.672677, -106.43558,
                                                        31.672613, -106.43435,
                                                        31.672508, -106.43298,
                                                        31.672484, -106.4322,
                                                        31.672441, -106.43099,
                                                        31.672392, -106.42976,
                                                        31.672372, -106.4291,
                                                        31.672337, -106.4279,
                                                        31.672298, -106.42675,
                                                        31.672236, -106.4253,
                                                        31.672422, -106.42489,
                                                        31.670924, -106.44092,
                                                        31.67126, -106.43989,
                                                        31.671275, -106.43865,
                                                        31.67122, -106.43751,
                                                        31.671207, -106.43686,
                                                        31.671138, -106.43563,
                                                        31.671101, -106.43441,
                                                        31.671022, -106.43309,
                                                        31.670998, -106.43227,
                                                        31.670958, -106.43109,
                                                        31.670896, -106.4298,
                                                        31.670862, -106.42859,
                                                        31.670815, -106.42794,
                                                        31.670791, -106.4268,
                                                        31.670707, -106.42571,
                                                        31.671024, -106.42443,
                                                        31.670466, -106.44097,
                                                        31.670489, -106.43973,
                                                        31.670415, -106.43889,
                                                        31.670351, -106.43812,
                                                        31.670253, -106.43656,
                                                        31.670193, -106.43579,
                                                        31.670069, -106.43419,
                                                        31.669972, -106.43318,
                                                        31.669856, -106.43182,
                                                        31.669781, -106.43101,
                                                        31.6697, -106.43021,
                                                        31.669598, -106.42866,
                                                        31.669556, -106.4279,
                                                        31.670567, -106.42616,
                                                        31.67049, -106.42576,
                                                        31.67021, -106.42439,
                                                        31.66928, -106.4411,
                                                        31.669244, -106.43958,
                                                        31.6692, -106.43899,
                                                        31.669089, -106.43742,
                                                        31.669018, -106.43669,
                                                        31.668867, -106.43512,
                                                        31.668785, -106.43428,
                                                        31.668751, -106.43356,
                                                        31.668627, -106.43197,
                                                        31.668547, -106.43112,
                                                        31.668466, -106.4303,
                                                        31.668944, -106.42872,
                                                        31.668963, -106.42796,
                                                        31.669398, -106.42609,
                                                        31.669132, -106.42587,
                                                        31.668764, -106.42416};
  private static final HashMap<Grid, Location> MAP = readWaypoints();
  
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
    String json = GSON.toJson(MAP.get(new Grid(
        Integer.parseInt(request.getParameter("requestRow")), 
        Integer.parseInt(request.getParameter("requestCol")))));
    response.setContentType("application/json");
    response.getWriter().println(json);
  }
  
  public static HashMap<Grid,Location> readWaypoints(){
    HashMap<Grid,Location> map = new HashMap<>();

    int gridRow = 0;
    int gridCol = 0;
    int lat = 0;
    int lng = 1;
        
      for(int i = 0; i < 112; i++){
        Location waypoint = new Location(COORDINATES_WAYPOINT[lat], 
                                         COORDINATES_WAYPOINT[lng]);

        map.put(new Grid(gridRow, gridCol), waypoint);
        lat += 2;
        lng += 2;
        gridCol++;

        if(gridCol == NUM_GRIDS_COLS){
            gridCol = 0;
            gridRow++;
        }
      }
    
    return map;
  }
}