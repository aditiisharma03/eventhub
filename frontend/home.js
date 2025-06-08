document.addEventListener("DOMContentLoaded", function () {
    showDefaultView(); // Ensure default view loads properly

    // Event listeners for navigation
    document.getElementById("homeLink")?.addEventListener("click", showHome);
    document.getElementById("loginLink")?.addEventListener("click", switchToLogin);
    document.getElementById("signupLink")?.addEventListener("click", switchToSignup);
    document.getElementById("switchToSignup")?.addEventListener("click", switchToSignup);
    document.getElementById("switchToLogin")?.addEventListener("click", switchToLogin);
    document.getElementById("AboutLink")?.addEventListener("click", switchToAbout);
    document.getElementById("volunteerLink")?.addEventListener("click", switchToVolunteer);

    // Event listeners for login & signup actions
    document.getElementById("loginBtn")?.addEventListener("click", loginUser);
    document.getElementById("signupBtn")?.addEventListener("click", signupUser);
});

// Function to toggle views correctly
function toggleForms(formToShow) {
    hideAll(); // Hide everything first

    if (formToShow === "login") {
        document.getElementById("loginForm").style.display = "block";
    } else if (formToShow === "signup") {
        document.getElementById("signupForm").style.display = "block";
    } else if (formToShow === "about") {
        document.querySelector(".aboutsection").style.display = "block";
    } else if (formToShow === "volunteer") {
        document.querySelector(".volunteersection").style.display = "block";
    } else if (formToShow === "home") {
        showHome(); // Call showHome to reset default view
    }
}

// Function to show the default home view (Images, About, Volunteer, Announcement)
function showDefaultView() {
    document.querySelector(".slideshow-container").style.display = "block"; // Show images
    document.querySelectorAll(".slideshow img").forEach(img => img.style.display = "block");
    document.querySelector(".aboutsection").style.display = "block";
    document.querySelector(".volunteersection").style.display = "block";
    document.querySelector(".scrolling-banner").style.display = "block"; // Show announcement
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "none";
}

// Function to show Home (restore default view)
function showHome(event) {
    event?.preventDefault();
    showDefaultView(); // Reset everything back to default home view
}

// Function to switch to Login Form
function switchToLogin(event) {
    event.preventDefault();
    toggleForms("login");
}

// Function to switch to Signup Form
function switchToSignup(event) {
    event.preventDefault();
    toggleForms("signup");
}

// Function to switch to About Section
function switchToAbout(event) {
    event.preventDefault();
    toggleForms("about");
}

// Function to switch to Volunteer Section
function switchToVolunteer(event) {
    event.preventDefault();
    toggleForms("volunteer");
}

// Function to hide everything (so only one section is visible at a time)
function hideAll() {
    document.querySelector(".slideshow-container").style.display = "none"; // Hide images
    document.querySelectorAll(".slideshow img").forEach(img => img.style.display = "none");
    document.querySelector(".aboutsection").style.display = "none";
    document.querySelector(".volunteersection").style.display = "none";
    document.querySelector(".scrolling-banner").style.display = "none"; // Hide announcement
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("signupForm").style.display = "none";
}



 // Login functionality
 async function loginUser() {
    const bvroll = document.getElementById("loginRoll")?.value.trim();
    const password = document.getElementById("loginPassword")?.value.trim();
    const role = document.getElementById("loginRole")?.value;

    if (!bvroll || !password || !role) {
        alert("⚠️ All fields are required!");
        return;
    }

    try {
        const response = await fetch(`${window.BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bvroll, password, role })
        });

        const result = await response.json();
        console.log("🔹 Backend Response:", result);  // ✅ Debugging log

        if (response.ok) {
            alert("✅ Login successful!");

            if (result.token) {
                localStorage.setItem("authToken", result.token);

                // ✅ Ensure correct userId storage
                const userId = result.userId || result.user?.id;
                if (userId) {
                    localStorage.setItem("userId", userId);
                    sessionStorage.setItem("userId", userId);
                    console.log("✅ Stored userId:", userId);
                } else {
                    console.error("❌ No userId received in response!");
                    alert("⚠️ Login successful, but user ID is missing!");
                    return;
                }
            } else {
                alert("❌ No token received. Login failed.");
                return;
            }

            // ✅ Redirect based on role
            const roleRedirects = {
                student: "student.html",
                volunteer: "volunteer.html",
                admin: "admin.html"
            };

            window.location.href = roleRedirects[role] || "home.html";
        } else {
            alert(result.error || "❌ Login failed!");
        }
    } catch (error) {
        console.error("❌ Login error:", error);
        alert("⚠️ Something went wrong! Please try again.");
    }
}

// Signup functionality
async function signupUser() {
    const name = document.getElementById("signupName")?.value.trim();
    const email = document.getElementById("signupEmail")?.value.trim();
    const bvroll = document.getElementById("signupRoll")?.value.trim();
    const studentClass = document.getElementById("signupClass")?.value.trim();
    const course = document.getElementById("signupCourse")?.value.trim();
    const password = document.getElementById("signupPassword")?.value.trim();
    const role = document.getElementById("signupRole")?.value;  // ✅ Ensure role is captured

    if (!name || !email || !bvroll || !password || !studentClass || !course || !role) {
        alert("⚠️ All fields are required!");
        return;
    }

    try {
        const response = await fetch(`${window.BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                bvroll, 
                name, 
                class: studentClass,
                course, 
                email, 
                password,
                role  // ✅ Send role
            })
        });

        const result = await response.json();
        if (response.ok) {
            alert("✅ Signup successful! Please log in.");
            toggleForms("login");
        } else {
            alert(result.error || "❌ Signup failed!");
        }
    } catch (error) {
        console.error("❌ Signup error:", error);
    }
}
document.addEventListener("DOMContentLoaded", function () {
    let slides = document.querySelectorAll(".slideshow");
    let currentIndex = 0;

    function showNextSlide() {
        slides[currentIndex].style.opacity = 0; // Hide current slide
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].style.opacity = 1; // Show next slide
    }

    setInterval(showNextSlide, 3000); // Change image every 3 seconds
});


console.log("🔹 BASE_URL:", window.BASE_URL);
