function fetchSheetData() {
    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0';
    const SHEET_TAB_ID = 1238020069; // Correct GID for the right sheet
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    // Fetch full text formatting (bold, italic, underline, font size, font family)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_TAB_ID}!A:B?key=${API_KEY}`;

    console.log("Fetching data from:", url);

    fetch(url)
        .then(response => response.json()) // Google Sheets API returns proper JSON
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
    let currentSection = ''; // Track the last valid section title

    console.log("Processed Data for Rendering:", data); // Debugging log

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i] || []; // Ensure row exists
            const field = row[0] ? applyFormatting(row[0]) : currentSection; // Use last section title if empty
            const value = row[1] ? applyFormatting(row[1]) : ""; // Ensure no empty values

            // **Handle Section Titles**
            if (row[0]) {
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

    // Apply bold (**text**)
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Apply italic (_text_)
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');

    // Apply underline (__text__)
    formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');

    // Apply font size notation (e.g., [size=16]text[/size])
    formattedText = formattedText.replace(/\[size=(\d+)\](.*?)\[\/size\]/g, '<span style="font-size:$1px;">$2</span>');

    // Apply font family notation (e.g., [font=Arial]text[/font])
    formattedText = formattedText.replace(/\[font=([\w\s]+)\](.*?)\[\/font\]/g, '<span style="font-family:$1;">$2</span>');

    return formattedText;
}

// Call the function to fetch and render data
fetchSheetData();
