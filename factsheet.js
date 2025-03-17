async function fetchSheetData(sheetName) {
    if (!sheetName || typeof sheetName !== 'string' || sheetName.trim() === "") {
        console.error("Error: No valid sheet name provided.");
        document.getElementById('factsheet').innerHTML = `<p style="color:red;">Error: No valid sheet name provided.</p>`;
        return;
    }

    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0'; 
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    // Fetch metadata to find correct `gid`
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties&key=${API_KEY}`;

    console.log(`Fetching metadata for sheet: '${sheetName}' from: ${metadataUrl}`);

    try {
        const metadataResponse = await fetch(metadataUrl);
        const metadata = await metadataResponse.json();

        console.log("Sheet Metadata:", metadata); // Debugging API response

        if (!metadata.sheets || metadata.sheets.length === 0) {
            throw new Error("No sheets found in the Google Sheet.");
        }

        // Find sheet by name (case-insensitive)
        const sheet = metadata.sheets.find(s => s.properties.title.trim().toLowerCase() === sheetName.trim().toLowerCase());

        if (!sheet) {
            throw new Error(`Sheet '${sheetName}' not found.`);
        }

        const sheetId = sheet.properties.sheetId;
        console.log(`Found Sheet '${sheetName}' with GID: ${sheetId}`);

        // Fetch data from the correct `gid`
        const dataUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=${sheetId}`;

        console.log(`Fetching data from: ${dataUrl}`);

        const response = await fetch(dataUrl);
        const text = await response.text();
        const json = JSON.parse(text.substring(47, text.length - 2)); // Remove JSONP wrapper

        console.log("Raw Data from Google Sheets:", json);

        if (json.table && json.table.rows) {
            return renderFactsheet(json.table.rows);
        } else {
            throw new Error(`No data found in sheet '${sheetName}'.`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('factsheet').innerHTML = `<p style="color:red;">Error fetching data: ${error.message}</p>`;
    }
}



function renderFactsheet(data) {
    console.log("Processed Data for Rendering:", data); // Debugging log

    const factsheetDiv = document.getElementById('factsheet');
    let html = '';
    let currentSection = ''; // Track the last valid section title

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i].c || []; // Ensure row exists
            console.log(`Row ${i}:`, row); // Debugging each row

            // Extract values safely
            const field = row[0] && row[0].v ? row[0].v.trim() : currentSection;
            const value = row[1] && row[1].v ? row[1].v.trim() : "";

            // Skip completely empty rows
            if (!field && !value) continue;

            // **Handle Section Titles**
            if (row[0] && row[0].v) {
                if (currentSection !== "") {
                    html += '</ul>'; // Close the previous section list
                }
                html += `<h2>${field}</h2><ul>`; // New section title
                currentSection = field;
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

    console.log("Final Rendered HTML:", html); // Log final HTML output
    factsheetDiv.innerHTML = html;
}


function applyFormatting(text) {
    if (!text) return ""; 

    let formattedText = text;

    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
    formattedText = formattedText.replace(/\[size=(\d+)\](.*?)\[\/size\]/g, '<span style="font-size:$1px;">$2</span>');
    formattedText = formattedText.replace(/\[font=([\w\s]+)\](.*?)\[\/font\]/g, '<span style="font-family:$1;">$2</span>');

    return formattedText;
}

fetchSheetData();
