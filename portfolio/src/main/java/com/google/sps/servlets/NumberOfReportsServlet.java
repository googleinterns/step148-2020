package com.google.sps.servlets;

import static org.apache.lucene.util.SloppyMath.haversinMeters;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;
import com.google.sps.data.Grid;
import com.google.sps.data.Location;
import com.google.sps.data.Marker;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jsoup.Jsoup;
import org.jsoup.safety.Whitelist;
import java.util.HashMap;
import java.util.Arrays;
import java.lang.*;

/** Handles fetching and saving markers data. */
@WebServlet("/numberOfReports")
public class NumberOfReportsServlet extends HttpServlet {
  private static final Gson gson = new Gson();
  private static final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  //List<Grid> reportsInGrids = new ArrayList<Grid>();
  double lat;
  double lng;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
    MarkerServlet markerServlet = new MarkerServlet();
    List<Marker> markers = markerServlet.getMarkers(request);
    List<Grid> reportsInGrids = new ArrayList<Grid>();
    reportsInGrids = getNumOfReportsforAll(reportsInGrids, markers);
    String json = gson.toJson(reportsInGrids); //returns the number of reports for all grids
    response.setContentType("application/json");
    response.getWriter().println(json);    
  }

  //for each marker in the arraylist, get num of reports
  public List<Grid> getNumOfReportsforAll(List<Grid> reportsInGrids, List<Marker> markers){
    for(Marker marker : markers){
        //if new grid, create object and +1 reports
      if(uniqueInList(reportsInGrids, new Grid(marker.getLat(), marker.getLng()))){
        Grid grid = new Grid(marker.getLat(), marker.getLng());  
        grid.setNumOfReports(1);
        reportsInGrids.add(grid);
      }else{
        Grid grid = findGridToIncrease(reportsInGrids, new Grid(marker.getLat(), marker.getLng()));
        grid.setNumOfReports(1); //increase reports on that grid by 1
      }
    }
    return reportsInGrids;
  }

  public boolean uniqueInList(List<Grid> reportsInGrids,Grid gridToCompare){
    if(reportsInGrids.size() == 0){
        return true;
    }
    for(Grid grid : reportsInGrids){
      if(Arrays.equals(gridToCompare.createFromLatLng(), grid.createFromLatLng())){
        return false;
      }
    }
    return true;
  }

  public Grid findGridToIncrease(List<Grid> reportsInGrids, Grid gridToFind){
    for(Grid grid : reportsInGrids){
      if(Arrays.equals(gridToFind.createFromLatLng(), grid.createFromLatLng())){
        return grid;
      }
    }
    return null;
  }
}
