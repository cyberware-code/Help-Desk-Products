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

    // Debug: Print raw data
    console.log("Processed Data for Rendering:", data);

    if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
            const row = data[i] || [];  // Ensure row is defined
            const field = row[0] || "Unknown Field";  // Handle missing field
            const value = row[1] || "No value provided";  // Handle missing value

            switch (field) {
                case 'Product Name': html += `<h1>${value}</h1>`; break;
                case 'Description': html += `<p>${value}</p>`; break;
                case 'Ideal For': html += `<h2>Ideal For</h2><p>${value}</p>`; break;
                case 'What it Covers': html += `<h2>What it Covers</h2><p>${value}</p>`; break;
                case 'What is Excluded': html += `<h2>What is Excluded</h2><p>${value}</p>`; break;
                case 'How It Is Delivered': html += `<h2>How It Is Delivered</h2><p>${value}</p>`; break;
                case 'Unit Cost': html += `<h2>Unit Cost</h2><p>${value}</p>`; break;
                case 'Unit Price': html += `<h2>Unit Price</h2><p>${value}</p>`; break;
                case 'Pros': html += `<h2>Pros</h2><p>${value}</p>`; break;
                case 'Cons': html += `<h2>Cons</h2><p>${value}</p>`; break;
                case 'Frequently Asked Questions': html += `<h2>Frequently Asked Questions</h2><p>${value}</p>`; break;
                case 'Image URL': html += `<h2>Image</h2><img src="${value}" alt="Product Image" style="max-width:100%; height:auto;">`; break;
                case 'Terms and Conditions': html += `<h2>Terms and Conditions</h2><p>${value}</p>`; break;
                default: html += `<p><strong>${field}:</strong> ${value}</p>`; break;
            }
        }
    } else {
        html += '<p>No data found in the Google Sheet.</p>';
    }

    contentDiv.innerHTML = html;
}

// Call the function to fetch and render data
fetchSheetData();
