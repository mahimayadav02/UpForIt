# UpForIt

> You want to play. Someone nearby does too.

UpForIt is a full-stack sports meetup platform that helps people find others nearby who are available to play a sport at a specific time.

Instead of waiting for friends to be available, users can create a game, discover nearby games, and join one that fits their schedule.

## Live Demo

**Frontend:** https://up-for-it-ten.vercel.app

**Backend:** https://upforit.onrender.com

## Features

- User signup and login
- Create a sports game with date, time, location, sport, and player capacity
- Discover nearby games
- Calculate distance between users and games
- Join/RSVP to available games
- Leave a game after joining
- Cancel games created by the user
- Track previous games and RSVPs
- View game status and remaining spots
- Notifications for relevant game activity
- Prevent joining games that have reached capacity
- Responsive interface for desktop and mobile

## Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Java
- Spring Boot
- Spring Security
- REST APIs
- Maven
- Docker

### Database
- MongoDB
- MongoDB Atlas

### Deployment
- Vercel — Frontend
- Render — Backend
- Docker — Backend containerization

## How It Works

1. A user signs up or logs in.
2. They can create a game by selecting a sport, date, time, location, and maximum number of players.
3. Other users can discover games happening nearby.
4. Users can view the game details and RSVP if a spot is available.
5. The game automatically reflects its current capacity and status.
6. Users can view their previous games and RSVPs from their account.

## Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │   HTML/CSS/JS       │
                    │      Vercel         │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │     Spring Boot     │
                    │       Render        │
                    │       Docker        │
                    └──────────┬──────────┘
                               │
                               │ MongoDB Driver
                               ▼
                    ┌─────────────────────┐
                    │     MongoDB Atlas   │
                    │      Database       │
                    └─────────────────────┘
