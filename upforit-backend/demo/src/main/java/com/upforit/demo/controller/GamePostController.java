package com.upforit.demo.controller;

import com.upforit.demo.model.GamePost;
import com.upforit.demo.repository.GamePostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.upforit.demo.dto.GamePostRequest;
import org.springframework.data.mongodb.core.geo.GeoJsonPoint;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import com.upforit.demo.model.Notification;
import com.upforit.demo.model.User;
import com.upforit.demo.repository.NotificationRepository;
import com.upforit.demo.repository.UserRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/games")
public class GamePostController {

    @Autowired
    private GamePostRepository gamePostRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public GamePost createGame(@RequestBody GamePostRequest request) {
        GamePost gamePost = new GamePost();
        gamePost.setSport(request.getSport());
        gamePost.setCreatedBy(request.getCreatedBy());
        gamePost.setTimeWindow(request.getTimeWindow());
        gamePost.setPlayersNeeded(request.getPlayersNeeded());
        gamePost.setVenue(request.getVenue());
        gamePost.setLocation(new GeoJsonPoint(request.getLongitude(), request.getLatitude()));
        gamePost.getRsvpUserIds().add(request.getCreatedBy());
        return gamePostRepository.save(gamePost);
    }

    @GetMapping
    public List<GamePost> getAllGames() {
        return gamePostRepository.findAll();
    }

    @GetMapping("/{id}")
    public GamePost getGameById(@PathVariable String id) {
        Optional<GamePost> game = gamePostRepository.findById(id);
        return game.orElse(null);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGame(@PathVariable String id, @RequestParam String userId) {
        Optional<GamePost> optionalGame = gamePostRepository.findById(id);
        if (optionalGame.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Game not found"));
        }

        GamePost game = optionalGame.get();

        if (!game.getCreatedBy().equals(userId)) {
            return ResponseEntity.status(403).body(Map.of("message", "You can only cancel games you posted"));
        }

        gamePostRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Game cancelled"));
    }

    @GetMapping("/nearby")
    public List<GamePost> getNearbyGames(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "5") double radiusKm) {

        Point location = new Point(longitude, latitude);
        Distance distance = new Distance(radiusKm, Metrics.KILOMETERS);
        return gamePostRepository.findByLocationNear(location, distance);
    }

    @PostMapping("/{id}/rsvp")
    public ResponseEntity<?> rsvpToGame(@PathVariable String id, @RequestParam String userId) {
        Optional<GamePost> optionalGame = gamePostRepository.findById(id);
        if (optionalGame.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Game not found"));
        }

        GamePost game = optionalGame.get();

        if ("CONFIRMED".equals(game.getStatus())) {
            return ResponseEntity.status(409).body(Map.of("message", "This game is already full"));
        }

        if (!game.getRsvpUserIds().contains(userId)) {
            game.getRsvpUserIds().add(userId);

            User rsvpUser = userRepository.findById(userId).orElse(null);
            String rsvperName = (rsvpUser != null) ? rsvpUser.getName() : "Someone";

            Notification notification = new Notification();
            notification.setUserId(game.getCreatedBy());
            notification.setMessage(rsvperName + " RSVP'd to your " + game.getSport() + " game");
            notificationRepository.save(notification);
        }

        if (game.getRsvpUserIds().size() >= game.getPlayersNeeded()) {
            game.setStatus("CONFIRMED");
        }

        return ResponseEntity.ok(gamePostRepository.save(game));
    }

    @DeleteMapping("/{id}/rsvp")
    public ResponseEntity<?> leaveGame(@PathVariable String id, @RequestParam String userId) {
        Optional<GamePost> optionalGame = gamePostRepository.findById(id);
        if (optionalGame.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "Game not found"));
        }

        GamePost game = optionalGame.get();

        if (game.getCreatedBy().equals(userId)) {
            return ResponseEntity.status(400).body(Map.of("message", "As the organizer, cancel the game instead of leaving it"));
        }

        if (!game.getRsvpUserIds().contains(userId)) {
            return ResponseEntity.status(400).body(Map.of("message", "You haven't joined this game"));
        }

        game.getRsvpUserIds().remove(userId);

        if (game.getRsvpUserIds().size() < game.getPlayersNeeded()) {
            game.setStatus("OPEN");
        }

        return ResponseEntity.ok(gamePostRepository.save(game));
    }
}