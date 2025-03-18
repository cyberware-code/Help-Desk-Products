const FACTSHEET_VERSION = "1.3.5"; // Updated version
console.log(`🚀 FACTSHEET SCRIPT VERSION: ${FACTSHEET_VERSION}`);

function fetchSheetData(sheetName) {
    if (!sheetName) {
        console.error("❌ Error: No valid sheet name provided.");
        return;
    }

    console.log("📢 Fetching data for sheet:", sheetName);

    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0'; // Google Spreadsheet ID
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E'; // API Key

    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;

    return fetch(metadataUrl)
        .then(response => response.json())
        .then(metadata => {
            if (!metadata.sheets) throw new Error("❌ Could not retrieve sheet metadata.");

            console.log("📊 Retrieved Sheet Metadata:", metadata.sheets);

            const sheet = metadata.sheets.find(s => s.properties.title === sheetName);
            if (!sheet) throw new Error(`❌ Sheet '${sheetName}' not found.`);

            const sheetGID = sheet.properties.sheetId;
            console.log(`✔️ Sheet '${sheetName}' found with GID: ${sheetGID}`);

            return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=${sheetGID}`;
        })
        .then(dataUrl => {
            console.log(`📡 Fetching Data from URL: ${dataUrl}`);
            return fetch(dataUrl);
        })
        .then(response => response.text())
        .then(text => {
            console.log("📥 Raw Response from Google Sheets:", text);

            const jsonData = JSON.parse(text.replace(/^[^\{]+/, "").replace(/[^}]+$/, ""));
            if (!jsonData.table || !jsonData.table.rows) {
                throw new Error("❌ No data found in Google Sheets.");
            }

            console.log(`✅ Successfully retrieved ${jsonData.table.rows.length} rows from Google Sheets.`);

            const formattedData = jsonData.table.rows.map(row => ({
                c: row.c.map(cell => cell ? { v: cell.v, f: cell.f } : null)
            }));

            console.log("📥 Calling renderFactsheet() with data:", formattedData);
            renderFactsheet(formattedData);
        })
        .catch(error => console.error("❌ Error fetching data:", error));
}

function renderFactsheet(data) {
    console.log("📌 Processing Data for Rendering (Version:", FACTSHEET_VERSION, ")", data);

    let html = "";
    let heroImage = '', productName = '', tagline = '', description = '', features = '', idealFor = '', pricing = '', exclusions = '', pros = '', cons = '', faq = '', terms = '';

    const factsheetDiv = document.getElementById('factsheet');
    if (!factsheetDiv) {
        console.error("❌ Error: #factsheet div not found in index.html");
        return;
    }

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i].c || [];
            const field = row[0] && row[0].v ? row[0].v.trim() : "";
            let value = row[1] && row[1].v ? row[1].v.trim() : "";

            if (!field.trim()) {
                console.warn(`⚠️ Skipping row ${i} because it has no header.`);
                continue;
            }

            console.log(`➡️ Processing Row ${i}: Field='${field}', Value='${value}'`);

            switch (field) {
                case "Image URL":
                    console.log("✔️ Setting Hero Image:", value);

                    // Step 1: Clean the URL
                    let imageUrl = value.trim(); // Ensure no extra spaces or newlines
                    console.log("🔗 Processed Image URL:", imageUrl);

                    // Step 2: Find the hero image element in the DOM
                    const heroImage = document.querySelector('.hero-image');

                    if (heroImage) {
                        heroImage.src = imageUrl; // Set the cleaned URL
                        console.log("✅ Fixed Hero Image URL:", heroImage.src);
                    } else {
                        console.log("⚠️ Hero Image element not found! Ensure it exists in the HTML.");
                    }

                    break;

                case "Product Name":
                    console.log(`📌 Setting Product Name: ${value}`);
                    productName = `<h1 class="product-title">${value}</h1>`;
                    break;

                case "Tagline":
                    console.log(`📌 Setting Tagline: ${value}`);
                    tagline = `<h3 class="product-tagline">${value}</h3>`;
                    break;

                case "Description":
                    console.log(`📌 Setting Description: ${value}`);
                    description = `<p class="product-description">${value.replace(/\n/g, "<br>")}</p>`;
                    break;

                case "Unit Cost":
                case "Unit Price":
                    console.log(`📌 Setting Pricing Info: ${field} - ${value}`);
                    pricing += `<strong>${field}:</strong> ${value.replace(/\n/g, "<br>")}<br>`;
                    break;

                case "Pros":
                    console.log(`📌 Processing "Pros"`);
                    pros += `<li>${value.replace(/\n/g, "<br>")}</li>`;
                    break;

                case "Cons":
                    console.log(`📌 Processing "Cons"`);
                    cons += `<li>${value.replace(/\n/g, "<br>")}</li>`;
                    break;

                case "Terms and Conditions":
                    console.log(`📌 Processing "Terms and Conditions"`);
                    terms = `<p class="product-terms">${value.replace(/\n/g, "<br>")}</p>`;
                    break;

                default:
                    console.warn(`⚠️ Unrecognized Field: '${field}' with Value: '${value}'`);
                    break;
            }
        }

        // ✅ Final HTML Output
        html = `
            <div class="factsheet">
                <div class="hero-section">
                    ${heroImage}
                    <div class="title-container">
                        ${productName}
                        ${tagline}
                    </div>
                </div>

                <table class="product-table">
                    <tr><td colspan="2" class="section-title">Description</td></tr>
                    <tr><td colspan="2">${description}</td></tr>

                    <tr><td colspan="2" class="section-title">💲 Pricing</td></tr>
                    <tr><td colspan="2">${pricing}</td></tr>

                    <tr><td colspan="2" class="section-title">✅ Pros & ❌ Cons</td></tr>
                    <tr>
                        <td class="pros-column">
                            <h3>✅ Pros</h3>
                            <ul>${pros}</ul>
                        </td>
                        <td class="cons-column">
                            <h3>❌ Cons</h3>
                            <ul>${cons}</ul>
                        </td>
                    </tr>

                    <tr><td colspan="2" class="section-title footer">🔗 Terms & Conditions | Contact Info</td></tr>
                    <tr><td colspan="2">${terms}</td></tr>
                </table>
            </div>
        `;

        console.log("🚀 Final Generated HTML Output (Version:", FACTSHEET_VERSION, "):", html);
        factsheetDiv.innerHTML = html;
    }
}

// ✅ Fetch Data and Render Factsheet
fetchSheetData("Pay As You Go");
