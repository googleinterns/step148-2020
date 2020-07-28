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
  private static final int NUM_GRIDS_ROWS = 6;
  private static final int NUM_GRIDS_COLS = 16; 
  private static final Gson GSON = new Gson();
  private static final double[] COORDINATES_WAYPOINT = {31.675332,-106.44099,
                                                        31.674918,-106.43949,
                                                        31.674867,-106.43856,
                                                        31.674849,-106.43732,
                                                        31.67483,-106.43669,
                                                        31.674782,-106.43546,
                                                        31.674735,-106.43429,
                                                        31.674663,-106.43283,
                                                        31.675776,-106.43202,
                                                        31.67574,-106.4308,
                                                        31.675737,-106.43019,
                                                        31.675124,-106.42898,
                                                        31.675115,-106.42773,
                                                        31.675756,-106.42716,
                                                        31.675699,-106.42584,
                                                        31.675723,-106.42477,
                                                        31.673612,-106.4404,
                                                        31.673564,-106.43993,
                                                        31.673469,-106.43806,
                                                        31.673466,-106.43738,
                                                        31.673413,-106.43615,
                                                        31.673411,-106.43556,
                                                        31.673356,-106.43433,
                                                        31.673886,-106.4329,
                                                        31.673888,-106.43091,
                                                        31.673887,-106.43214,
                                                        31.674523,-106.42962,
                                                        31.674479,-106.42902,
                                                        31.674452,-106.42782,
                                                        31.674381,-106.42659,
                                                        31.673632,-106.42595,
                                                        31.67355,-106.42493,
                                                        31.672817,-106.440051,
                                                        31.672799,-106.439182,
                                                        31.672723,-106.438251,
                                                        31.672705,-106.437342,
                                                        31.672654,-106.436135,
                                                        31.672654,-106.435513,
                                                        31.672590,-106.434322,
                                                        31.672512,-106.432899,
                                                        31.672494,-106.432164,
                                                        31.672446,-106.430941,
                                                        31.672389,-106.429717,
                                                        31.672368,-106.429108,
                                                        31.672296,-106.427917,
                                                        31.672263,-106.426711,
                                                        31.672249,-106.426057,
                                                        31.672217,-106.425134,
                                                        31.671345,-106.440443,
                                                        31.671240,-106.439504,
                                                        31.671245,-106.438051,
                                                        31.671157,-106.437468,
                                                        31.671175,-106.436216,
                                                        31.671147,-106.435620,
                                                        31.671047,-106.434375,
                                                        31.671020,-106.433088,
                                                        31.670990,-106.432280,
                                                        31.670953,-106.431018,
                                                        31.670903,-106.429807,
                                                        31.670862,-106.429214,
                                                        31.670848,-106.428018,
                                                        31.670797,-106.426775,
                                                        31.670694,-106.426451,
                                                        31.670575,-106.425620,
                                                        31.669219,-106.440519,
                                                        31.670421,-106.438886,
                                                        31.670353,-106.438129,
                                                        31.670307,-106.437331,
                                                        31.670234,-106.436520,
                                                        31.670111,-106.434946,
                                                        31.670048,-106.434162,
                                                        31.669988,-106.433397,
                                                        31.669841,-106.431801,
                                                        31.669786,-106.431015,
                                                        31.669722,-106.430218,
                                                        31.669593,-106.428665,
                                                        31.669530,-106.427888,
                                                        31.669464,-106.427098,
                                                        31.669361,-106.426126,
                                                        31.669346,-106.423941,
                                                        31.668272,-106.440302,
                                                        31.668170,-106.439065,
                                                        31.668138,-106.438279,
                                                        31.667998,-106.436700,
                                                        31.668911,-106.435836,
                                                        31.668847,-106.435061,
                                                        31.668847,-106.435061,
                                                        31.668656,-106.432706,
                                                        31.668571,-106.431883,
                                                        31.668530,-106.431108,
                                                        31.668430,-106.429528,
                                                        31.668344,-106.428753,
                                                        31.668289,-106.427971,
                                                        31.668237,-106.427179,
                                                        31.668572,-106.426026,
                                                        31.668158,-106.424301};
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
        
      for(int i = 0; i < 96; i++){
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