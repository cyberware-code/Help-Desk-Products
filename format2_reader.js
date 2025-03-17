// format2_reader.js (REWRITTEN for 2-column Google Sheet)
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

    // Check if there's data and skip header row
    if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const field = row[0]; // Column A: Field Name
            const value = row[1]; // Column B: Field Value

            // Output based on the field name
            switch (field) {
                case 'Product Name':
                    html += `<h1>${value}</h1>`;
                    break;
                case 'Description':
                    html += `<p>${value}</p>`;
                    break;
                case 'Ideal For':
                    html += `<h2>Ideal For</h2><p>${value}</p>`;
                    break;
                case 'What it Covers':
                    html += `<h2>What it Covers</h2><p>${value}</p>`;
                    break;
                case 'What is Excluded':
                    html += `<h2>What is Excluded</h2><p>${value}</p>`;
                    break;
                case 'How It Is Delivered':
                    html += `<h2>How It Is Delivered</h2><p>${value}</p>`;
                    break;
                case 'Unit Cost':
                    html += `<h2>Unit Cost</h2><p>${value}</p>`;
                    break;
                case 'Unit Price':
                    html += `<h2>Unit Price</h2><p>${value}</p>`;
                    break;
                case 'Pros':
                    html += `<h2>Pros</h2><p>${value}</p>`;
                    break;
                case 'Cons':
                    html += `<h2>Cons</h2><p>${value}</p>`;
                    break;
                case 'Frequently Asked Questions':
                    html += `<h2>Frequently Asked Questions</h2><p>${value}</p>`;
                    break;
                case 'Image URL':
                    // You'd likely want to render an actual image here.
                    html += `<h2>Image URL</h2><p>${value}</p>`;
                    break;
                case 'Terms and Conditions':
                    html += `<h2>Terms and Conditions</h2><p>${value}</p>`;
                    break;
                default:
                    html += `<p><strong>${field}:</strong> ${value}</p>`; // Display any unknown fields
                    break;
            }
        }
    } else {
        html += '<p>No data found in the Google Sheet.</p>';
    }

    contentDiv.innerHTML = html;
}

// Call the function to fetch and render data
fetchSheetData();
