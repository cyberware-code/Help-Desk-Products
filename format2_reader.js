function fetchSheetData() {
    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0';
    const SHEET_NAME = encodeURIComponent('Pay As You Go'); // Ensure encoding for spaces
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    // Use `sheets/data/rowData` to get both values & formatting
    const formattingUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:B?key=${API_KEY}`;

    console.log("Fetching data from:", formattingUrl);

    fetch(formattingUrl)
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
            const row = data[i]?.values || [];  // Ensure row exists
            const field = (row.length > 0 && row[0]) ? applyFormatting(row[0]) : currentSection; // Maintain section title
            const value = (row.length > 1 && row[1]) ? applyFormatting(row[1]) : "";  // Format text

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

function applyFormatting(cell) {
    if (!cell || !cell.effectiveValue) return ""; // If no data, return empty string

    let text = cell.effectiveValue.stringValue || ""; // Get cell text
    let formattedText = '';

    if (cell.textFormatRuns) {
        cell.textFormatRuns.forEach(run => {
            let part = run.text || "";
            let style = '';

            if (run.format) {
                const format = run.format;

                // Apply bold, italic, underline
                if (format.bold) style += 'font-weight:bold;';
                if (format.italic) style += 'font-style:italic;';
                if (format.underline) style += 'text-decoration:underline;';

                // Apply font size
                if (format.fontSize) style += `font-size:${format.fontSize}px;`;

                // Apply font family
                if (format.fontFamily) style += `font-family:${format.fontFamily};`;

                // Convert to styled span
                formattedText += `<span style="${style}">${part}</span>`;
            } else {
                formattedText += part;
            }
        });
    } else {
        formattedText = text; // Default to plain text
    }

    return formattedText;
}

// Call function to fetch and render formatted data
fetchSheetData();
