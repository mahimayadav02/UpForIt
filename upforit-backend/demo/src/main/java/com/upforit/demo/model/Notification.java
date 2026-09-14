package com.upforit.demo.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId; // who this notification is FOR
    private String message;
    private boolean read = false;
    private Instant createdAt = Instant.now();
}