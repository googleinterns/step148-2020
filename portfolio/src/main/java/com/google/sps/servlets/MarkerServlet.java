package com.google.sps.servlets;

import static org.apache.lucene.util.SloppyMath.haversinMeters;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.gson.Gson;
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
  private static final double METERS_IN_A_MILE = 1609.34;
  private static final Double LAT_NORTH_LIMIT = 31.676131;
  private static final Double LAT_SOUTH_LIMIT = 31.665916;
  private static final Double LNG_WEST_LIMIT = -106.441602;
  private static final Double LNG_EAST_LIMIT = -106.424213;

  class Result {
    public StoreStatus status;
    public StoreFailureType failure; 

    public void setStatus(StoreStatus status) {
      this.status = status;
    }

    public void setFailureType(StoreFailureType failure) {
      this.failure = failure;
    }
  }

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

    Result resultEnum = new Result();

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

      if (!validateMarker(lat, lng, crimeDate, crimeTime, crime)) {
        resultEnum.setStatus(StoreStatus.FAILURE);
        resultEnum.setFailureType(StoreFailureType.REPEAT);
      }
      else {
        resultEnum.setStatus(StoreStatus.SUCCESS);
        Marker marker =
            new Marker(lat, lng, crime, crimeDate, crimeTime, crimeAddress, crimeDescription);
        storeMarker(marker);
      }

    } catch (Error error) {
        resultEnum.setStatus(StoreStatus.FAILURE);
        resultEnum.setFailureType(StoreFailureType.UNKNOWN);
      System.out.println(error);
    }

    response.getWriter().println(gson.toJson(resultEnum));
  }

  /** Fetches markers from Datastore. */
  private List<Marker> getMarkers(HttpServletRequest request){
    List<Marker> markers = new ArrayList<>();
    Query query = new Query(ENTITY_TITLE);
    PreparedQuery results = datastore.prepare(query);
    Location location = getUserLocation(request);

    for (Entity entity : results.asIterable()) {
      double lat = (double) entity.getProperty("lat");
      double lng = (double) entity.getProperty("lng");
      String crime = (String) entity.getProperty("crimeType");
      String date = (String) entity.getProperty("date");
      String time = (String) entity.getProperty("time");
      String address = (String) entity.getProperty("address");
      String description = (String) entity.getProperty("description");
      //fetches markers olny if they are inside the wanted area
      if(haversinMeters(location.lat, location.lng, lat, lng) <= METERS_IN_A_MILE){ 
        Marker marker = new Marker(lat, lng, crime, date, time, address, description);
        markers.add(marker);
      }
    }
    return markers;
  }

  /** Stores a marker in Datastore. */
  private void storeMarker(Marker marker) {
    Entity markerEntity = new Entity(ENTITY_TITLE);
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_1, marker.getLat());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_2, marker.getLng());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_3, marker.getCrimeType());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_4, marker.getDate());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_5, marker.getTime());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_6, marker.getAddress());
    markerEntity.setProperty(ENTITY_PROPERTY_KEY_7, marker.getDescription());
    datastore.put(markerEntity);
    }

  public Location getUserLocation(HttpServletRequest request){
    String locationStr = request.getParameter("location");
    String[] locationArrStr = locationStr.split(",", 2);
    double lat = Double.parseDouble(locationArrStr[0]);
    double lng = Double.parseDouble(locationArrStr[1]);
    Location userLocation = new Location(lat, lng);
    return userLocation;
  }

  private boolean validateMarker(double reportLat, double reportLng, String reportDate,
   String reportTime, String reportCrime) {
    Query query = new Query(ENTITY_TITLE);
    PreparedQuery results = datastore.prepare(query);

    for (Entity entity : results.asIterable()) {
      double lat = (double) entity.getProperty("lat");
      double lng = (double) entity.getProperty("lng");
      String crime = (String) entity.getProperty("crimeType");
      String date = (String) entity.getProperty("date");
      String time = (String) entity.getProperty("time");

      if (sameLocation(lat, lng, reportLat, reportLng) && sameDate(reportDate, date) 
          && sameTime(reportTime, time) && sameCrime(reportCrime, crime)) 
            return false;
    }
    return true;
  }

  private boolean sameLocation(double markerLat, double markerLng, double reportLat, double reportLng) {
    double R = 6371.0710; // Radius of the Earth in kilometers
    double rlat1 = markerLat * (Math.PI/180); // Convert degrees to radians
    double rlat2 = reportLat * (Math.PI/180); // Convert degrees to radians
    double difflat = rlat2-rlat1; // Radian difference (latitudes)
    double difflon = (reportLng-markerLng) * (Math.PI/180); // Radian difference (longitudes)

    double d = 2 * R * Math.asin(Math.sqrt(Math.sin(difflat/2)*Math.sin(difflat/2)+Math.cos(rlat1)*Math.cos(rlat2)*Math.sin(difflon/2)*Math.sin(difflon/2)));
    /* If distance is less than 10 meters */
    return d < 0.01;
  }

  private boolean sameDate(String date1, String date2) {
    if (date1 == null || date2 == null){
      return false;
    }
    return date1.equals(date2);
  }

  private boolean sameTime(String time1, String time2) {
    if (time1 == null || time2 == null){
      return false;
    }
    else {
      int minutes1 = 600 * time1.charAt(0);
      minutes1 += 60 * time1.charAt(1);
      minutes1 += 10 * time1.charAt(3);
      minutes1 +=  1 * time1.charAt(4);

      int minutes2 = 600 * time2.charAt(0);
      minutes2 += 60 * time2.charAt(1);
      minutes2 += 10 * time2.charAt(3);
      minutes2 +=  1 * time2.charAt(4);

      /* 20 minutes or less in difference between times */
      return Math.abs(minutes1 - minutes2) < 20;
    }
  }

  private boolean sameCrime(String crime1, String crime2){
    if (crime1 == null|| crime2 == null){
      return false;
    }
    return crime1.equals(crime2);
  }
}

enum StoreStatus {
  SUCCESS,
  FAILURE  
}

enum StoreFailureType {
  UNKNOWN,
  REPEAT
}
