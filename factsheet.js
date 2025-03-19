// FACTSHEET SCRIPT VERSION: 2.3.3
console.log("🚀 FACTSHEET SCRIPT VERSION: 2.3.3");

const SPREADSHEET_ID = "19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0"; 
const API_KEY = "AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E"; 

async function fetchSheetData(sheetName) {
    console.log(`📢 Fetching sheet metadata to get gid for: ${sheetName}`);
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=sheets(properties(title,sheetId))&key=${API_KEY}`;
    
    try {
        const metadataResponse = await fetch(metadataUrl);
        const metadata = await metadataResponse.json();
        console.log("📥 Retrieved Sheet Metadata:", metadata);
        
        if (!metadata.sheets) {
            throw new Error("Invalid response format: No sheets data found.");
        }
        
        const sheet = metadata.sheets.find(s => s.properties.title === sheetName);
        if (!sheet) {
            throw new Error(`Sheet '${sheetName}' not found in metadata.`);
        }
        
        const gid = sheet.properties.sheetId;
        console.log(`✔️ Sheet '${sheetName}' found with GID: ${gid}`);
        const dataUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=${gid}`;
        
        console.log("📡 Fetching Data from URL:", dataUrl);
        const dataResponse = await fetch(dataUrl);
        let rawData = await dataResponse.text();
        rawData = rawData.substring(rawData.indexOf("setResponse(") + 12, rawData.lastIndexOf(")"));
        const jsonData = JSON.parse(rawData);
        
        console.log("✅ Successfully retrieved data:", jsonData);
        renderFactsheet(jsonData.table.rows);
    } catch (error) {
        console.error("❌ Error fetching sheet data:", error);
    }
}
function renderFactsheet(data) {
    console.log("📌 Processing Data for Rendering:", data);

    let html = "";
    const factsheetDiv = document.getElementById('factsheet');
    if (!factsheetDiv) {
        console.error("❌ Error: #factsheet div not found in index.html");
        return;
    }

    // Object to store dynamically extracted sections
    let sections = {};

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i].c || [];
            const field = row[0] && row[0].v ? row[0].v.trim() : "";
            const value = row[1] && row[1].v ? row[1].v.trim() : "";

            if (!field.trim()) {
                console.warn(`⚠️ Skipping row ${i} because it has no header.`);
                continue;
            }

            console.log(`➡️ Processing Row ${i}: Field='${field}', Value='${value}'`);

            // Process multi-line content
            let processedValue = '';
            if (value) {
                const lines = value.split('\n'); // Split value by lines
                let listOpen = false;

                lines.forEach((line, index) => {
                    line = line.trim();
                    if (!line) return; // Skip empty lines

                    if (line.startsWith('-')) {
                        if (!listOpen) {
                            processedValue += "<ul>"; // Open list if it's the first bullet
                            listOpen = true;
                        }
                        processedValue += `<li>${line.substring(1).trim()}</li>`; // Remove the "-" and trim space
                    } else {
                        if (listOpen) {
                            processedValue += "</ul>"; // Close the list when normal text appears
                            listOpen = false;
                        }
                        processedValue += `<p>${line}</p>`;
                    }
                });

                if (listOpen) {
                    processedValue += "</ul>"; // Ensure lists are properly closed
                }
            }

            // Append processed value to the corresponding section
            if (sections[field]) {
                sections[field] += processedValue;  // Append if field already exists
            } else {
                sections[field] = processedValue;  // Create new entry
            }
        }

        // Start building the HTML output
        html += '<div class="factsheet">';

        for (const field in sections) {
            if (field === "Image URL") {
                const imageUrl = sections[field].replace(/[\n\r]+$/, '');  // Remove trailing newline
                html += `
                    <div class="hero-section">
                        <img src="${imageUrl}" class="hero-image" alt="Product Image" 
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=No+Image+Available';">
                    </div>`;
            } else if (field === "Product Name" || field === "Tagline" || field === "Description") {
                html += `
                    <div class="title-container">
                        <h1 class="product-title">${sections[field]}</h1>
                    </div>`;
            } else {
                // General case for all other fields
                html += `
                    <div class="section">
                        <h2>${field}</h2>
                        <div class="content">${sections[field]}</div>
                    </div>`;
            }
        }

        html += '</div>';  // Close the factsheet div

        factsheetDiv.innerHTML = html;
    } else {
        console.error("❌ No valid data found.");
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}
