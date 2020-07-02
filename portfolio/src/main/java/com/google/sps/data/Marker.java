// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.data;

/** Represents a marker on the map */
public class Marker {
    private final double lat;
    private final double lng;
    private final String crimeType;
    private final String date;
    private final String time;
    private final String address;
    private final String description;

    public Marker(double lat, double lng, String crimeType, String date, String time, String address, String description){
        this.lat = lat;
        this.lng = lng;
        this.crimeType = crimeType;
        this.date = date;
        this.time = time;
        this.address = address;
        this.description = description;
    }

    public double getLat(){
        return lat;
    }

    public double getLng(){
        return lng;
    }

    public String getCrimeType(){
        return crimeType;
    }

    public String getDate(){
        return date;
    }

    public String getTime(){
        return time;
    }
    
    public String getAddress(){
        return address;
    }

    public String getDescription(){
        return description;
    }
}