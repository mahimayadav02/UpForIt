const API_BASE = "https://upforit.onrender.com/api";

function showLogin() {
    document.getElementById('loginForm').style.display = 'flex';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginTab').classList.add('active');
    document.getElementById('signupTab').classList.remove('active');
}

function showSignup() {
    document.getElementById('signupForm').style.display = 'flex';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupTab').classList.add('active');
    document.getElementById('loginTab').classList.remove('active');
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const messageEl = document.getElementById('loginMessage');

        messageEl.textContent = "Logging in...";

        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok && data.id) {
                localStorage.setItem('userId', data.id);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userName', data.name);
                messageEl.textContent = "Login successful! Redirecting...";
                setTimeout(() => {
                    window.location.href = "feed.html";
                }, 800);
            } else {
                messageEl.textContent = data.message || "Login failed.";
            }
        } catch (err) {
            messageEl.textContent = "Something went wrong. Is the backend running?";
        }
    });
}

const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const messageEl = document.getElementById('signupMessage');

        messageEl.textContent = "Creating account...";

        try {
            const res = await fetch(`${API_BASE}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();

            if (data.id) {
                localStorage.setItem('userId', data.id);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('userName', data.name);
                messageEl.textContent = "Account created! Redirecting...";
                setTimeout(() => {
                    window.location.href = "feed.html";
                }, 800);
            } else {
                messageEl.textContent = data.message || "Something went wrong. Try again.";
            }
        } catch (err) {
            messageEl.textContent = "Something went wrong. Is the backend running?";
        }
    });
}

/* ---------- Feed page ---------- */

let currentLat = null;
let currentLng = null;
let currentTab = 'nearby';

const gamesList = document.getElementById('gamesList');

if (gamesList) {
    const feedUserId = localStorage.getItem('userId');
    if (!feedUserId) {
        window.location.href = "login.html";
    }

    document.getElementById('profileName').textContent = localStorage.getItem('userName') || 'You';
    document.getElementById('profileEmail').textContent = localStorage.getItem('userEmail') || '';
    document.getElementById('profileAvatarBtn').textContent = (localStorage.getItem('userName') || 'U').charAt(0);

    getUserLocationAndLoadFeed();
    loadNotifications();
    setInterval(loadNotifications, 30000);
}

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tabNearby').classList.toggle('active', tab === 'nearby');
    document.getElementById('tabMine').classList.toggle('active', tab === 'mine');
    document.getElementById('tabRsvps').classList.toggle('active', tab === 'rsvps');

    const heading = document.getElementById('feedHeading');
    const statusEl = document.getElementById('locationStatus');
    const radiusSelect = document.getElementById('radiusSelect');

    if (tab === 'nearby') {
        heading.textContent = 'Games near you';
        radiusSelect.style.display = 'block';
        loadNearbyGames();
    } else if (tab === 'mine') {
        heading.textContent = 'Games you posted';
        statusEl.textContent = '';
        radiusSelect.style.display = 'none';
        loadMyGames();
    } else if (tab === 'rsvps') {
        heading.textContent = 'Games you joined';
        statusEl.textContent = '';
        radiusSelect.style.display = 'none';
        loadMyRsvps();
    }
}

function getUserLocationAndLoadFeed() {
    const statusEl = document.getElementById('locationStatus');

    if (!navigator.geolocation) {
        statusEl.textContent = "Location not supported by your browser.";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            currentLat = position.coords.latitude;
            currentLng = position.coords.longitude;
            loadNearbyGames();
        },
        (error) => {
            statusEl.textContent = "Couldn't get your location. Enable location access and refresh.";
        }
    );
}

async function loadNearbyGames() {
    if (currentLat === null || currentLng === null) return;
    const statusEl = document.getElementById('locationStatus');
    const radiusKm = document.getElementById('radiusSelect').value;

    try {
        const res = await fetch(`${API_BASE}/games/nearby?latitude=${currentLat}&longitude=${currentLng}&radiusKm=${radiusKm}`);
        const games = await res.json();
        statusEl.textContent = `Showing ${games.length} game${games.length !== 1 ? 's' : ''} within ${radiusKm}km of you.`;
        renderGames(games);
    } catch (err) {
        gamesList.innerHTML = '<div class="empty-state">Couldn\'t load games. Is the backend running?</div>';
    }
}

async function loadMyGames() {
    const userId = localStorage.getItem('userId');
    try {
        const res = await fetch(`${API_BASE}/games`);
        const allGames = await res.json();
        const mine = allGames
            .filter(g => g.createdBy === userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        renderGames(mine, "You haven't posted any games yet.");
    } catch (err) {
        gamesList.innerHTML = '<div class="empty-state">Couldn\'t load games. Is the backend running?</div>';
    }
}

async function loadMyRsvps() {
    const userId = localStorage.getItem('userId');
    try {
        const res = await fetch(`${API_BASE}/games`);
        const allGames = await res.json();
        const rsvped = allGames
            .filter(g => g.rsvpUserIds.includes(userId) && g.createdBy !== userId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        renderGames(rsvped, "You haven't joined any games yet.");
    } catch (err) {
        gamesList.innerHTML = '<div class="empty-state">Couldn\'t load games. Is the backend running?</div>';
    }
}

function renderGames(games, emptyMessage) {
    const userId = localStorage.getItem('userId');

    if (!games || games.length === 0) {
        gamesList.innerHTML = `<div class="empty-state">${emptyMessage || 'No games nearby yet. Be the first to post one!'}</div>`;
        return;
    }

    gamesList.innerHTML = games.map(game => {
        const spotsLeft = game.playersNeeded - game.rsvpUserIds.length;
        const isCreator = game.createdBy === userId;
        const alreadyIn = game.rsvpUserIds.includes(userId);
        const isConfirmed = game.status === 'CONFIRMED';
        const disableBtn = alreadyIn || isConfirmed;

        let btnLabel = "I'm in";
        if (alreadyIn) btnLabel = "You're in";
        else if (isConfirmed) btnLabel = "Full";

        let actionRow = '';
        if (isCreator) {
            actionRow = `<div class="cancel-row"><span class="cancel-link" onclick="cancelGame('${game.id}')">Cancel this game</span></div>`;
        } else if (alreadyIn) {
            actionRow = `<div class="cancel-row"><span class="cancel-link" onclick="leaveGame('${game.id}')">Leave this game</span></div>`;
        }

        return `
            <div class="game-card">
                <div class="game-card-top">
                    <div class="game-sport">${game.sport}</div>
                    <div class="status-pill ${isConfirmed ? 'confirmed' : ''}">${isConfirmed ? 'GAME ON' : 'OPEN'}</div>
                </div>
                ${game.venue ? `<div class="game-venue">${game.venue}</div>` : ''}
                <div class="game-meta">${game.timeWindow}</div>
                <div class="game-card-bottom">
                    <div class="spots-text">${game.rsvpUserIds.length}/${game.playersNeeded} joined${spotsLeft > 0 ? ` · ${spotsLeft} spot${spotsLeft > 1 ? 's' : ''} left` : ''}</div>
                    <button class="rsvp-btn" ${disableBtn ? 'disabled' : ''} onclick="rsvpToGame('${game.id}')">${btnLabel}</button>
                </div>
                ${actionRow}
            </div>
        `;
    }).join('');
}

function reloadCurrentTab() {
    if (currentTab === 'nearby') loadNearbyGames();
    else if (currentTab === 'mine') loadMyGames();
    else loadMyRsvps();
}

async function cancelGame(gameId) {
    if (!confirm("Cancel this game? This can't be undone.")) return;

    const userId = localStorage.getItem('userId');

    try {
        const res = await fetch(`${API_BASE}/games/${gameId}?userId=${userId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            reloadCurrentTab();
        } else {
            const data = await res.json();
            alert(data.message || "Couldn't cancel the game.");
        }
    } catch (err) {
        alert("Something went wrong. Is the backend running?");
    }
}

