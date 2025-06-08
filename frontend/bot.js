document.addEventListener('DOMContentLoaded', function() {
    const chatbotIcon = document.getElementById('chatbotIcon');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const closeChatbot = document.getElementById('closeChatbot');
    const userInput = document.getElementById('userInput');
    const sendMessage = document.getElementById('sendMessage');
    const chatbotMessages = document.getElementById('chatbotMessages');
    const iconText = document.querySelector('.icon-text');
    
    // Store conversation context
    let conversationContext = {
        lastTopic: null,
        userName: null,
        askedAboutEvents: false,
        consecutiveUnknown: 0
    };
    
    // Show/hide chatbot text after 3 seconds
    setTimeout(() => {
        iconText.style.opacity = '1';
    }, 1000);
    
    setTimeout(() => {
        iconText.style.opacity = '0';
    }, 4000);
    
    // Open chatbot when icon is clicked
    chatbotIcon.addEventListener('click', function() {
        chatbotContainer.style.display = 'flex';
        chatbotIcon.style.display = 'none';
    });
    
    // Close chatbot when close button is clicked
    closeChatbot.addEventListener('click', function() {
        chatbotContainer.style.display = 'none';
        chatbotIcon.style.display = 'flex';
    });
    
    // Send message function
    function sendUserMessage() {
        const message = userInput.value.trim();
        if (message !== '') {
            // Add user message to chat
            addMessage(message, 'user');
            userInput.value = '';
            
            // Simulate thinking with typing indicator
            addTypingIndicator();
            
            // Process message and get bot response
            setTimeout(() => {
                removeTypingIndicator();
                processBotResponse(message);
            }, 1000);
        }
    }
    
    // Send message when send button is clicked
    sendMessage.addEventListener('click', sendUserMessage);
    
    // Send message when Enter key is pressed
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            sendUserMessage();
        }
    });
    
    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender + '-message');
        
        // If it's a bot message, handle HTML content
        if (sender === 'bot') {
            messageDiv.innerHTML = text;
        } else {
            messageDiv.textContent = text;
        }
        
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Add suggestion buttons
    function addSuggestionButtons(suggestions) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.classList.add('suggestion-buttons');
        
        suggestions.forEach(suggestion => {
            const button = document.createElement('button');
            button.classList.add('suggestion-btn');
            button.textContent = suggestion;
            button.addEventListener('click', function() {
                // Add user message with the suggestion text
                addMessage(suggestion, 'user');
                // Process the suggestion as a user message
                addTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    processBotResponse(suggestion);
                }, 800);
            });
            suggestionsDiv.appendChild(button);
        });
        
        chatbotMessages.appendChild(suggestionsDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Add typing indicator
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
        typingDiv.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
        typingDiv.id = 'typingIndicator';
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }
    
    // Remove typing indicator
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Simple fuzzy matching function to handle typos
    function fuzzyMatch(text, pattern) {
        text = text.toLowerCase();
        pattern = pattern.toLowerCase();
        
        // Direct match check
        if (text.includes(pattern)) return true;
        
        // Allow one-letter typos for short words
        if (pattern.length <= 4) {
            for (let i = 0; i < pattern.length; i++) {
                const typo = pattern.substring(0, i) + pattern.substring(i + 1);
                if (text.includes(typo)) return true;
            }
        }
        
        // Allow more typos for longer words
        if (pattern.length > 4) {
            // Check for pattern with one letter replaced
            const words = text.split(/\s+/);
            for (const word of words) {
                if (Math.abs(word.length - pattern.length) <= 2) { // Similar length
                    let differences = 0;
                    for (let i = 0; i < Math.min(word.length, pattern.length); i++) {
                        if (word[i] !== pattern[i]) differences++;
                    }
                    // Add difference in length
                    differences += Math.abs(word.length - pattern.length);
                    
                    // Allow more typos in longer words
                    const allowedDifferences = Math.max(1, Math.floor(pattern.length / 3));
                    if (differences <= allowedDifferences) return true;
                }
            }
        }
        
        return false;
    }
    
    // Check if message matches any event name (with fuzzy matching)
    function matchEventName(message, events) {
        message = message.toLowerCase();
        for (const event of events) {
            const name = event.name.toLowerCase();
            
            // Direct match
            if (message.includes(name)) return event;
            
            // For longer event names, check parts
            if (name.length > 5) {
                const words = name.split(/\s+/);
                for (const word of words) {
                    if (word.length > 3 && fuzzyMatch(message, word)) {
                        return event;
                    }
                }
            }
            
            // Fuzzy match for the whole name if not too long
            if (name.length < 15 && fuzzyMatch(message, name)) {
                return event;
            }
        }
        return null;
    }
    
    // Detect user's intent from message
    function detectIntent(message, events) {
        const msg = message.toLowerCase();
        
        // Greeting patterns
        if (/\b(hi|hello|hey|howdy|hola|sup|yo)\b/i.test(msg) || msg === 'hi' || msg === 'hello') {
            return { intent: 'greeting' };
        }
        
        // Handle informal language and slang
        if (/\b(wtf|wth|bro|bruh|bhai|yaar|yar|bhaiu)\b/i.test(msg)) {
            return { intent: 'informal_greeting' };
        }
        
        // Events listing patterns
        if (fuzzyMatch(msg, 'what events') || 
            fuzzyMatch(msg, 'events going') || 
            fuzzyMatch(msg, 'list of events') || 
            fuzzyMatch(msg, 'show me events') ||
            fuzzyMatch(msg, 'tell me events') ||
            /\bevents\b.*\?/.test(msg) ||
            /\bshows?\b/.test(msg)) {
            return { intent: 'list_events' };
        }
        
        // Upcoming events patterns
        if (fuzzyMatch(msg, 'upcoming') || 
            fuzzyMatch(msg, 'future') || 
            fuzzyMatch(msg, 'next') ||
            fuzzyMatch(msg, 'soon') ||
            fuzzyMatch(msg, 'coming')) {
            return { intent: 'upcoming_events' };
        }
        
        // Date patterns
        if (fuzzyMatch(msg, 'date') || 
            fuzzyMatch(msg, 'when') || 
            fuzzyMatch(msg, 'time') || 
            fuzzyMatch(msg, 'schedule') ||
            fuzzyMatch(msg, 'timing')) {
            // Check if asking about specific event
            const event = matchEventName(msg, events);
            if (event) {
                return { intent: 'event_date', event };
            }
            return { intent: 'all_dates' };
        }
        
        // Registration deadline patterns
        if (fuzzyMatch(msg, 'deadline') || 
            fuzzyMatch(msg, 'last date') || 
            fuzzyMatch(msg, 'registration') ||
            fuzzyMatch(msg, 'sign up') ||
            fuzzyMatch(msg, 'apply') ||
            fuzzyMatch(msg, 'enroll')) {
            // Check if asking about specific event
            const event = matchEventName(msg, events);
            if (event) {
                return { intent: 'event_deadline', event };
            }
            return { intent: 'all_deadlines' };
        }
        
        // How to register patterns
        if ((fuzzyMatch(msg, 'how') && fuzzyMatch(msg, 'register')) || 
            fuzzyMatch(msg, 'registration process') ||
            fuzzyMatch(msg, 'sign up') ||
            fuzzyMatch(msg, 'join event') ||
            fuzzyMatch(msg, 'participate')) {
            // Check if asking about specific event
            const event = matchEventName(msg, events);
            if (event) {
                return { intent: 'register_for_event', event };
            }
            return { intent: 'how_to_register' };
        }
        
        // Ask about specific event patterns
        if (fuzzyMatch(msg, 'tell me about') || 
            fuzzyMatch(msg, 'what is') || 
            fuzzyMatch(msg, 'details') ||
            fuzzyMatch(msg, 'info') ||
            fuzzyMatch(msg, 'know more')) {
            const event = matchEventName(msg, events);
            if (event) {
                return { intent: 'event_details', event };
            }
        }
        
        // Direct event name mentioned
        const event = matchEventName(msg, events);
        if (event) {
            return { intent: 'event_details', event };
        }
        
        // Venue patterns
        if (fuzzyMatch(msg, 'venue') || 
            fuzzyMatch(msg, 'where') || 
            fuzzyMatch(msg, 'location') ||
            fuzzyMatch(msg, 'place')) {
            // Check if asking about specific event
            const event = matchEventName(msg, events);
            if (event) {
                return { intent: 'event_venue', event };
            }
            return { intent: 'all_venues' };
        }
        
        // Contact or help patterns
        if (fuzzyMatch(msg, 'contact') || 
            fuzzyMatch(msg, 'support') || 
            fuzzyMatch(msg, 'help') ||
            fuzzyMatch(msg, 'call') ||
            fuzzyMatch(msg, 'email') ||
            fuzzyMatch(msg, 'reach')) {
            return { intent: 'contact' };
        }
        
        // Thanks patterns
        if (fuzzyMatch(msg, 'thanks') || 
            fuzzyMatch(msg, 'thank you') || 
            fuzzyMatch(msg, 'thx') ||
            fuzzyMatch(msg, 'ty')) {
            return { intent: 'thanks' };
        }
        
        // No specific intent detected
        return { intent: 'unknown' };
    }
    
    // Process bot response based on user input
    function processBotResponse(userMessage) {
        const userMessageLower = userMessage.toLowerCase();
        let botResponse = '';
        let suggestions = [];
        
        // Event data from the provided information
        const events = [
            {
                name: "Algobyte",
                date: "March 26, 2025",
                venue: "Apaji",
                registrationDeadline: "March 19, 2025",
                description: "A coding competition for algorithm enthusiasts"
            },
            {
                name: "Dolelle treasure hunt: mayuk",
                date: "April 25, 2025",
                venue: "APAJI",
                registrationDeadline: "April 18, 2025",
                description: "An exciting treasure hunt challenge"
            },
            {
                name: "D 2n.0",
                date: "March 29, 2025",
                venue: "Wisdom Ground",
                registrationDeadline: "March 22, 2025",
                description: "Design and innovation showcase"
            },
            {
                name: "MSC BV Workshop",
                date: "March 19, 2025",
                venue: "Nav Mandir",
                registrationDeadline: "March 12, 2025",
                description: "Professional development workshop"
            },
            {
                name: "Codathon",
                date: "March 17, 2025",
                venue: "URJA MANDIR",
                registrationDeadline: "March 10, 2025",
                description: "24-hour coding marathon"
            },
            {
                name: "Fest 2025",
                date: "March 9, 2025",
                venue: "Nav Mandir",
                registrationDeadline: "March 2, 2025",
                description: "Annual college festival"
            },
            {
                name: "Aayam",
                date: "March 9, 2025",
                venue: "Apaji",
                registrationDeadline: "March 2, 2025",
                description: "Cultural extravaganza"
            },
            {
                name: "Tech Fest",
                date: "March 9, 2025",
                venue: "Main Hall/Auditorium",
                registrationDeadline: "March 2, 2025",
                description: "Technology showcase and competitions"
            },
            {
                name: "Mayukh",
                date: "March 19, 2025",
                venue: "Apaji",
                registrationDeadline: "March 12, 2025",
                description: "Literary and creative arts festival"
            },
            {
                name: "Hackathon",
                date: "March 14, 2025",
                venue: "Auditorium",
                registrationDeadline: "March 7, 2025",
                description: "Innovation challenge for developers"
            }
        ];
        
        // Get today's date for comparing events
        const today = new Date();
        
        // Filter upcoming events
        const upcomingEvents = events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= today;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Detect intent
        const intentResult = detectIntent(userMessage, events);
        const intent = intentResult.intent;
        console.log("Detected intent:", intent);
        
        switch(intent) {
            case 'greeting':
                botResponse = "👋 Hello there! I'm your Event Assistant. I can help you with:<br><br>";
                botResponse += "• Information about upcoming events<br>";
                botResponse += "• Event dates and venues<br>";
                botResponse += "• Registration details<br>";
                botResponse += "• And more!<br><br>";
                botResponse += "What would you like to know about today?";
                
                suggestions = ["What events are going on?", "How to register?", "Upcoming events"];
                conversationContext.lastTopic = "greeting";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'informal_greeting':
                botResponse = "Hey there! 👋 What's up? Need info on our events?<br><br>";
                botResponse += "• Check out ongoing events<br>";
                botResponse += "• Get registration info<br>";
                botResponse += "• Find event locations<br><br>";
                botResponse += "Just let me know what you need!";
                
                suggestions = ["Show me events", "How to register", "Upcoming events"];
                conversationContext.lastTopic = "greeting";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'list_events':
                botResponse = "📅 <strong>Here are all our planned events:</strong><br><br>";
                events.forEach(event => {
                    botResponse += `• <strong>${event.name}</strong>: ${event.date} at ${event.venue}<br>`;
                });
                botResponse += "<br>Would you like to know more details about any specific event?";
                
                suggestions = ["Upcoming events", "Registration deadlines", "How to register?"];
                conversationContext.lastTopic = "all_events";
                conversationContext.askedAboutEvents = true;
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'upcoming_events':
                if (upcomingEvents.length > 0) {
                    botResponse = "🗓️ <strong>Here are our upcoming events:</strong><br><br>";
                    upcomingEvents.forEach(event => {
                        botResponse += `• <strong>${event.name}</strong>: ${event.date} at ${event.venue}<br>`;
                    });
                    botResponse += "<br>Which event interests you the most?";
                } else {
                    botResponse = "I don't see any upcoming events scheduled at the moment. Please check back soon!";
                }
                
                if (upcomingEvents.length > 0) {
                    suggestions = ["Registration deadlines", `Tell me about ${upcomingEvents[0].name}`, "How to register?"];
                } else {
                    suggestions = ["Past events", "How to register?", "Contact support"];
                }
                
                conversationContext.lastTopic = "upcoming";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'event_date':
                botResponse = `📆 <strong>${intentResult.event.name}</strong> is scheduled for <strong>${intentResult.event.date}</strong> at ${intentResult.event.venue}.`;
                suggestions = ["Registration deadline?", `How to register for ${intentResult.event.name}?`, "Other events"];
                conversationContext.lastTopic = "specific_event";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'all_dates':
                botResponse = "📆 <strong>Here are the dates for all events:</strong><br><br>";
                events.forEach(event => {
                    botResponse += `• <strong>${event.name}</strong>: ${event.date} at ${event.venue}<br>`;
                });
                
                suggestions = ["Upcoming events", "Registration deadlines", "How to register?"];
                conversationContext.lastTopic = "dates";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'event_deadline':
                botResponse = `⏰ Registration deadline for <strong>${intentResult.event.name}</strong> is <strong>${intentResult.event.registrationDeadline}</strong>.`;
                suggestions = [`How to register for ${intentResult.event.name}?`, `When is ${intentResult.event.name}?`, "Other events"];
                conversationContext.lastTopic = "specific_deadline";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'all_deadlines':
                botResponse = "⏰ <strong>Registration deadlines for upcoming events:</strong><br><br>";
                upcomingEvents.forEach(event => {
                    botResponse += `• <strong>${event.name}</strong>: ${event.registrationDeadline}<br>`;
                });
                botResponse += '<br><em>Note: Registration typically closes one week before the event date. Register early to secure your spot!</em>';
                
                suggestions = ["How to register?", "Upcoming events", "Event venues"];
                conversationContext.lastTopic = "deadlines";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'how_to_register':
                botResponse = "📝 <strong>Registration Process:</strong><br><br>";
                botResponse += "1️⃣ Go to the \"Events\" page<br>";
                botResponse += "2️⃣ Select the event you want to attend<br>";
                botResponse += "3️⃣ Click the \"Register\" button<br>";
                botResponse += "4️⃣ Fill out the registration form<br>";
                botResponse += "5️⃣ Submit your registration<br>";
                botResponse += "6️⃣ You'll receive a confirmation email<br><br>";
                botResponse += "Would you like to see the upcoming events you can register for?";
                
                suggestions = ["Upcoming events", "Registration deadlines", "Event venues"];
                conversationContext.lastTopic = "registration";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'register_for_event':
                botResponse = `📝 <strong>To register for ${intentResult.event.name}:</strong><br><br>`;
                botResponse += "1️⃣ Go to the \"Events\" page<br>";
                botResponse += `2️⃣ Find ${intentResult.event.name} in the list<br>`;
                botResponse += "3️⃣ Click the \"Register\" button<br>";
                botResponse += "4️⃣ Fill out the registration form<br>";
                botResponse += "5️⃣ Submit your registration<br>";
                botResponse += "6️⃣ You'll receive a confirmation email<br><br>";
                botResponse += `Remember, the registration deadline is ${intentResult.event.registrationDeadline}!`;
                
                suggestions = ["Registration deadline", `When is ${intentResult.event.name}?`, "Other events"];
                conversationContext.lastTopic = "specific_registration";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'event_details':
                botResponse = `<strong>${intentResult.event.name}</strong><br><br>`;
                botResponse += `📅 <strong>Date:</strong> ${intentResult.event.date}<br>`;
                botResponse += `📍 <strong>Venue:</strong> ${intentResult.event.venue}<br>`;
                botResponse += `🕒 <strong>Registration Deadline:</strong> ${intentResult.event.registrationDeadline}<br>`;
                botResponse += `📋 <strong>Description:</strong> ${intentResult.event.description}<br><br>`;
                botResponse += "Would you like to know how to register for this event?";
                
                suggestions = ["How to register?", `Registration deadline for ${intentResult.event.name}?`, "Other events"];
                conversationContext.lastTopic = "event_details";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'event_venue':
                botResponse = `📍 <strong>${intentResult.event.name}</strong> will be held at <strong>${intentResult.event.venue}</strong>.`;
                suggestions = [`When is ${intentResult.event.name}?`, "How to register?", "Other venues"];
                conversationContext.lastTopic = "specific_venue";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'all_venues':
                botResponse = "📍 <strong>Event Venues:</strong><br><br>";
                // Get unique venues
                const venues = [...new Set(events.map(event => event.venue))];
                venues.forEach(venue => {
                    const venueEvents = events.filter(event => event.venue === venue);
                    botResponse += `• <strong>${venue}</strong>: ${venueEvents.map(e => e.name).join(', ')}<br>`;
                });
                
                suggestions = ["Upcoming events", "How to register?", "Event dates"];
                conversationContext.lastTopic = "venues";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'contact':
                botResponse = "📞 <strong>Need help?</strong><br><br>";
                botResponse += "• <strong>Email:</strong> events@organization.com<br>";
                botResponse += "• <strong>Phone:</strong> +91 98765 43210<br>";
                botResponse += "• <strong>Instagram:</strong> @event_management<br><br>";
                botResponse += "Our team is available Monday-Friday, 9 AM to 6 PM.";
                
                suggestions = ["Upcoming events", "How to register?", "Thanks"];
                conversationContext.lastTopic = "contact";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'thanks':
                botResponse = "You're welcome! 😊 Glad I could help. Is there anything else you'd like to know about our events?";
                
                suggestions = ["Upcoming events", "How to register?", "No thanks"];
                conversationContext.lastTopic = "thanks";
                conversationContext.consecutiveUnknown = 0;
                break;
                
            case 'unknown':
            default:
                conversationContext.consecutiveUnknown++;
                
                if (conversationContext.consecutiveUnknown >= 2) {
                    botResponse = "I'm sorry, I'm having trouble understanding. Let me suggest some topics you can ask about:<br><br>";
                    botResponse += "• Our upcoming events<br>";
                    botResponse += "• How to register for events<br>";
                    botResponse += "• Event venues and dates<br>";
                    botResponse += "• Registration deadlines<br><br>";
                    botResponse += "Or you can select one of the options below:";
                    
                    suggestions = ["What events are going on?", "How to register?", "Contact support"];
                    conversationContext.consecutiveUnknown = 0;
                } else {
                    // Try to make an educated guess based on the message
                    if (userMessage.length < 5) {
                        botResponse = "Could you please provide more details about what you're looking for? Or you can ask about our events, registration process, or schedules.";
                    } else if (userMessageLower.includes('event') || userMessageLower.includes('show')) {
                        botResponse = "Looking for events? Here are our upcoming events:<br><br>";
                        upcomingEvents.forEach(event => {
                            botResponse += `• <strong>${event.name}</strong>: ${event.date} at ${event.venue}<br>`;
                        });
                    } else {
                        // Try to find a partial match to any event name
                        let closestEvent = null;
                        let bestScore = 0;
                        
                        for (const event of events) {
                            const words = userMessageLower.split(/\s+/);
                            for (const word of words) {
                                if (word.length > 3) { // Ignore short words
                                    const nameWords = event.name.toLowerCase().split(/\s+/);
                                    for (const nameWord of nameWords) {
                                        if (nameWord.length > 3) { // Ignore short words
                                            // Calculate similarity score (very simple)
                                            let score = 0;
                                            for (let i = 0; i < Math.min(word.length, nameWord.length); i++) {
                                                if (word[i] === nameWord[i]) score++;
                                            }
                                            
                                            if (score > bestScore && score >= 2) {
                                                bestScore = score;
                                                closestEvent = event;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        
                        if (closestEvent) {
                            botResponse = `I think you might be asking about <strong>${closestEvent.name}</strong>.<br><br>`;
                            botResponse += `📅 <strong>Date:</strong> ${closestEvent.date}<br>`;
                            botResponse += `📍 <strong>Venue:</strong> ${closestEvent.venue}<br>`;
                            botResponse += `🕒 <strong>Registration Deadline:</strong> ${closestEvent.registrationDeadline}<br><br>`;
                            botResponse += "Is this what you were looking for?";
                            suggestions = ["Yes, thanks", "No, show all events", "How to register"];
                        } else {
                            botResponse = "I'm not sure what you're asking. You can try asking about:<br><br>";
                            botResponse += "• What events are happening<br>";
                            botResponse += "• Event dates and venues<br>";
                            botResponse += "• How to register for an event<br>";
                            botResponse += "• Registration deadlines";
                            
                            suggestions = ["Show all events", "Upcoming events", "How to register?"];
                        }
                    }
                }
                break;
        }
        
        // Add the bot response to the chat
        addMessage(botResponse, 'bot');
        
        // Add suggestion buttons if there are any
        if (suggestions.length > 0) {
            addSuggestionButtons(suggestions);
        }
    }
});