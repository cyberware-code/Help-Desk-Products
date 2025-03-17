function fetchSheetData() {
    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0';
    const SHEET_TAB_ID = 1238020069; // Correct Sheet GID
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    // Request formatting data from Google Sheets API
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.data.rowData.values(effectiveValue,effectiveFormat,textFormatRuns)&key=${API_KEY}`;

    console.log("Fetching data from:", url);

    fetch(url)
        .then(response => response.json()) // Google Sheets API returns structured JSON
        .then(data => {
            console.log("Raw Data from Google Sheets:", data); // Debugging API response

            if (data.sheets && data.sheets[0].data) {
                renderContent(data.sheets[0].data[0].rowData);
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
            const row = data[i].values || []; // Ensure row exists
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

function applyFormatting(cell) {
    if (!cell || !cell.effectiveValue) return ""; // Ensure valid text exists

    let text = cell.effectiveValue.stringValue || ""; // Get cell text
    let formattedText = '';

    // If the cell has mixed formatting, process each text segment
    if (cell.textFormatRuns) {
        let lastOffset = 0;
        cell.textFormatRuns.forEach(run => {
            let part = text.substring(lastOffset, run.startIndex) || "";
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
            lastOffset = run.startIndex;
        });

        // Append any remaining unformatted text
        formattedText += text.substring(lastOffset);
    } else {
        formattedText = text; // Default to plain text
    }

    return formattedText;
}

// Call function to fetch and render formatted data
fetchSheetData();