async function leaveGame(gameId) {
    if (!confirm("Leave this game?")) return;

    const userId = localStorage.getItem('userId');

    try {
        const res = await fetch(`${API_BASE}/games/${gameId}/rsvp?userId=${userId}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            reloadCurrentTab();
        } else {
            const data = await res.json();
            alert(data.message || "Couldn't leave the game.");
        }
    } catch (err) {
        alert("Something went wrong. Is the backend running?");
    }
}

async function rsvpToGame(gameId) {
    const userId = localStorage.getItem('userId');

    try {
        const res = await fetch(`${API_BASE}/games/${gameId}/rsvp?userId=${userId}`, {
            method: 'POST'
        });
        if (res.ok) {
            reloadCurrentTab();
        } else {
            const data = await res.json();
            alert(data.message || "Couldn't RSVP.");
        }
    } catch (err) {
        alert("Couldn't RSVP. Is the backend running?");
    }
}

function openPostModal() {
    document.getElementById('postModalOverlay').style.display = 'flex';
}

function closePostModal() {
    document.getElementById('postModalOverlay').style.display = 'none';
}

const postGameForm = document.getElementById('postGameForm');
if (postGameForm) {
    postGameForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const messageEl = document.getElementById('postMessage');
        const userId = localStorage.getItem('userId');

        if (currentLat === null || currentLng === null) {
            messageEl.textContent = "Still getting your location, try again in a moment.";
            return;
        }

        const sport = document.getElementById('postSport').value;
        const venue = document.getElementById('postVenue').value;
        const timeWindow = document.getElementById('postTimeWindow').value;
        const playersNeeded = parseInt(document.getElementById('postPlayersNeeded').value);

        messageEl.textContent = "Posting...";

        try {
            const res = await fetch(`${API_BASE}/games`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sport,
                    createdBy: userId,
                    venue,
                    timeWindow,
                    playersNeeded,
                    latitude: currentLat,
                    longitude: currentLng
                })
            });

            if (res.ok) {
                messageEl.textContent = "Posted!";
                setTimeout(() => {
                    closePostModal();
                    postGameForm.reset();
                    messageEl.textContent = "";
                    switchTab('nearby');
                }, 600);
            } else {
                messageEl.textContent = "Something went wrong. Try again.";
            }
        } catch (err) {
            messageEl.textContent = "Something went wrong. Is the backend running?";
        }
    });
}

async function loadNotifications() {
    const notifList = document.getElementById('notifList');
    if (!notifList) return;

    const userId = localStorage.getItem('userId');

    try {
        const res = await fetch(`${API_BASE}/notifications?userId=${userId}`);
        const notifications = await res.json();

        const badge = document.getElementById('notifBadge');
        if (notifications.length > 0) {
            badge.style.display = 'flex';
            badge.textContent = notifications.length;
        } else {
            badge.style.display = 'none';
        }

        if (notifications.length === 0) {
            notifList.innerHTML = '<div class="notif-empty">No new notifications</div>';
        } else {
            notifList.innerHTML = notifications.map(n => `
                <div class="notif-item" onclick="markNotifRead('${n.id}')">${n.message}</div>
            `).join('');
        }
    } catch (err) {
        // silently fail, don't disrupt the feed
    }
}

async function markNotifRead(notifId) {
    try {
        await fetch(`${API_BASE}/notifications/${notifId}/read`, { method: 'POST' });
        loadNotifications();
    } catch (err) {
        // silently fail
    }
}

function toggleNotifDropdown() {
    const dropdown = document.getElementById('notifDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    document.getElementById('profileDropdown').style.display = 'none';
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    document.getElementById('notifDropdown').style.display = 'none';
}

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}