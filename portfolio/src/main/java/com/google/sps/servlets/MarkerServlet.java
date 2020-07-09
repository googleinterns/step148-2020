package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
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

    /** Responds with JSON array containing marker data. */
    @Override
    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException{
        List<Marker> markers = getMarkers();
        String json = gson.toJson(markers);
        response.setContentType("application/json");
        response.getWriter().println(json);
    }

    /** Accepts a POST request containing a new marker. */
    @Override
    public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException{
        double lat = Double.parseDouble(request.getParameter("lat"));
        double lng = Double.parseDouble(request.getParameter("lng"));
        
        /** Checks for valid coordinates (limited area covered) */
        if((lat < 31.738327 || lat > 31.747216) || (lng < -106.491492 || lng > -106.478373)){
            System.out.println("Not valid coordinates, cannot store");
            return;
        }

        /** Use to ensure that end-user provided HTML contains only elements and attributes that you 
            are expecting; no junk */
        try{
            String crime = Jsoup.clean(request.getParameter("crimeType"), Whitelist.none());
            String crimeDate = Jsoup.clean(request.getParameter("date"), Whitelist.none());
            String crimeTime = Jsoup.clean(request.getParameter("time"), Whitelist.none());
            String crimeAddress = Jsoup.clean(request.getParameter("address"), Whitelist.none());
            String crimeDescription = Jsoup.clean(request.getParameter("description"), Whitelist.none());

            Marker marker = new Marker(lat, lng, crime, crimeDate, crimeTime, crimeAddress, crimeDescription);
            storeMarker(marker);
        }
        catch(Error error){
            System.out.println(error);
        }
    }

    /** Fetches markers from Datastore. */
    private List<Marker> getMarkers(){
        List<Marker> markers = new ArrayList<>();
        Query query = new Query(ENTITY_TITLE);
        PreparedQuery results = datastore.prepare(query);

        for(Entity entity: results.asIterable()){
            double lat = (double) entity.getProperty("lat");
            double lng = (double) entity.getProperty("lng");
            String crime = (String) entity.getProperty("crimeType");
            String date = (String) entity.getProperty("date");
            String time = (String) entity.getProperty("time");
            String address = (String) entity.getProperty("address");
            String description = (String) entity.getProperty("description");

            Marker marker = new Marker(lat, lng, crime, date, time, address, description);
            markers.add(marker);
        }
        return markers;
    }

    /** Stores a marker in Datastore. */
    public void storeMarker(Marker marker){
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
}