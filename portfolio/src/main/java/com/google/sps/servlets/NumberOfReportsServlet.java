package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;
import com.google.sps.data.Marker;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.jsoup.Jsoup;


/** Handles fetching and saving markers data. */
@WebServlet("/numberOfReports")
public class NumberOfReportsServlet extends HttpServlet {
  private static final Gson gson = new Gson();
  private static final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();


  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{     
    List<Marker> markers = MarkerServlet.getMarkers(request);
    long reportsInGrids = getNumOfReports(markers, Integer.parseInt(request.getParameter("row")), Integer.parseInt(request.getParameter("col")));
    String json = gson.toJson(reportsInGrids);
    response.setContentType("application/json");
    response.getWriter().println(json);    
  }

  /** Get num of reports for a grid. */
  public long getNumOfReports(List<Marker> markers, int gridRow, int gridCol){
    long reports = markers.stream()
    .filter(marker -> marker.getGridRow() == gridRow && marker.getGridCol() == gridCol)
    .count();
    return reports;
  }
}
