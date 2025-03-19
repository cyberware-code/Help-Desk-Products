// FACTSHEET SCRIPT VERSION: 2.3.2
console.log("🚀 FACTSHEET SCRIPT VERSION: 2.3.2");

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

    // These variables will hold the dynamic content for the factsheet sections
    let sections = {};

    // Iterate through all rows to process fields dynamically
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

            // Handle multi-line content (bullet points and paragraphs)
            let processedValue = '';
            if (value) {
                const lines = value.split('\n'); // Split value by lines
                lines.forEach(line => {
                    // If the line starts with '-', treat it as a bullet point
                    if (line.startsWith('-')) {
                        processedValue += `<li>${line.substring(1).trim()}</li>`;
                    } else {
                        processedValue += `<p>${line.trim()}</p>`;
                    }
                });
            }

            // Add the processed value under the appropriate section
            if (sections[field]) {
                sections[field] += processedValue;  // Append to existing field content
            } else {
                sections[field] = processedValue;  // Create a new field section
            }
        }

        // Start constructing the HTML output based on dynamic sections
        html += '<div class="factsheet">';

        // Process the sections dynamically, iterating over the keys (field names)
        for (const field in sections) {
            // Check for specific fields that require special treatment
            if (field === "Image URL") {
                const imageUrl = sections[field].replace(/[\n\r]+$/, '');  // Strip trailing newlines
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
                // For all other fields, we add them as sections with titles
                html += `
                    <div class="section">
                        <h2>${field}</h2>
                        <div class="content">${sections[field]}</div>
                    </div>`;
            }
        }

        html += '</div>';  // Close the factsheet div

        // Render the HTML into the factsheetDiv
        factsheetDiv.innerHTML = html;
    } else {
        console.error("❌ No valid data found.");
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}
