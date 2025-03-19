// FACTSHEET SCRIPT VERSION: 2.3.4
console.log("🚀 FACTSHEET SCRIPT VERSION: 2.3.4");

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

document.addEventListener("DOMContentLoaded", () => {
    const sheetName = "Pay As You Go";
    console.log(`Loading factsheet for: '${sheetName}'`);
    fetchSheetData(sheetName);
});

function renderFactsheet(data) {
    console.log("📌 Processing Data for Rendering:", data);

    let html = "";
    const factsheetDiv = document.getElementById('factsheet');
    if (!factsheetDiv) {
        console.error("❌ Error: #factsheet div not found in index.html");
        return;
    }

    let sections = {};  // Stores sections dynamically
    let lastHeader = null; // Keeps track of the last section header

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i].c || [];
            const field = row[0] && row[0].v ? row[0].v.trim() : "";
            const values = row.slice(1).map(cell => cell && cell.v ? cell.v.trim() : "").filter(v => v !== "");

            if (!field && values.length === 0) {
                console.warn(`⚠️ Skipping empty row ${i}`);
                continue;
            }

            console.log(`➡️ Processing Row ${i}: Field='${field}', Values=${JSON.stringify(values)}`);

            if (field.startsWith("_")) {
                // Meta-data field (e.g., "_Image URL")
                sections[field] = values[0] || ""; // Store the first value
                continue;
            }

            if (field) {
                // New Section Header
                lastHeader = field;
                sections[field] = []; // Initialize empty array for multi-line storage
            }

            if (values.length > 0 && lastHeader) {
                // Append content to the last section
                values.forEach(value => {
                    if (value.startsWith("-")) {
                        sections[lastHeader].push(`<li>${value.substring(1).trim()}</li>`);
                    } else {
                        sections[lastHeader].push(`<p>${value}</p>`);
                    }
                });
            }
        }

        // Start building the HTML output
        html += '<div class="factsheet">';

        for (const field in sections) {
            if (field === "_Image URL") {
                const imageUrl = sections[field].replace(/[\n\r]+$/, '');  // Remove trailing newline
                html += `
                    <div class="hero-section">
                        <img src="${imageUrl}" class="hero-image" alt="Product Image" 
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=No+Image+Available';">
                    </div>`;
            } else if (field === "_Product Name") {
                html += `<div class="title-container"><h1 class="product-title">${sections[field]}</h1></div>`;
            } else if (field.startsWith("_")) {
                // Other meta-data fields (ignored for now but can be used)
                console.log(`ℹ️ Meta-data field '${field}' found: ${sections[field]}`);
            } else {
                // General Section
                let content = sections[field].join(""); // Join all stored HTML content
                if (content.includes("<li>")) {
                    content = `<ul>${content}</ul>`; // Wrap in UL if it contains bullet points
                }

                html += `
                    <div class="section">
                        <h2>${field}</h2>
                        <div class="content">${content}</div>
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
