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

/** Handles fetching and saving markers data. */
@WebServlet("/markers")
public class MarkerServlet extends HttpServlet {
  private static final Gson gson = new Gson();
  private static final DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private static final String ENTITY_TITLE = "Marker";
  private static final String ENTITY_PROPERTY_KEY_1 = "lat";
  private static final String ENTITY_PROPERTY_KEY_2 = "lng";
  private static final String ENTITY_PROPERTY_KEY_3 = "crimeType";
  private static final String ENTITY_PROPERTY_KEY_4 = "date";
  private static final String ENTITY_PROPERTY_KEY_5 = "time";
  private static final String ENTITY_PROPERTY_KEY_6 = "address";
  private static final String ENTITY_PROPERTY_KEY_7 = "description";
  private static final String ENTITY_PROPERTY_KEY_8 = "row";
  private static final String ENTITY_PROPERTY_KEY_9 = "col";
  private static final double METERS_IN_A_MILE = 1609.34;
  public static final Double LAT_NORTH_LIMIT = 31.676131;
  private static final Double LAT_SOUTH_LIMIT = 31.668060999999998;
  public static final Double LNG_WEST_LIMIT = -106.441602;
  private static final Double LNG_EAST_LIMIT = -106.42384200000005;

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
    List<Marker> markers = getMarkers(request);
    String json = gson.toJson(markers);
    response.setContentType("application/json");
    response.getWriter().println(json);
  }

  /** Accepts a POST request containing a new marker. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    double lat = Double.parseDouble(request.getParameter("lat"));
    double lng = Double.parseDouble(request.getParameter("lng"));
    Grid grid = Grid.createFromLatLng(lat, lng);

    /** Checks for valid coordinates (limited area covered). */
    if((lat < LAT_SOUTH_LIMIT || lat > LAT_NORTH_LIMIT) || (lng < LNG_WEST_LIMIT || lng > LNG_EAST_LIMIT)){
      System.out.println("Coordinates outside of bounds");
      return;
    }

    /**
     * Use to ensure that end-user provided HTML contains only elements and attributes that you are
     * expecting; no junk
     */
    try {
      String crime = Jsoup.clean(request.getParameter("crimeType"), Whitelist.none());
      String crimeDate = Jsoup.clean(request.getParameter("date"), Whitelist.none());
      String crimeTime = Jsoup.clean(request.getParameter("time"), Whitelist.none());
      String crimeAddress = Jsoup.clean(request.getParameter("address"), Whitelist.none());
      String crimeDescription = Jsoup.clean(request.getParameter("description"), Whitelist.none());

      Marker marker =
          new Marker(lat, lng, crime, crimeDate, crimeTime, crimeAddress, crimeDescription, grid.row, grid.col);
      storeMarker(marker);
    } catch (Error error) {
      System.out.println(error);
    }
  }

  /** Fetches markers from Datastore. */
  public static List<Marker> getMarkers(HttpServletRequest request){
    List<Marker> markers = new ArrayList<>();
    Query query = new Query(ENTITY_TITLE);
    PreparedQuery results = datastore.prepare(query);
   
    for(Entity entity: results.asIterable()){
        double lat = (double) entity.getProperty(ENTITY_PROPERTY_KEY_1);
        double lng = (double) entity.getProperty(ENTITY_PROPERTY_KEY_2);
        String crime = (String) entity.getProperty("crimeType");
        String date = (String) entity.getProperty("date");
        String time = (String) entity.getProperty("time");
        String address = (String) entity.getProperty("address");
        String description = (String) entity.getProperty("description");
        Grid grid = Grid.createFromLatLng(lat, lng);
        //System.out.println("Row: " + grid.row + "and Col: " + grid.col);

        //fetching all of the markers
        Marker marker = new Marker(lat, lng, crime, date, time, address, description, grid.row, grid.col);
        markers.add(marker);

    }
    return markers;
  }

  /** Stores a marker in Datastore. */
  public void storeMarker(Marker marker) {
    Entity markerEntity = new Entity(ENTITY_TITLE);
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_1, marker.getLat());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_2, marker.getLng());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_3, marker.getCrimeType());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_4, marker.getDate());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_5, marker.getTime());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_6, marker.getAddress());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_7, marker.getDescription());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_8, marker.getGridRow());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_9, marker.getGridCol());

    datastore.put(markerEntity);
  }

  public static Location getUserLocation(HttpServletRequest request){
    String locationStr = request.getParameter("location");
    String[] locationArrStr = locationStr.split(",", 2);
    double lat = Double.parseDouble(locationArrStr[0]);
    double lng = Double.parseDouble(locationArrStr[1]);
    Location userLocation = new Location(lat, lng);
    return userLocation;
  }
}
