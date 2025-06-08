document.addEventListener("DOMContentLoaded", () => {
    const BASE_URLL = "http://localhost:5000/api"; // ✅ Backend base URL
    console.log("🚀 Fetching events from:", BASE_URL);

    let userId = sessionStorage.getItem("userId") || localStorage.getItem("userId");

    if (!userId) {
        console.warn("⚠️ No user session found! Showing login prompt instead.");
        window.location.href = "home.html"; // ✅ Redirect to login if session is missing
    } else {
        sessionStorage.setItem("userId", userId); // ✅ Ensure userId is in sessionStorage
    }
});

async function fetchUsername() {
    try {
        const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId"); // Get stored userId
        if (!userId) {
            console.error("❌ No user ID found in storage!");
            document.getElementById("username").innerText = "User not logged in";
            return;
        }

        console.log("🚀 Fetching student with ID:", userId);

        const response = await fetch(`http://localhost:5000/api/student/getusername/${userId}`);

        if (!response.ok) {
            console.error("❌ API returned error:", response.status);
            throw new Error("User not found");
        }

        const data = await response.json();
        console.log("✅ Fetched Data:", data);

        document.getElementById("username").innerText = data.name || "No name found";
    } catch (error) {
        console.error("❌ Error fetching user:", error);
        document.getElementById("username").innerText = "Error fetching user";
    }
}

// ✅ Call function on page load
document.addEventListener("DOMContentLoaded", fetchUsername);



// ✅ Function to fetch events from backend
async function fetchEvents(type) {
    try {
        const userId = sessionStorage.getItem("userId");
        const token = localStorage.getItem("authToken");

        if (!token) {
            console.warn("⚠️ No authentication token found!");
            return [];
        }

        let url = `${BASE_URLL}/student/${type}-events`;
        if (type === "registered") {
            if (!userId) {
                console.warn("⚠️ User ID missing, cannot fetch registered events.");
                return [];
            }
            url = `${BASE_URLL}/student/events/${userId}`;
        }

        let response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`❌ Failed to fetch ${type} events (Status: ${response.status})`);
        }

        let events = await response.json();
        console.log(`✅ Fetched ${type} events:`, events);

        // ✅ Ensure events is always an array
        return Array.isArray(events) ? events : [events];

    } catch (error) {
        console.error(`❌ Error fetching ${type} events:`, error.message);
        return [];
    }
}

// ✅ Display upcoming events 
async function showUpcomingEvents() {
    updateHeading("Upcoming Events");

    // Add fade-out effect before fetching new events
    document.getElementById("event-section").classList.add("fade-out");

    let events = await fetchEvents("upcoming"); // Fetch events with type 'upcoming'

    // Wait for the fade-out transition to complete
    setTimeout(() => {
        document.getElementById("event-section").innerHTML = renderEvents(events, true); // Render events with registration button
        document.getElementById("event-section").classList.remove("fade-out"); // Remove fade-out
        document.getElementById("event-section").classList.add("fade-in"); // Add fade-in
    }, 500); // Match the duration of the fade-out transition
}

// ✅ Display past events with a fade transition
async function showPastEvents() {
    updateHeading("Past Events");

    // Add fade-out effect before fetching new events
    document.getElementById("event-section").classList.add("fade-out");

    let events = await fetchEvents("past");

    // Wait for the fade-out transition to complete
    setTimeout(() => {
        document.getElementById("event-section").innerHTML = renderEvents(events, false);
        document.getElementById("event-section").classList.remove("fade-out");
        document.getElementById("event-section").classList.add("fade-in");
    }, 500); // Match the duration of the fade-out transition
}

