// FACTSHEET SCRIPT VERSION: 2.2.3
console.log("🚀 FACTSHEET SCRIPT VERSION: 2.2.3");

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

    let heroImage = '', productName = '', tagline = '', description = '', 
        features = '', idealFor = '', pricing = '', exclusions = '', 
        pros = '', cons = '', faq = '', terms = '';

    let lastField = ''; // Track the last field for continuation
    let currentList = ''; // Used to track multi-line items
    let skipRow = false; // Flag to skip rows without content

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i].c || [];
            const field = row[0] && row[0].v ? row[0].v.trim() : "";
            const value = row[1] && row[1].v ? row[1].v.trim() : "";

            // Skip empty rows
            if (!field.trim() && !value.trim()) {
                continue;
            }

            // Skip rows without a proper header (when the first column is empty)
            if (!field.trim()) {
                console.warn(`⚠️ Skipping row ${i} because it has no header.`);
                continue;
            }

            console.log(`➡️ Processing Row ${i}: Field='${field}', Value='${value}'`);

            // Check if this row has a field and value to add
            if (field && value) {
                switch (field) {
                    case "Image URL":
                        console.log("✔️ Setting Hero Image:", value);
                        let imageUrl = value ? value.trim() : "";
                        heroImage = `<img src="${imageUrl}" class="hero-image" alt="Product Image" 
                              onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=No+Image+Available';">`;
                        lastField = "Image URL";
                        break;
                    
                    case "Product Name":
                        console.log("✔️ Product Name:", value);
                        productName = `<h1 class="product-title">${value}</h1>`;
                        lastField = "Product Name";
                        break;

                    case "Tagline":
                        console.log("✔️ Tagline:", value);
                        tagline = `<h3 class="product-tagline">${value}</h3>`;
                        lastField = "Tagline";
                        break;
                    
                    case "Description":
                        console.log("✔️ Description:", value);
                        description = `<p class="product-description">${value}</p>`;
                        lastField = "Description";
                        break;

                    case "What it Covers":
                        console.log("✔️ What it Covers:", value);
                        features += `<li>${value}</li>`;
                        lastField = "What it Covers";
                        break;

                    case "Ideal For":
                        console.log("✔️ Ideal For:", value);
                        idealFor += `<li>${value}</li>`;
                        lastField = "Ideal For";
                        break;

                    case "Unit Cost":
                    case "Unit Price":
                        console.log("✔️ Pricing:", value);
                        pricing += `<strong>${field}:</strong> ${value}<br>`;
                        lastField = "Unit Cost";
                        break;

                    case "What is Excluded":
                        console.log("✔️ What is Excluded:", value);
                        exclusions += `<li>${value}</li>`;
                        lastField = "What is Excluded";
                        break;

                    case "Pros":
                        console.log("✔️ Pros:", value);
                        pros += `<li>${value}</li>`;
                        lastField = "Pros";
                        break;

                    case "Cons":
                        console.log("✔️ Cons:", value);
                        cons += `<li>${value}</li>`;
                        lastField = "Cons";
                        break;

                    case "Frequently Asked Questions":
                        console.log("✔️ FAQs:", value);
                        faq += `<li>${value}</li>`;
                        lastField = "FAQs";
                        break;

                    case "Terms and Conditions":
                        console.log("✔️ Terms and Conditions:", value);
                        terms += `<p>${value}</p>`;
                        lastField = "Terms and Conditions";
                        break;

                    // Handle cases where the A column is blank but B contains content
                    default:
                        if (value) {
                            // Add to the previous section if the field is a continuation
                            console.log(`➡️ Adding continuation for '${lastField}': ${value}`);
                            switch (lastField) {
                                case "What it Covers":
                                    features += `<li>${value}</li>`;
                                    break;
                                case "Ideal For":
                                    idealFor += `<li>${value}</li>`;
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
                                case "FAQs":
                                    faq += `<li>${value}</li>`;
                                    break;
                                case "Terms and Conditions":
                                    terms += `<p>${value}</p>`;
                                    break;
                                default:
                                    console.warn(`⚠️ Unrecognized continuation for: ${lastField}`);
                                    break;
                            }
                        }
                        break;
                }
            }
        }

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
        console.log("🚀 Final Generated HTML Output:", html);
        factsheetDiv.innerHTML = html;
    } else {
        console.error("❌ No valid data found.");
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}
