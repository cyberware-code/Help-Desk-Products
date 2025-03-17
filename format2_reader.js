function fetchSheetData() {
    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0';
    const SHEET_NAME = 'Pay As You Go'; // Ensure this matches the correct worksheet name
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    // Properly encode the sheet name for the URL
    const SHEET_NAME_ENCODED = encodeURIComponent(SHEET_NAME);

    // Fetch only columns A and B to keep structure correct
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME_ENCODED}!A:B?key=${API_KEY}`;

    console.log("Fetching data from:", url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Raw Data from Google Sheets:", data); // Debugging API response
            
            if (data && data.values) {
                renderContent(data.values);
            } else {
                console.error('Error: No formatted values found.');
                document.getElementById('content').innerHTML = '<p style="color:red;">Error: Unable to load formatted content. See console for details.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('content').innerHTML = `<p style="color:red;">Error fetching data: ${error}</p>`;
        });
}

function renderContent(data) {
    const contentDiv = document.getElementById('content');
    let html = '';
    let currentSection = ''; // Track current section for grouping bullets

    console.log("Processed Data for Rendering:", data); // Debugging log

    if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
            const row = data[i] || []; // Ensure row exists
            const field = row[0] ? applyFormatting(row[0].trim()) : currentSection; // Use last section title if empty
            const value = row[1] ? applyFormatting(row[1].trim()) : ""; // Ensure no empty values

            // **Handle Section Titles**
            if (row[0] && row[0].trim() !== "") {
                // Close previous list if we started a new section
                if (currentSection !== "") {
                    html += '</ul>';
                }
                html += `<h2>${field}</h2><ul>`;
                currentSection = field; // Update current section
            }

            // **Handle Bullet Points (Values)**
            if (value !== "") {
                html += `<li>${value}</li>`;
            }
        }
        html += '</ul>'; // Close last bullet list
    } else {
        html += '<p>No data found in the Google Sheet.</p>';
    }

    contentDiv.innerHTML = html;
}

function applyFormatting(text) {
    if (!text) return ""; // Ensure valid text exists

    let formattedText = text;

    // Apply bold
    if (text.includes("**")) {
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    // Apply italic
    if (text.includes("_")) {
        formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    }

    // Apply underline
    if (text.includes("__")) {
        formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
    }

    return formattedText;
}

// Call the function to fetch and render data
fetchSheetData();