async function registerEvent(eventId, button) {
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
        alert("Please log in to register for an event.");
        return;
    }

    console.log("🔹 Checking if already registered for eventId:", eventId);

    try {
        // 🔹 Check if registered (only if API exists)
        let registeredEvents = [];
        let checkResponse = await fetch(`http://localhost:5000/api/student/events/${userId}`);
        
        if (checkResponse.ok) {
            registeredEvents = await checkResponse.json();
            registeredEvents = Array.isArray(registeredEvents) ? registeredEvents : [registeredEvents];
        } else {
            console.warn("⚠️ Registered events API not found (404). Skipping check.");
        }

        let alreadyRegistered = registeredEvents.some(event => event.event_id == eventId);
        if (alreadyRegistered) {
            alert("✅ You are already registered for this event.");
            if (button) updateButtonUI(button, true);
            return;
        }

        // 🔹 Send registration request
        let requestBody = JSON.stringify({ user_id: userId, event_id: eventId });
        console.log("🔹 Sending registration request:", requestBody);

        let response = await fetch(`http://localhost:5000/api/student/register-event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: requestBody
        });

        let result = await response.json();
        console.log("🔹 Backend Response:", result);

        if (!response.ok) {
            throw new Error(result.message || "Failed to register for the event.");
        }

        alert("✅ Successfully registered for the event!");

        if (button) updateButtonUI(button, true);
        showUpcomingEvents(); // Refresh event list
    } catch (error) {
        console.error("❌ Registration error:", error);
        alert(`Registration failed! ${error.message}`);
    }
}

function updateButtonUI(button, isRegistered) {
     
    if (isRegistered) {
        button.disabled = true;
        button.style.backgroundColor = "grey";
        button.innerText = "Registered";
    }
}

// ✅ Display registered events
async function showRegisteredEvents() {
    updateHeading("Registered Events");

    const userId = localStorage.getItem("userId"); // Ensure user is logged in
    const token = localStorage.getItem("authToken"); // Retrieve the stored authentication token

    if (!userId) {
        console.warn("⚠️ No user session found! Redirecting to login.");
        window.location.href = "home.html"; // Redirect to login if user not logged in
        return;
    }

    try {
        // Show loading animation
        document.getElementById("event-section").classList.add("fade-out");

        console.log(`🔎 Fetching registered events for user: ${userId}`);

        let response = await fetch(`http://localhost:5000/api/student/events/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`, // Include auth token
                "Content-Type": "application/json"
            }
        });

        let data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `Failed to fetch registered events (Status: ${response.status})`);
        }

        if (data.length) {
            document.getElementById("event-section").innerHTML = renderEvents(data, false, true);
        } else {
            document.getElementById("event-section").innerHTML = "<p>No registered events yet.</p>";
        }

    } catch (error) {
        console.error("❌ Error fetching registered events:", error);
        document.getElementById("event-section").innerHTML = `<p>Error fetching registered events: ${error.message}</p>`;
    }
}

//announcement strip 
document.addEventListener("DOMContentLoaded", function () {
    let announcement = document.getElementById("announcement");

    // Show the announcement
    setTimeout(() => {
        announcement.classList.add("show-announcement");

        // Remove the announcement after 7 seconds
        setTimeout(() => {
            announcement.classList.remove("show-announcement");
        }, 5000); // 7 seconds
    }, 500); // Initial delay before showing
});


// ✅ Function to update heading dynamically
function updateHeading(text) {
    document.getElementById("section-heading").innerText = text;
}

// ✅ Generate and return event cards dynamically
function renderEvents(events, allowRegister = false, isRegistered = false) {
    if (!events.length) return "<p>No events available.</p>";

    return events.map(event => `
        <div class="event-box">
            <img src="${event.image || 'assets/default-event.jpg'}" alt="${event.title}">
            <h3>${event.title}</h3>  <!-- FIXED -->
            <p>${new Date(event.date).toLocaleDateString()} | ${event.location}</p>  <!-- FIXED -->
            ${allowRegister && !isRegistered 
                ? `<button class="register-button" onclick="registerEvent(${event.id})">Register</button>` 
                : `<button class="register-button registered" disabled>Registered</button>`}
        </div>
    `).join('');
}
function logout() {
    console.log("🔴 Logging out...");

// 🔄 Ask for confirmation before logging out
if (confirm("Are you sure you want to log out?")) {
    // ✅ Remove authentication token from localStorage
    localStorage.removeItem("authToken");
    sessionStorage.clear(); // Optional: Clear session storage too

    // ✅ Show a logout success message
    alert("✅ Logged out successfully!");

    // ✅ Redirect to home/login page
    window.location.href = "home.html"; // Ensure this is the correct path
} else {
    console.log("🔵 Logout canceled.");
}

}


//vol page
function showVolunteerPage() {
    const volunteerSection = document.getElementById("volunteer-section");

    // Make section visible
    volunteerSection.style.display = "block";

    // Fetch and show events
    showVolunteerEvents();
}


