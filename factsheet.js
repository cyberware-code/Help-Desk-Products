function fetchSheetData(sheetName) {
    if (!sheetName) {
        console.error("Error: No valid sheet name provided.");
        return;
    }

    console.log("📢 Fetching data for sheet:", sheetName);

    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0'; // Google Spreadsheet ID
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E'; // API Key

    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;

    fetch(metadataUrl)
        .then(response => response.json())
        .then(metadata => {
            if (!metadata.sheets) throw new Error("❌ Could not retrieve sheet metadata.");

            console.log("📊 Retrieved Sheet Metadata:", metadata.sheets);

            const sheet = metadata.sheets.find(s => s.properties.title === sheetName);
            if (!sheet) throw new Error(`❌ Sheet '${sheetName}' not found.`);

            const sheetGID = sheet.properties.sheetId;
            console.log(`✔️ Sheet '${sheetName}' found with GID: ${sheetGID}`);

            const dataUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=${sheetGID}`;
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

            console.log(`➡️ Processing: ${field} = ${value}`);

            switch (field) {
                case "Image URL": heroImage = `<img src="${value}" class="hero-image">`; break;
                case "Product Name": productName = `<h1>${value}</h1>`; break;
                case "Tagline": tagline = `<h3>${value}</h3>`; break;
                case "Description": description = `<p>${value}</p>`; break;
                case "Key Features": features += `<li>${value}</li>`; break;
                case "Ideal For": idealFor += `<li>${value}</li>`; break;
                case "Pricing": pricing = `<p>${value}</p>`; break;
                case "What is Excluded": exclusions += `<li>${value}</li>`; break;
                case "Pros": pros += `<li>${value}</li>`; break;
                case "Cons": cons += `<li>${value}</li>`; break;
                case "Frequently Asked Questions": faq += `<li>${value}</li>`; break;
                case "Terms and Conditions": terms = `<p>${value}</p>`; break;
                default: console.warn(`⚠️ Unrecognized Field: ${field}`); break;
            }
        }

        factsheetDiv.innerHTML = `
            <div class="factsheet">
                ${heroImage}
                ${productName} ${tagline}
                <p>${description}</p>
                <ul>${features}</ul>
                <ul>${idealFor}</ul>
                <p>${pricing}</p>
                <ul>${exclusions}</ul>
                <ul>${pros}</ul>
                <ul>${cons}</ul>
                <ul>${faq}</ul>
                <p>${terms}</p>
            </div>
        `;
    } else {
        console.error("❌ No valid data found.");
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}

// ✅ Ensure `fetchSheetData()` is called
fetchSheetData("Pay As You Go");
