function fetchSheetData(sheetName) {
    if (!sheetName) {
        console.error("Error: No valid sheet name provided.");
        return;
    }

    console.log("Fetching data for sheet:", sheetName); // Debugging log

    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0'; // Google Spreadsheet ID
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E'; // API Key

    // **Step 1: Get the Correct GID for the Sheet Name**
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${API_KEY}`;

    fetch(metadataUrl)
        .then(response => response.json())
        .then(metadata => {
            if (!metadata.sheets) throw new Error("Error: Could not retrieve sheet metadata.");

            console.log("Retrieved Sheet Metadata:", metadata.sheets); // Debugging log

            // Find the correct Sheet ID (GID)
            const sheet = metadata.sheets.find(s => s.properties.title === sheetName);

            if (!sheet) throw new Error(`Error: Sheet '${sheetName}' not found.`);

            

            const sheetGID = sheet.properties.sheetId;

            if (!sheetGID) {
                throw new Error("❌ sheetGID is undefined! Data URL cannot be constructed.");
            }

            console.log(`Sheet Hello '${sheetName}' found with GID: ${sheetGID}`);
            console.log(`**Step 2: Fetch Data from the Correct Sheet:' ${SHEET_ID}  `**');

        
            // **Step 2: Fetch Data from the Correct Sheet GID** //

            const dataUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=${sheetGID}`;

            console.log(`Data from URL: ${dataUrl}`);
            console.log(`Data from URL: ${dataUrl}`);
            console.log(`Data from URL: ${dataUrl}`);



            if (!dataUrl) {
                throw new Error("❌ dataUrl is undefined! Fetch cannot proceed.");
            }

            console.log(`promise done Data from URL: ${dataUrl}`);

            return fetch(dataUrl);
        })
        .then(response => response.text())
        .then(text => {
            const jsonData = JSON.parse(text.substring(47, text.length - 2));
            if (!jsonData.table.rows) throw new Error("Error: No data returned from Google Sheets.");

            console.log("Retrieved Data:", jsonData.table.rows); // Debugging log

            // Convert Google Sheets formatted data
            const formattedData = jsonData.table.rows.map(row => ({
                c: row.c.map(cell => cell ? { v: cell.v, f: cell.f } : null)
            }));
            fetch(dataUrl)
            .then(response => response.text())
            .then(text => {
                console.log("Raw Response from Google Sheets:", text); // Log raw response
                const jsonData = JSON.parse(text.substring(47, text.length - 2)); // Strip Google wrapper
                
                if (!jsonData.table || !jsonData.table.rows) {
                    console.error("❌ Google Sheets API returned no data.");
                    return;
                }
        
                console.log("Parsed Google Sheets Data:", jsonData.table.rows); // Log structured data
        
                const formattedData = jsonData.table.rows.map(row => ({
                    c: row.c.map(cell => cell ? { v: cell.v } : null)
                }));
        
                console.log("Formatted Data Length:", formattedData.length); // Log data length
                renderFactsheet(formattedData);
            })
            .catch(error => console.error("Error fetching data:", error));
        
            console.log("📥 Calling renderFactsheet() with data:", formattedData);
            console.log("📥 Data Length:", formattedData.length);
            renderFactsheet(formattedData);
        })
        .catch(error => console.error("Error fetching data:", error));
}

// **Step 3: Render the Fetched Data into a Fact Sheet**
function renderFactsheet(data) {
    console.log("Processing Data for Rendering:", data); // Debugging log
    console.log("📌 Debugging `renderFactsheet(data)` Call:");
    console.log("➡️ Data received:", data);
    console.log(`➡️ Data Length: ${data.length}`);

    const factsheetDiv = document.getElementById('factsheet');
    let heroImage = ''; 
    let productName = ''; 
    let tagline = ''; 
    let description = ''; 
    let features = ''; 
    let idealFor = ''; 
    let pricing = ''; 
    let exclusions = ''; 
    let pros = ''; 
    let cons = ''; 
    let faq = ''; 
    let terms = ''; 

    if (data && data.length > 0) {
        let currentSection = ''; 

        for (let i = 0; i < data.length; i++) {
            const row = data[i].c || []; 
            const field = row[0] && row[0].v ? row[0].v.trim() : "";  
            const value = row[1] && row[1].v ? row[1].v.trim() : "";  

            if (!field && !value) continue; 

            console.log(`Processing Row ${i}: Field='${field}', Value='${value}'`); // Debug log for every row

            switch (field) {
                case "Image URL":
                    let cleanedUrl = value.trim();
                    console.log(`✔️ Image URL Found: ${cleanedUrl}`);
                    heroImage = `<img src="${cleanedUrl}" alt="Product Image" class="hero-image">`;
                    console.log("Generated Image Tag:", heroImage);
                    break;
                case "Product Name":
                    console.log(`✔️ Product Name Found: ${value}`);
                    productName = `<h1 class="product-title">${value}</h1>`;
                    break;
                case "Tagline":
                    console.log(`✔️ Tagline Found: ${value}`);
                    tagline = `<h3 class="product-tagline">${value}</h3>`;
                    break;
                case "Description":
                    console.log(`✔️ Description Found: ${value}`);
                    description = `<p class="product-description">${value}</p>`;
                    break;
                case "Key Features":
                    console.log(`✔️ Key Feature Added: ${value}`);
                    features += `<li>${value}</li>`;
                    break;
                case "Ideal For":
                    console.log(`✔️ Ideal For: ${value}`);
                    idealFor += `<li>${value}</li>`;
                    break;
                case "Pricing":
                    console.log(`✔️ Pricing Found: ${value}`);
                    pricing = `<p class="product-pricing">${value}</p>`;
                    break;
                case "What is Excluded":
                    console.log(`✔️ Exclusion Found: ${value}`);
                    exclusions += `<li>${value}</li>`;
                    break;
                case "Pros":
                    console.log(`✔️ Pros Added: ${value}`);
                    pros += `<li>${value}</li>`;
                    break;
                case "Cons":
                    console.log(`✔️ Cons Added: ${value}`);
                    cons += `<li>${value}</li>`;
                    break;
                case "Frequently Asked Questions":
                    console.log(`✔️ FAQ Added: ${value}`);
                    faq += `<li>${value}</li>`;
                    break;
                case "Terms and Conditions":
                    console.log(`✔️ Terms & Conditions Found: ${value}`);
                    terms = `<p class="product-terms">${value}</p>`;
                    break;
                default:
                    console.warn(`⚠️ Unrecognized Field: '${field}' with Value: '${value}'`);
                    break;
            }
        }

        let html = `
            <div class="factsheet">
                <div class="hero-section">
                    ${heroImage}
                    <div class="title-container">
                        ${productName}
                        ${tagline}
                    </div>
                </div>

                <table class="product-table">
                    <tr>
                        <td colspan="2" class="section-title">Description</td>
                    </tr>
                    <tr>
                        <td colspan="2">${description}</td>
                    </tr>

                    <tr>
                        <td class="section-title">✅ Key Features</td>
                        <td class="section-title">📌 Ideal For</td>
                    </tr>
                    <tr>
                        <td><ul>${features}</ul></td>
                        <td><ul>${idealFor}</ul></td>
                    </tr>

                    <tr>
                        <td colspan="2" class="section-title">💲 Pricing</td>
                    </tr>
                    <tr>
                        <td colspan="2">${pricing}</td>
                    </tr>

                    <tr>
                        <td colspan="2" class="section-title">❌ What is Excluded</td>
                    </tr>
                    <tr>
                        <td colspan="2"><ul>${exclusions}</ul></td>
                    </tr>

                    <tr>
                        <td class="section-title">✅ Pros</td>
                        <td class="section-title">❌ Cons</td>
                    </tr>
                    <tr>
                        <td><ul>${pros}</ul></td>
                        <td><ul>${cons}</ul></td>
                    </tr>

                    <tr>
                        <td colspan="2" class="section-title">❓ FAQs</td>
                    </tr>
                    <tr>
                        <td colspan="2"><ul>${faq}</ul></td>
                    </tr>

                    <tr>
                        <td colspan="2" class="section-title footer">🔗 Terms & Conditions | Contact Info</td>
                    </tr>
                    <tr>
                        <td colspan="2">${terms}</td>
                    </tr>
                </table>
            </div>
        `;

        factsheetDiv.innerHTML = html;
    } else {
        console.error("❌ No valid data found in the Google Sheet.");
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}


// Call with correct sheet name
//fetchSheetData("Pay As You Go");