//VOL EVENTS
async function fetchVolunteerEvents(type)  
{  try {
    const userId = sessionStorage.getItem("userId");
    const token = localStorage.getItem("authToken");

    if (!token) {
        console.warn("⚠️ No authentication token found!");
        return [];
    }

    let url = `${BASE_URLL}/student/${type}-events`;
    if (type === "registered") {
        if (!userId) {
            console.warn("⚠️ User ID missing, cannot fetch registered events.");
            return [];
        }
        url = `${BASE_URLL}/student/events/${userId}`;
    }

    let response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`❌ Failed to fetch ${type} events (Status: ${response.status})`);
    }

    let events = await response.json();
    console.log(`✅ Fetched ${type} events:`, events);

    // ✅ Ensure events is always an array
    return Array.isArray(events) ? events : [events];

} catch (error) {
    console.error(`❌ Error fetching ${type} events:`, error.message);
    return [];
}
}

 // ✅ DISPLAY VOLUNTEER EVENTS IN A DROPDOWN
 async function showVolunteerEvents() {
    updateHeading("Apply to Be a Volunteer");

    let events = await fetchEvents("upcoming"); // Fetch upcoming events

    let eventDropdownHTML = `
        <div id="volunteer-box">
            <label for="volunteer-events">Select Event:</label>
            <select id="volunteer-events">
                <option value="">-- Choose an Event --</option>
                ${events.map(event => `<option value="${event.id}">${event.title} - ${new Date(event.date).toLocaleDateString()}</option>`).join('')}
            </select>
            <button onclick="applyForSelectedVolunteer()">Apply</button>
        </div>

        <div id="volunteer-benefits">
            <h3>Why Become a Volunteer?</h3>
            <p>
                Volunteering is more than just helping out—it's an opportunity to grow, connect, and make a lasting impact. 
                By joining as a volunteer, you gain hands-on experience in teamwork, leadership, and event management, 
                all while building meaningful connections with professionals and fellow students. 
                You'll receive a certificate of appreciation, adding value to your resume and future career. 
                Plus, volunteers get exclusive access to networking events and recognition for their hard work. 
                Be a part of something bigger, create unforgettable experiences, and leave a positive mark in your community. 
                Take the first step towards personal and professional growth—apply now!
            </p>
        </div>
    `;
    setTimeout(() => {
        document.getElementById("volunteer-benefits").classList.add("show");
    }, 200);
    
    document.getElementById("event-section").innerHTML = eventDropdownHTML;
}



function applyForSelectedVolunteer() {
    let eventId = document.getElementById("volunteer-events").value;
    if (!eventId) {
        alert("❌ Please select an event first!");
        return;
    }
    applyForVolunteer(eventId);
}

// Ensure script is loaded
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("applyVolunteerBtn").addEventListener("click", applyForSelectedVolunteer);
});



 // ✅ Apply for the selected event
