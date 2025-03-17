async function fetchSheetData(sheetName) {
    if (!sheetName || typeof sheetName !== 'string' || sheetName.trim() === "") {
        console.error("Error: No valid sheet name provided.");
        document.getElementById('factsheet').innerHTML = `<p style="color:red;">Error: No valid sheet name provided.</p>`;
        return;
    }

    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0'; 
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    // Fetch metadata to find correct `gid`
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties&key=${API_KEY}`;

    console.log(`Fetching metadata for sheet: '${sheetName}' from: ${metadataUrl}`);

    try {
        const metadataResponse = await fetch(metadataUrl);
        const metadata = await metadataResponse.json();

        console.log("Sheet Metadata:", metadata); // Debugging API response

        if (!metadata.sheets || metadata.sheets.length === 0) {
            throw new Error("No sheets found in the Google Sheet.");
        }

        // Find sheet by name (case-insensitive)
        const sheet = metadata.sheets.find(s => s.properties.title.trim().toLowerCase() === sheetName.trim().toLowerCase());

        if (!sheet) {
            throw new Error(`Sheet '${sheetName}' not found.`);
        }

        const sheetId = sheet.properties.sheetId;
        console.log(`Found Sheet '${sheetName}' with GID: ${sheetId}`);

        // Fetch data from the correct `gid`
        const dataUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=${sheetId}`;

        console.log(`Fetching data from: ${dataUrl}`);

        const response = await fetch(dataUrl);
        const text = await response.text();
        const json = JSON.parse(text.substring(47, text.length - 2)); // Remove JSONP wrapper

        console.log("Raw Data from Google Sheets:", json);

        if (json.table && json.table.rows) {
            return renderFactsheet(json.table.rows);
        } else {
            throw new Error(`No data found in sheet '${sheetName}'.`);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('factsheet').innerHTML = `<p style="color:red;">Error fetching data: ${error.message}</p>`;
    }
}



function renderFactsheet(data) {
    console.log("Processed Data for Rendering:", data); // Debugging log

    const factsheetDiv = document.getElementById('factsheet');
    let heroImage = ''; // Placeholder for hero image
    let productName = ''; // Placeholder for the main title
    let tagline = ''; // Placeholder for the tagline
    let description = ''; // Placeholder for the description
    let features = ''; // Placeholder for Key Features / Benefits
    let idealFor = ''; // Placeholder for Ideal For
    let pricing = ''; // Placeholder for Pricing & Plans
    let exclusions = ''; // What is Excluded
    let pros = ''; // Pros section
    let cons = ''; // Cons section
    let faq = ''; // Frequently Asked Questions
    let terms = ''; // Terms and Conditions

    if (data && data.length > 0) {
        let currentSection = ''; // Track last valid section title

        for (let i = 0; i < data.length; i++) {
            const row = data[i].c || []; // Ensure row exists
            console.log(`Row ${i}:`, row); // Debugging each row

            const field = row[0] && row[0].v ? row[0].v.trim() : "";  // Column A
            const value = row[1] && row[1].v ? row[1].v.trim() : "";  // Column B

            if (!field && !value) continue; // Skip completely empty rows

            // **Handle Special Fields for Layout**
            switch (field) {
                case "Image URL":
                    heroImage = `<img src="${value}" alt="Product Image" class="hero-image">`;
                    break;
                case "Product Name":
                    productName = `<h1 class="product-title">${value}</h1>`;
                    break;
                case "Tagline":
                    tagline = `<h3 class="product-tagline">${value}</h3>`;
                    break;
                case "Description":
                    description = `<p class="product-description">${value}</p>`;
                    break;
                case "Key Features":
                    features += `<li>${value}</li>`;
                    break;
                case "Ideal For":
                    idealFor += `<li>${value}</li>`;
                    break;
                case "Pricing":
                    pricing = `<p class="product-pricing">${value}</p>`;
                    break;
                case "What is Excluded":
                    exclusions += `<li>${value}</li>`;
                    break;
                case "Pros":
                    pros += `<li>${value}</li>`;
                    break;
                case "Cons":
                    cons += `<li>${value}</li>`;
                    break;
                case "Frequently Asked Questions":
                    faq += `<li>${value}</li>`;
                    break;
                case "Terms and Conditions":
                    terms = `<p class="product-terms">${value}</p>`;
                    break;
            }
        }

        // **Final HTML Assembly Using Table Layout**
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
                        <td class="section-title">✅ Key Features / Benefits</td>
                        <td class="section-title">📌 Ideal For</td>
                    </tr>
                    <tr>
                        <td><ul>${features}</ul></td>
                        <td><ul>${idealFor}</ul></td>
                    </tr>

                    <tr>
                        <td colspan="2" class="section-title">💲 Pricing & Plans</td>
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
                        <td colspan="2" class="section-title">❓ Frequently Asked Questions</td>
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
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}


function applyFormatting(text) {
    if (!text) return ""; 

    let formattedText = text;

    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    formattedText = formattedText.replace(/__(.*?)__/g, '<u>$1</u>');
    formattedText = formattedText.replace(/\[size=(\d+)\](.*?)\[\/size\]/g, '<span style="font-size:$1px;">$2</span>');
    formattedText = formattedText.replace(/\[font=([\w\s]+)\](.*?)\[\/font\]/g, '<span style="font-family:$1;">$2</span>');

    return formattedText;
}

fetchSheetData();
