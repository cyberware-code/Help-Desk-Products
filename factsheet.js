console.log("🚀 FACTSHEET SCRIPT LOADED");

// Constants
const SHEET_NAME = "Pay As You Go";
const SPREADSHEET_ID = "19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0";
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=`;

// Global Variables
let factsheetData = {};

// Fetch Data from Google Sheets
async function fetchFactsheet() {
    try {
        console.log(`📢 Fetching data for sheet: ${SHEET_NAME}`);
        
        const url = BASE_URL + "1238020069";  // Replace with correct GID
        console.log(`📡 Fetching Data from URL: ${url}`);
        
        const response = await fetch(url);
        const text = await response.text();
        const jsonData = JSON.parse(text.substring(47, text.length - 2));
        
        console.log("📥 Raw Response from Google Sheets:", jsonData);
        processFactsheet(jsonData);
    } catch (error) {
        console.error("❌ Error fetching data:", error);
    }
}

// Process Data
function processFactsheet(jsonData) {
    try {
        console.log("📊 Processing Data...");
        const rows = jsonData.table.rows;

        rows.forEach(row => {
            if (!row.c[0] || !row.c[1]) return;
            
            let field = row.c[0].v.trim();
            let value = row.c[1].v ? row.c[1].v.trim() : "";
            
            factsheetData[field] = factsheetData[field] || [];
            factsheetData[field].push(value);
        });

        console.log("✅ Successfully processed factsheet data:", factsheetData);
        renderFactsheet();
    } catch (error) {
        console.error("❌ Error processing factsheet data:", error);
    }
}

// Render Factsheet HTML
function renderFactsheet() {
    console.log("📥 Calling renderFactsheet()");

    let html = `
        <div class="factsheet">
            <div class="hero-section">
    `;

    // Image
    if (factsheetData["Image URL"]) {
        let imageUrl = factsheetData["Image URL"][0].trim();
        console.log("✔️ Setting Hero Image:", imageUrl);
        html += `<img src="${imageUrl}" class="hero-image" alt="Product Image"
                  onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=No+Image+Available';">`;
    }

    // Product Name & Tagline
    html += `
            <div class="title-container">
                <h1 class="product-title">${factsheetData["Product Name"] ? factsheetData["Product Name"][0] : ""}</h1>
                <h3 class="product-tagline">${factsheetData["Tagline"] ? factsheetData["Tagline"][0] : ""}</h3>
            </div>
        </div>
    `;

    // Description
    if (factsheetData["Description"]) {
        html += `
            <table class="product-table">
                <tr><td colspan="2" class="section-title">Description</td></tr>
                <tr><td colspan="2"><p class="product-description">${factsheetData["Description"][0]}</p></td></tr>
        `;
    }

    // Pricing
    if (factsheetData["Unit Cost"] || factsheetData["Unit Price"]) {
        html += `
            <tr><td colspan="2" class="section-title">💲 Pricing</td></tr>
            <tr><td colspan="2">
                <strong>Unit Cost:</strong> ${factsheetData["Unit Cost"] ? factsheetData["Unit Cost"][0] : "N/A"}<br>
                <strong>Unit Price:</strong> ${factsheetData["Unit Price"] ? factsheetData["Unit Price"][0] : "N/A"}<br>
            </td></tr>
        `;
    }

    // Pros & Cons
    if (factsheetData["Pros"] || factsheetData["Cons"]) {
        html += `
            <tr><td colspan="2" class="section-title">✅ Pros & ❌ Cons</td></tr>
            <tr>
                <td class="pros-column">
                    <h3>✅ Pros</h3>
                    <ul>${factsheetData["Pros"] ? factsheetData["Pros"].map(pro => `<li>${pro}</li>`).join('') : ""}</ul>
                </td>
                <td class="cons-column">
                    <h3>❌ Cons</h3>
                    <ul>${factsheetData["Cons"] ? factsheetData["Cons"].map(con => `<li>${con}</li>`).join('') : ""}</ul>
                </td>
            </tr>
        `;
    }

    // Footer
    html += `
            <tr><td colspan="2" class="section-title footer">🔗 Terms & Conditions | Contact Info</td></tr>
            <tr><td colspan="2"><p class="product-terms"></p></td></tr>
        </table>
    </div>`;

    document.getElementById("factsheet-container").innerHTML = html;
}

// Initialize
fetchFactsheet();