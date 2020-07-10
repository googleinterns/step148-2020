package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.sps.data.Location;
import com.google.sps.data.Marker;
import com.google.gson.Gson;
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
@WebServlet("/markersByArea")
public class MarkerAreaServlet extends HttpServlet {
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

    /** Responds with JSON array containing marker data. */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{ //add parameter(userLocation)
        List<Marker> markers = getMarkersByArea(request);
        String json = gson.toJson(markers);
        response.setContentType("application/json");
        response.getWriter().println(json); 
    }

    /** Fetches markers from Datastore. */
    private List<Marker> getMarkersByArea(HttpServletRequest request){
        List<Marker> markers = new ArrayList<>();
        Query query = new Query(ENTITY_TITLE);
        PreparedQuery results = datastore.prepare(query);
        Location location = getUserLocation(request);

        for(Entity entity: results.asIterable()){
            double lat = (double) entity.getProperty("lat");
            double lng = (double) entity.getProperty("lng");
            String crime = (String) entity.getProperty("crimeType");
            String date = (String) entity.getProperty("date");
            String time = (String) entity.getProperty("time");
            String address = (String) entity.getProperty("address");
            String description = (String) entity.getProperty("description");
            //fetches markers olny if they are inside the wanted area
            if(inArea(location, lat, lng)){ 
                Marker marker = new Marker(lat, lng, crime, date, time, address, description);
                markers.add(marker);
            }
        }
        return markers;
    }

    public Location getUserLocation(HttpServletRequest request){
        String locationStr = request.getParameter("location");
        String[] locationArrStr = locationStr.split(",", 2);
        double lat = Double.parseDouble(locationArrStr[0]);
        double lng = Double.parseDouble(locationArrStr[1]);
        Location userLocation = new Location(lat, lng);
        return userLocation;

    }

    public boolean inArea(Location location, double markerLat, double markerLng){
        return haversineDistance(location, markerLat, markerLng) <= 1609.34; //return markers that are within 1 mile (1609 meters) away from user
    }

    /* Returns distance between user location and a report (in meters).*/
    public double haversineDistance(Location location, double markerLat, double markerLng) {
        double distance = org.apache.lucene.util.SloppyMath.haversinMeters(location.getLatitude(), location.getLongitude(), markerLat, markerLng);
        System.out.println("distance of this marker is: " + distance);
        return distance;
    }
}