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

// **Step 3: Render the Fetched Data into a Fact Sheet**

// ✅ Ensure `fetchSheetData()` is called
function renderFactsheet(data) {
    console.log("📌 Processing Data for Rendering:", data);

    let html = ""; // ✅ Ensure `html` is initialized
    const factsheetDiv = document.getElementById('factsheet');
    if (!factsheetDiv) {
        console.error("❌ Error: #factsheet div not found in index.html");
        return;
    }

    let heroImage = '', productName = '', tagline = '', description = '', features = '', idealFor = '', pricing = '', exclusions = '', pros = '', cons = '', faq = '', terms = '';

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

            switch (field) {
                case "Image URL":
                    console.log("✔️ Setting Hero Image:", value);
                    let imageUrl = value ? value.trim() : "";
                    heroImage = `<img src="${imageUrl}" class="hero-image" alt="Product Image" 
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
                    description = `<p class="product-description">${value}</p>`;
                    break;

                case "What it Covers":
                    console.log(`📌 Processing "What it Covers"`);
                    features = `<ul>`;
                    for (let j = i + 1; j < data.length; j++) {
                        if (!data[j].c[0]) {
                            console.log(`➕ Adding Key Feature: ${data[j].c[1].v}`);
                            features += `<li>${data[j].c[1].v}</li>`;
                        } else {
                            break;
                        }
                    }
                    features += `</ul>`;
                    break;

                case "Ideal For":
                    console.log(`📌 Processing "Ideal For"`);
                    idealFor = `<ul>`;
                    for (let j = i + 1; j < data.length; j++) {
                        if (!data[j].c[0]) {
                            console.log(`➕ Adding Ideal For: ${data[j].c[1].v}`);
                            idealFor += `<li>${data[j].c[1].v}</li>`;
                        } else {
                            break;
                        }
                    }
                    idealFor += `</ul>`;
                    break;

                case "Unit Cost":
                case "Unit Price":
                    console.log(`📌 Setting Pricing Info: ${field} - ${value}`);
                    pricing = `<strong>${field}:</strong> ${value}`;
                    break;

                case "What is Excluded":
                    console.log(`📌 Processing "What is Excluded"`);
                    exclusions = `<ul><li>${value}</li>`;
                    for (let j = i + 1; j < data.length; j++) {
                        if (!data[j].c[0]) {
                            console.log(`➕ Adding Exclusion: ${data[j].c[1].v}`);
                            exclusions += `<li>${data[j].c[1].v}</li>`;
                        } else {
                            break;
                        }
                    }
                    exclusions += `</ul>`;
                    break;

                case "Pros":
                    console.log(`📌 Processing "Pros"`);
                    pros = `<ul><li>${value}</li>`;
                    for (let j = i + 1; j < data.length; j++) {
                        if (!data[j].c[0]) {
                            console.log(`➕ Adding Pro: ${data[j].c[1].v}`);
                            pros += `<li>${data[j].c[1].v}</li>`;
                        } else {
                            break;
                        }
                    }
                    pros += `</ul>`;
                    break;

                case "Cons":
                    console.log(`📌 Processing "Cons"`);
                    cons = `<ul><li>${value}</li>`;
                    for (let j = i + 1; j < data.length; j++) {
                        if (!data[j].c[0]) {
                            console.log(`➕ Adding Con: ${data[j].c[1].v}`);
                            cons += `<li>${data[j].c[1].v}</li>`;
                        } else {
                            break;
                        }
                    }
                    cons += `</ul>`;
                    break;

                case "Frequently Asked Questions":
                    console.log(`📌 Processing "FAQs"`);
                    faq = `<ul><li>${value}</li></ul>`;
                    break;

                case "Terms and Conditions":
                    console.log(`📌 Processing "Terms and Conditions"`);
                    terms = `<p class="product-terms">${value || "Not provided"}</p>`;
                    break;

                default:
                    console.warn(`⚠️ Unrecognized Field: '${field}' with Value: '${value}'`);
                    break;
            }
        }

        // ✅ Ensure `html` is correctly built before rendering
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

                    <tr>
                        <td class="section-title">✅ Key Features</td>
                        <td class="section-title">📌 Ideal For</td>
                    </tr>
                    <tr>
                        <td>${features}</td>
                        <td>${idealFor}</td>
                    </tr>

                    <tr><td colspan="2" class="section-title">💲 Pricing</td></tr>
                    <tr><td colspan="2">${pricing}</td></tr>

                    <tr><td colspan="2" class="section-title">❌ What is Excluded</td></tr>
                    <tr><td colspan="2">${exclusions}</td></tr>

                    <tr>
                        <td class="section-title">✅ Pros</td>
                        <td class="section-title">❌ Cons</td>
                    </tr>
                    <tr>
                        <td>${pros}</td>
                        <td>${cons}</td>
                    </tr>

                    <tr><td colspan="2" class="section-title">❓ FAQs</td></tr>
                    <tr><td colspan="2">${faq}</td></tr>

                    <tr><td colspan="2" class="section-title footer">🔗 Terms & Conditions | Contact Info</td></tr>
                    <tr><td colspan="2">${terms}</td></tr>
                </table>
            </div>
        `;

        console.log("🚀 Final Generated HTML Output:", html);
        factsheetDiv.innerHTML = html;
    } else {
        console.error("❌ No valid data found.");
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}

fetchSheetData("Pay As You Go");
