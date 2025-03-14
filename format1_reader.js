// format1_reader.js
function fetchSheetData() {
    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0';
    const SHEET_NAME = 'Test Page';
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

    data.forEach(row => {
        switch (row[0]) {
            case 'heading main-title':
                html += `<h1>${row[2]}</h1>`;
                break;
            case 'paragraph description':
                html += `<p>${row[2]}</p>`;
                break;
            case 'heading section-title':
                html += `<h2>${row[2]}</h2>`;
                break;
            case 'table':
                if (row[1] === 'Support Type' || row[1] === "Cyber Ware Notes" || row[1] === "What It Covers" || row[1] === "How it Works ( Customer Facing )" || row[1] === "Our Prices" || row[1] === "Market Rates" || row[1] === "Pros" || row[1] === "Cons") {
                    html += `<table><tr><th>${row[1]}</th><th>${row[2]}</th><th>${row[3]}</th><th>${row[4]}</th><th>${row[5]}</th><th>${row[6]}</th><th>${row[7]}</th></tr></table>`;
                } else {
                    html += `<table><tr><td>${row[1]}</td><td>${row[2]}</td><td>${row[3]}</td><td>${row[4]}</td><td>${row[5]}</td><td>${row[6]}</td><td>${row[7]}</td></tr></table>`;
                }
                break;
        }
    });

    contentDiv.innerHTML = html;
}

// Call the function to fetch and render data
fetchSheetData();
