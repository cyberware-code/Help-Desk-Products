function fetchSheetData() {
    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0';
    const SHEET_NAME = 'Pay As You Go';
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;

    fetch(url)
        .then(response => response.json())
        .then(data => renderContent(data.values))
        .catch(error => console.error('Error fetching data:', error));
}

function renderContent(data) {
    const contentDiv = document.getElementById('content');
    let html = '';

    // Assuming the first row is the header row
    const headerRow = data[0];

    // Iterate the remaining rows (skipping the header)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        // If the first column has data, it is the title and we can output the table
        if (row[0]) {
            html += `<h2>${row[0]}</h2>`; // Service name as title
            html += `<p>${row[1]}</p>`; // Description
            html += `<h3>Details</h3>`;
            html += `<table>`;
            html += `<tr><th>Support Type</th><td>${row[2]}</td></tr>`;
            html += `<tr><th>What it Covers</th><td>${row[3]}</td></tr>`;
            html += `<tr><th>How it Works</th><td>${row[4]}</td></tr>`;
            html += `<tr><th>Pricing</th><td>${row[5]}</td></tr>`;
            html += `<tr><th>Market Rates</th><td>${row[6]}</td></tr>`;
            html += `<tr><th>Pros</th><td>${row[7]}</td></tr>`;
            html += `<tr><th>Cons</th><td>${row[8]}</td></tr>`;
            html += `</table>`;
        }
    }

    contentDiv.innerHTML = html;
}

// Call the function to fetch and render data
fetchSheetData();
