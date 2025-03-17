function fetchSheetData() {
    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0';
    const SHEET_TAB_ID = 1238020069; // Correct `gid` for the right sheet
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    // Fetch by `gid` (Google Sheets tab ID)
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=${SHEET_TAB_ID}`;

    console.log("Fetching data from:", url);

    fetch(url)
        .then(response => response.text()) // Google Sheets API returns JSONP
        .then(text => {
            const json = JSON.parse(text.substring(47, text.length - 2)); // Strip JSONP wrapper
            console.log("Raw Data from Google Sheets:", json); // Debugging API response

            if (json.table && json.table.rows) {
                renderContent(json.table.rows);
            } else {
                console.error('Error: No data found in the specified sheet.');
                document.getElementById('content').innerHTML = '<p style="color:red;">Error: Unable to load content. Check the sheet ID.</p>';
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
