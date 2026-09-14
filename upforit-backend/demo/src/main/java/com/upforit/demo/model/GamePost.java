package com.upforit.demo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexed;
import org.springframework.data.mongodb.core.index.GeoSpatialIndexType;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "gamePosts")
public class GamePost {
    @Id
    private String id;
    private String sport;
    private String createdBy;

    @GeoSpatialIndexed(type = GeoSpatialIndexType.GEO_2DSPHERE)
    private GeoJsonPoint location;

    private String venue;
    private String timeWindow;
    private int playersNeeded;
    private List<String> rsvpUserIds = new ArrayList<>();
    private String status = "OPEN";
    private Instant createdAt = Instant.now();
}