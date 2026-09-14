package com.upforit.demo.dto;

import lombok.Data;

@Data
public class GamePostRequest {
    private String sport;
    private String createdBy;
    private String timeWindow;
    private int playersNeeded;
    private String venue;
    private double latitude;
    private double longitude;
}