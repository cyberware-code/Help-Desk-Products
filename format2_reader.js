function fetchSheetData() {
    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0';
    const SHEET_NAME = 'Pay As You Go';
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

    console.log("Fetching data from:", url);

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Raw Data from Google Sheets:", data); // Debugging API response
            
            if (data && data.values) {
                renderContent(data.values);
            } else {
                console.error('Error: data.values is undefined.');
                document.getElementById('content').innerHTML = '<p style="color:red;">Error: Unable to load content. See console for details.</p>';
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
            const row = Array.isArray(data[i]) ? data[i] : [];
            const field = (row.length > 0 && row[0]) ? row[0] : currentSection; // Maintain the last section title
            const value = (row.length > 1 && row[1]) ? row[1] : "";  // Allow empty values

            // If a new section title appears, start a new list
            if (field !== currentSection) {
                if (currentSection !== '') {
                    html += '</ul>'; // Close the previous section's list
                }
                html += `<h2>${field}</h2><ul>`; // Start a new section
                currentSection = field; // Update current section tracker
            }

            // Add the value as a bullet point if it's not empty
            if (value.trim() !== '') {
                html += `<li>${value}</li>`;
            }
        }
        html += '</ul>'; // Close the last section's list
    } else {
        html += '<p>No data found in the Google Sheet.</p>';
    }

    contentDiv.innerHTML = html;
}

// Call the function to fetch and render data
fetchSheetData();
