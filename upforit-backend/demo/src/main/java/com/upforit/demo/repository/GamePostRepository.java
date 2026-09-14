package com.upforit.demo.repository;

import com.upforit.demo.model.GamePost;
import org.springframework.data.geo.Distance;
import org.springframework.data.geo.Metrics;
import org.springframework.data.geo.Point;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface GamePostRepository extends MongoRepository<GamePost, String> {
    List<GamePost> findBySport(String sport);
    List<GamePost> findByLocationNear(Point point, Distance distance);
}