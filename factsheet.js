const FACTSHEET_VERSION = "1.3.1"; // Increment version
console.log(`🚀 FACTSHEET SCRIPT VERSION: ${FACTSHEET_VERSION}`);

function fetchSheetData(sheetName) {
    if (!sheetName) {
        console.error("❌ Error: No valid sheet name provided.");
        return;
    }

    console.log("📢 Fetching data for sheet:", sheetName);

    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0';
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

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
    console.log(`📌 Processing Data for Rendering (Version: ${FACTSHEET_VERSION})`, data);

    let html = "";
    let heroImage = '', productName = '', tagline = '', description = '', terms = '';
    let sections = {}; // Store dynamically recognized sections

    const factsheetDiv = document.getElementById('factsheet');
    if (!factsheetDiv) {
        console.error("❌ Error: #factsheet div not found in index.html");
        return;
    }

    let currentSection = null;
    let multiLineSections = new Set([
        "What it Covers", "Ideal For", "What is Excluded",
        "Pros", "Cons", "Frequently Asked Questions",
        "Terms and Conditions"
    ]);

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i].c || [];
            const field = row[0] && row[0].v ? row[0].v.trim() : "";
            let value = row[1] && row[1].v ? row[1].v.trim() : "";

            if (!field.trim() && value) {
                if (currentSection && multiLineSections.has(currentSection)) {
                    if (!sections[currentSection]) sections[currentSection] = []; // ✅ Ensure array exists
                    console.log(`➕ Appending to "${currentSection}":`, value);
                    sections[currentSection].push(value.replace(/\n/g, "<br>"));
                } else {
                    console.warn(`⚠️ Skipping row ${i} because it has no header.`);
                }
                continue;
            }

            console.log(`➡️ Processing Row ${i}: Field='${field}', Value='${value}'`);
            currentSection = field;

            switch (field) {
                case "Image URL":
                    console.log("✔️ Setting Hero Image:", value);
                    heroImage = `<img src="${value}" class="hero-image" alt="Product Image" 
                          onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=No+Image+Available';">`;
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

                case "Terms and Conditions":
                    console.log(`📌 Processing "Terms and Conditions"`);
                    terms = `<p class="product-terms">${value.replace(/\n/g, "<br>")}</p>`;
                    break;

                default:
                    if (multiLineSections.has(field)) {
                        console.log(`📌 Processing Multi-line Section: "${field}"`);
                        sections[field] = [value.replace(/\n/g, "<br>")]; // ✅ Ensure array initialization
                    } else {
                        console.warn(`⚠️ Unrecognized Field: '${field}' with Value: '${value}'`);
                    }
                    break;
            }
        }

        // Generate HTML dynamically for all sections
        let sectionsHtml = "";
        Object.keys(sections).forEach(section => {
            if (sections[section] && sections[section].length > 0) {
                sectionsHtml += `
                    <tr><td colspan="2" class="section-title">${section}</td></tr>
                    <tr><td colspan="2"><ul class="section-list">
                        ${sections[section].map(item => `<li>${item}</li>`).join("")}
                    </ul></td></tr>`;
            }
        });

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

                    ${sectionsHtml}

                    <tr><td colspan="2" class="section-title footer">🔗 Terms & Conditions | Contact Info</td></tr>
                    <tr><td colspan="2">${terms}</td></tr>
                </table>
            </div>
        `;

        console.log("🚀 Final Generated HTML Output (Version: " + FACTSHEET_VERSION + "):", html);
        factsheetDiv.innerHTML = html;
    } else {
        console.error("❌ No valid data found.");
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}

// **Step 3: Render the Fetched Data into a Fact Sheet**
fetchSheetData("Pay As You Go");
