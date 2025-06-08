const BASE_URL = "http://localhost:5000";       // ✅ Base URL for general API requests
const BASE_URLL = "http://localhost:5000/api"; // ✅ Base URL for specific API endpoints

async function fetchData(endpoint, options = {}) {
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("❌ API Fetch Error:", error);
        return null; // ✅ Prevents code from breaking due to failed API calls
    }
}

// Make functions accessible globally
window.BASE_URL = BASE_URL;
window.BASE_URLL = BASE_URLL;
window.fetchData = fetchData;
