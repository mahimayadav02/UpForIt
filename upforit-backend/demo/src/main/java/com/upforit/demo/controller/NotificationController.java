package com.upforit.demo.controller;

import com.upforit.demo.model.Notification;
import com.upforit.demo.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<Notification> getUnreadNotifications(@RequestParam String userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }

    @PostMapping("/{id}/read")
    public String markAsRead(@PathVariable String id) {
        Optional<Notification> optional = notificationRepository.findById(id);
        if (optional.isEmpty()) {
            return "Notification not found";
        }
        Notification notification = optional.get();
        notification.setRead(true);
        notificationRepository.save(notification);
        return "Marked as read";
    }
}