async function applyForVolunteer(eventId) {
    try {
        console.log("🚀 Applying for event:", eventId);

        // Ensure user is logged in
        const userId = localStorage.getItem("userId");
        const authToken = localStorage.getItem("authToken");

        if (!userId || !authToken) {
            alert("⚠️ You must be logged in to apply!");
            return;
        }

        // API request
        const response = await fetch(`${window.BASE_URL}/api/volunteer/apply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            body: JSON.stringify({ eventId, userId }) // Include userId
        });

        const result = await response.json();
        console.log("🔹 Backend Response:", result);

        if (response.status === 403) {  // If already applied
            alert("⚠️ You have already applied for an event! You will be updated via email soon.");
            return;
        }

        if (!response.ok) {
            throw new Error(result.message || "❌ Failed to apply!");
        }

        alert("✅ Successfully applied as a volunteer!");

    } catch (error) {
        console.error("❌ Error applying as volunteer:", error);
        alert(`⚠️ Error: ${error.message}`);
    }
}


function renderEvents(events, allowRegister = false, isRegistered = false) {
    if (!events.length) return "<p>No events available.</p>";

    return events.map(event => `
        <div class="event-box">
            <h3>${event.title}</h3>
            <p>${new Date(event.date).toLocaleDateString()} | ${event.location}</p>
            ${allowRegister && !isRegistered 
                ? `<button class="register-button" onclick="registerEvent(${event.id})">Register</button>` 
                : `<button class="register-button registered" disabled>Registered</button>`}
        </div>
    `).join('');
}

// ✅ Ensure correct function runs on page load
window.onload = () => showUpcomingEvents();
  
// Fetch applied volunteer events
// ✅ Fetch applied volunteer events (requires authentication)
async function fetchAppliedVolunteerEvents() {
    try {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("⚠️ Your session has expired. Please log in again.");
            window.location.href = "home.html";
            return [];
        }

        console.log("🚀 Fetching applied volunteer events...");

        const response = await fetch("http://localhost:5000/api/volunteer/applied-events", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.status === 403) {
            alert("⚠️ Your session has expired. Please log in again.");
            localStorage.removeItem("authToken");
            window.location.href = "home.html";
            return [];
        }

        const text = await response.text();
        console.log("🔍 Raw Response Body:", text);

        try {
            const data = JSON.parse(text);
            console.log("📌 Applied Volunteer Events:", data);
            return data.data || [];
        } catch (error) {
            console.error("❌ Failed to parse JSON:", error);
            return [];
        }
    } catch (error) {
        console.error("❌ Network error fetching applied volunteer events:", error);
        return [];
    }
}

// ✅ Fetch all public volunteer events
async function fetchVolunteerEvents() {
    try {
        console.log("🚀 Fetching volunteer events...");

        const response = await fetch("http://localhost:5000/api/events"); // Corrected endpoint

        if (!response.ok) {
            console.error(`❌ Failed to fetch volunteer events (Status: ${response.status})`);
            return [];
        }

        const result = await response.json();
        console.log("📌 Available Volunteer Events:", result.data);
        return result.data || [];
    } catch (error) {
        console.error("❌ Network error fetching volunteer events:", error);
        return [];
    }
}

// ✅ Display volunteer applications
async function showVolunteerUpdates() {
    updateHeading("My Volunteer Applications");

    const eventSection = document.getElementById("event-section");
    eventSection.innerHTML = `<p class="loading">⏳ Loading volunteer applications...</p>`;

    try {
        // Fetch applied and approved events in parallel
        const [publicEvents, appliedEvents] = await Promise.all([
            fetchVolunteerEvents(),
            fetchAppliedVolunteerEvents()
        ]);

        if (appliedEvents.length === 0) {
            eventSection.innerHTML = `
                <p class="no-applications">🚀 You haven't applied for any volunteer opportunities yet. Explore events and apply now!</p>
            `;
            return;
        }

        // Generate table rows
        const rows = appliedEvents.map(event => `
            <tr>
                <td>${event.event_name || "N/A"}</td>
                <td>${event.applied_at ? new Date(event.applied_at).toLocaleDateString() : "N/A"}</td>
                <td class="${event.status === 'approved' ? 'approved' : 'applied'}">
                    ${event.status === 'approved' ? 'Approved' : 'Applied'}
                </td>
            </tr>
        `).join('');

        eventSection.innerHTML = `
            <div class="volunteer-container">
                <h3>My Volunteer Applications</h3>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Event Name</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>

                ${appliedEvents.some(e => e.status === 'approved') ? `
                    <p class="volunteer-login">
                        🎉 Congratulations! You have been selected as a volunteer. 
                         
                    </p>` : `
                    <p class="better-luck">
                        ❌ Unfortunately, you haven't been selected this time. Stay engaged and try again! ✨
                    </p>
                `}
            </div>
        `;

    } catch (error) {
        console.error("❌ Error displaying volunteer applications:", error);
        eventSection.innerHTML = `<p class="error">⚠️ Unable to load volunteer applications. Please try again later.</p>`;
    }
}

// ✅ Ensure event listeners only attach when elements exist
document.addEventListener("DOMContentLoaded", function () {
    const btn = document.getElementById("some-id");
    if (btn) {
        btn.addEventListener("click", () => console.log("✅ Button Clicked!"));
    } else {
        console.warn("⚠️ Element with ID 'some-id' not found. Ensure it's loaded in the HTML.");
    }

    showVolunteerUpdates(); // Auto-load applications
});

function openBotPage() {
    window.location.href = 'bot.html';
}

