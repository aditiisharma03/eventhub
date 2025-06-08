document.addEventListener("DOMContentLoaded", () => {
    const eventInput = document.getElementById("event-input");
    const eventDate = document.getElementById("event-date");
    const eventTime = document.getElementById("event-time");
    const eventVenue = document.getElementById("event-venue");
    const addEventBtn = document.getElementById("add-event-btn");
    const eventList = document.getElementById("event-list");
    const logoutBtn = document.getElementById("logout-btn");

    const BASE_URL = "http://localhost:5000/api"; // Ensure correct API base URL

    console.log("🚀 Fetching events from:", `${BASE_URL}/events`); // Debugging log
    fetchEvents(); // Fetch events on page load

    if (addEventBtn) {
        addEventBtn.addEventListener("click", () => addEvent(eventInput, eventDate, eventTime, eventVenue));
    }

    if (eventList) {
        eventList.addEventListener("click", (e) => {
            if (e.target.classList.contains("delete-btn")) {
                const eventId = e.target.closest("li").getAttribute("data-id");
                deleteEvent(eventId);
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    } else {
        console.error("❌ Logout button NOT found!");
    }
});

// ✅ Fetch Events & Populate UI
const fetchEvents = async () => {
    try {
        const response = await fetch("http://localhost:5000/api/events");
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const events = await response.json();
        console.log("✅ Fetched events:", events);

        document.getElementById("event-list").innerHTML = "";
        events.forEach(event => {
            addEventToUI(event.id, event.title, event.date, event.time, event.location);
        });
    } catch (error) {
        console.error("❌ Error fetching events:", error);
         
    }
};

// ✅ Add Event to UI
function addEventToUI(id, name, date, time, venue) {
    const eventItem = document.createElement("li");
    eventItem.setAttribute("data-id", id);
    eventItem.innerHTML = `
        <span class="event-name">${name}</span>
        <div class="event-details">
            <div class="event-date"><strong>Date:</strong> ${date}</div>
            
        </div>
        <span class="event-venue"><strong>Venue:</strong> ${venue}</span>
        <button class="delete-btn">Delete</button>
    `;
    document.getElementById("event-list").prepend(eventItem);
}

 
 // ✅ Add Event Function
 document.getElementById("add-event-btn").addEventListener("click", async function () {
    const title = document.getElementById("event-input").value.trim();
    const date = document.getElementById("event-date").value;
    const time = document.getElementById("event-time").value;
    const location = document.getElementById("event-venue").value.trim();
    const max_seats = 100; // Set a default or ask user input

    if (!title || !date || !time || !location) {
        alert("❌ Please fill in all fields.");
        return;
    }

    const fullDateTime = `${date} ${time}`; // Combine date and time

    const eventData = { 
        title, 
        description: "Event description", // Temporary placeholder
        date: fullDateTime, // Send combined date & time
        location, 
        max_seats 
    };

    console.log("📤 Sending event data:", eventData); // Debugging

    try {
        const response = await fetch("http://localhost:5000/api/admin/add-event", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // ✅ Success
            window.location.reload();
        } else {
            alert(`❌ Error: ${result.message}`);
        }
    } catch (error) {
        console.error("❌ Error adding event:", error);
        alert("❌ Failed to add event. Please try again.");
    }
});

  
async function deleteEvent(eventId) {
    console.log("🛠️ Attempting to delete event with ID:", eventId);

    if (!confirm(`⚠️ Are you sure you want to delete event ID: ${eventId}? This action cannot be undone.`)) {
        console.log("🚫 Deletion canceled by user.");
        return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("⚠️ Session expired! Please log in again.");
        localStorage.clear();
        window.location.href = "home.html";
        return;
    }

    // ✅ Ensure API URL matches backend route
    const apiUrl = `${BASE_URL}/api/admin/delete-event/${eventId}`; 
    console.log("🔗 API URL:", apiUrl);
    console.log("🔍 Sending token:", token);

    try {
        const response = await fetch(apiUrl, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        console.log("✅ DELETE API Response Status:", response.status);

        const rawResponse = await response.text();
        console.log("🔴 RAW DELETE API Response:", rawResponse);

        let result;
        try {
            result = JSON.parse(rawResponse);
        } catch (jsonError) {
            console.error("❌ JSON Parse Error:", jsonError);
            alert("❌ Unexpected response format. Please check the console for details.");
            return;
        }

        console.log("✅ Parsed Response:", result);

        if (response.status === 401) {
            alert("⚠️ Unauthorized! Please log in again.");
            localStorage.clear();
            window.location.href = "home.html";
        } else if (response.status === 404) {
            alert("⚠️ Event not found.");
        } else if (response.ok) {
            alert("✅ Event deleted successfully!");

            // ✅ Remove event from the UI
            const eventElement = document.querySelector(`li[data-id="${eventId}"]`);
            if (eventElement) {
                eventElement.remove();
            } else {
                console.warn("⚠️ Event not found in DOM.");
            }
        } else {
            alert(result.message || "❌ Failed to delete event.");
        }
    } catch (error) {
        console.error("❌ Delete request error:", error);
        alert("❌ Network or server error. Please try again later.");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    fetchAppliedVolunteers();
});

async function approveVolunteer(volunteerId) {
    try {
        const response = await fetch(`http://localhost:5000/api/admin/volunteers/approve/${volunteerId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();
        alert(data.message); // Show success or error message
        fetchAppliedVolunteers(); // Refresh the list
    } catch (error) {
        console.error("Error approving volunteer:", error);
    }
}


async function fetchVolunteerTasks() {
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
        alert("⚠️ Please log in first!");
        return;
    }

    const volunteerId = localStorage.getItem("volunteerId");
    if (!volunteerId) {
        
        return;
    }

    // Ensure the element exists before setting `innerHTML`
    const taskSection = document.getElementById("task-section");
    if (!taskSection) {
        console.error("❌ Error: Element #task-section not found in DOM.");
        alert("⚠️ Error: Task section not found. Please check your HTML.");
        return;
    }

    try {
        const response = await fetch(`${window.BASE_URL}/api/tasks/${volunteerId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);

        const tasks = await response.json();
        console.log("🔹 Debug: Tasks =", tasks);

        let tableHTML = `
            <div class="tasks-container">
                <h3>My Assigned Tasks</h3>
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Task Name</th>
                                <th>Deadline</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tasks.map(task => `
                                <tr>
                                    <td>${task.task_name || "No Name"}</td>
                                    <td>${task.deadline ? new Date(task.deadline).toLocaleDateString() : "N/A"}</td>
                                    <td class="${task.status || "unknown"}">
                                        ${task.status ? task.status.charAt(0).toUpperCase() + task.status.slice(1) : "N/A"}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        taskSection.innerHTML = tableHTML; // ✅ Update only if task-section exists

    } catch (error) {
        console.error("❌ Error fetching tasks:", error);
        alert(`⚠️ Error: ${error.message}`);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    fetchVolunteerTasks();  // ✅ Runs only after HTML is fully loaded
});

 
// ✅ Attach function to a button
document.addEventListener("DOMContentLoaded", () => {
    const taskBtn = document.getElementById("fetch-tasks-btn");
    if (taskBtn) {
        taskBtn.addEventListener("click", fetchVolunteerTasks);
    } else {
        console.error("❌ Error: fetch-tasks-btn not found in DOM");
    }
});
 
 
function logout() {
    if (confirm("⚠️ Are you sure you want to log out?")) {
        localStorage.removeItem("volunteerId");  
        alert("✅ Logged out successfully!");
        window.location.href = "home.html"; 
    } else {
        console.log("🚫 Logout canceled by user.");
    }
}
