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
function renderFactsheet(data) {
    console.log("📌 Processing Data for Rendering:", data);

    const factsheetDiv = document.getElementById('factsheet');
    let heroImage = '', productName = '', tagline = '', description = '', features = '', idealFor = '', pricing = '', exclusions = '', pros = '', cons = '', faq = '', terms = '';

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i].c || [];
            const field = row[0] && row[0].v ? row[0].v.trim() : "";
            const value = row[1] && row[1].v ? row[1].v.trim() : "";

            if (!field && !value) continue;

            console.log(`➡️ Processing Row ${i}: Field='${field}', Value='${value}'`);

            switch (field) {
                case "Image URL":
                    console.log(`✔️ Setting Hero Image: ${value}`);
                    heroImage = `<img src="${value}" class="hero-image">`; 
                    break;
                case "Product Name":
                    console.log(`✔️ Setting Product Name: ${value}`);
                    productName = `<h1 class="product-title">${value}</h1>`; 
                    break;
                case "Tagline":
                    console.log(`✔️ Setting Tagline: ${value}`);
                    tagline = `<h3 class="product-tagline">${value}</h3>`; 
                    break;
                case "Description":
                    console.log(`✔️ Setting Description: ${value}`);
                    description = `<p class="product-description">${value}</p>`; 
                    break;
                case "Key Features":
                    console.log(`✔️ Adding Key Feature: ${value}`);
                    features += `<li>${value}</li>`; 
                    break;
                case "Ideal For":
                    console.log(`✔️ Adding Ideal For: ${value}`);
                    idealFor += `<li>${value}</li>`; 
                    break;
                case "Pricing":
                    console.log(`✔️ Setting Pricing: ${value}`);
                    pricing = `<p class="product-pricing">${value}</p>`; 
                    break;
                case "What is Excluded":
                    console.log(`✔️ Adding Exclusion: ${value}`);
                    exclusions += `<li>${value}</li>`; 
                    break;
                case "Pros":
                    console.log(`✔️ Adding Pro: ${value}`);
                    pros += `<li>${value}</li>`; 
                    break;
                case "Cons":
                    console.log(`✔️ Adding Con: ${value}`);
                    cons += `<li>${value}</li>`; 
                    break;
                case "Frequently Asked Questions":
                    console.log(`✔️ Adding FAQ: ${value}`);
                    faq += `<li>${value}</li>`; 
                    break;
                case "Terms and Conditions":
                    console.log(`✔️ Setting Terms & Conditions: ${value}`);
                    terms = `<p class="product-terms">${value}</p>`; 
                    break;
                default:
                    console.warn(`⚠️ Unrecognized Field: '${field}' with Value: '${value}'`); 
                    break;
            }
        }

        factsheetDiv.innerHTML = `
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
                        <td><ul>${features}</ul></td>
                        <td><ul>${idealFor}</ul></td>
                    </tr>

                    <tr><td colspan="2" class="section-title">💲 Pricing</td></tr>
                    <tr><td colspan="2">${pricing}</td></tr>

                    <tr><td colspan="2" class="section-title">❌ What is Excluded</td></tr>
                    <tr><td colspan="2"><ul>${exclusions}</ul></td></tr>

                    <tr>
                        <td class="section-title">✅ Pros</td>
                        <td class="section-title">❌ Cons</td>
                    </tr>
                    <tr>
                        <td><ul>${pros}</ul></td>
                        <td><ul>${cons}</ul></td>
                    </tr>

                    <tr><td colspan="2" class="section-title">❓ FAQs</td></tr>
                    <tr><td colspan="2"><ul>${faq}</ul></td></tr>

                    <tr><td colspan="2" class="section-title footer">🔗 Terms & Conditions | Contact Info</td></tr>
                    <tr><td colspan="2">${terms}</td></tr>
                </table>
            </div>
        `;
    } else {
        console.error("❌ No valid data found.");
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}

// ✅ Ensure `fetchSheetData()` is called
fetchSheetData("Pay As You Go");
