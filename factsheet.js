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

    const factsheetDiv = document.getElementById('factsheet');
    if (!factsheetDiv) {
        console.error("❌ Error: #factsheet div not found in index.html");
        return;
    }

    // ✅ Declare `html` properly
    let html = "";
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
            
            if (!field || field.trim() === "") {
                console.warn(`⚠️ Skipping row due to missing field name. Value: '${value}'`);
                continue;
            }
            

            console.log(`➡️ Processing Row ${i}: Field='${field}', Value='${value}'`);

            switch (field) {
                case "Image URL":
                    console.log("✔️ Setting Hero Image:", value); // Debug log
                    let imageUrl = value ? value.trim() : ""; // Ensure valid URL
       
                    // Ensure fallback image is used if the original fails
                    heroImage = `<img src="${imageUrl}" class="hero-image" alt="Product Image" 
                          onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=No+Image+Available';">`;
                    break;
                    
            
                case "Product Name":
                    console.log(`📌 Setting Product Name: ${value}`);
                    html += `<h1 class="product-title">${value}</h1>`;
                    break;
            
                case "Tagline":
                    console.log(`📌 Setting Tagline: ${value}`);
                    html += `<h3 class="product-tagline">${value}</h3>`;
                    break;
            
                case "Description":
                    console.log(`📌 Setting Description: ${value}`);
                    html += `<tr><td colspan="2" class="section-title">Description</td></tr>
                             <tr><td colspan="2"><p class="product-description">${value}</p></td></tr>`;
                    break;
            
                case "What it Covers":
                    console.log(`📌 Processing "What it Covers"`);
                    html += `<tr><td colspan="2" class="section-title">✅ Key Features</td></tr><tr><td colspan="2"><ul>`;
                    for (let i = rowIndex + 1; i < data.length; i++) {
                        if (!data[i].field) {
                            console.log(`➕ Adding Key Feature: ${data[i].value}`);
                            html += `<li>${data[i].value}</li>`; 
                        } else {
                            break; 
                        }
                    }
                    html += `</ul></td></tr>`;
                    break;
            
                case "Ideal For":
                    console.log(`📌 Processing "Ideal For"`);
                    html += `<tr><td colspan="2" class="section-title">📌 Ideal For</td></tr><tr><td colspan="2"><ul>`;
                    let idealForList = "";
                    for (let i = rowIndex + 1; i < data.length; i++) {
                        if (!data[i].field) {
                            console.log(`➕ Adding Ideal For: ${data[i].value}`);
                            idealForList += `<li>${data[i].value}</li>`;
                        } else {
                            break;
                        }
                    }
                    html += idealForList || "<li>Not specified</li>";
                    html += `</ul></td></tr>`;
                    break;
            
                case "Unit Cost":
                case "Unit Price":
                    console.log(`📌 Setting Pricing Info: ${field} - ${value}`);
                    html += `<tr><td colspan="2" class="section-title">💲 Pricing</td></tr>
                             <tr><td colspan="2"><strong>${field}:</strong> ${value}</td></tr>`;
                    break;
            
                case "What is Excluded":
                    console.log(`📌 Processing "What is Excluded"`);
                    html += `<tr><td colspan="2" class="section-title">❌ What is Excluded</td></tr><tr><td colspan="2"><ul>`;
                    let exclusions = `<li>${value}</li>`;
                    for (let i = rowIndex + 1; i < data.length; i++) {
                        if (!data[i].field) {
                            console.log(`➕ Adding Exclusion: ${data[i].value}`);
                            exclusions += `<li>${data[i].value}</li>`;
                        } else {
                            break;
                        }
                    }
                    html += exclusions;
                    html += `</ul></td></tr>`;
                    break;
            
                case "Pros":
                    console.log(`📌 Processing "Pros"`);
                    html += `<tr><td colspan="2" class="section-title">✅ Pros</td></tr><tr><td colspan="2"><ul><li>${value}</li>`;
                    for (let i = rowIndex + 1; i < data.length; i++) {
                        if (!data[i].field) {
                            console.log(`➕ Adding Pro: ${data[i].value}`);
                            html += `<li>${data[i].value}</li>`;
                        } else {
                            break;
                        }
                    }
                    html += `</ul></td></tr>`;
                    break;
            
                case "Cons":
                    console.log(`📌 Processing "Cons"`);
                    html += `<tr><td colspan="2" class="section-title">❌ Cons</td></tr><tr><td colspan="2"><ul><li>${value}</li>`;
                    for (let i = rowIndex + 1; i < data.length; i++) {
                        if (!data[i].field) {
                            console.log(`➕ Adding Con: ${data[i].value}`);
                            html += `<li>${data[i].value}</li>`;
                        } else {
                            break;
                        }
                    }
                    html += `</ul></td></tr>`;
                    break;
            
                case "Frequently Asked Questions":
                    console.log(`📌 Processing "Frequently Asked Questions"`);
                    html += `<tr><td colspan="2" class="section-title">❓ FAQs</td></tr><tr><td colspan="2"><ul><li>${value}</li></ul></td></tr>`;
                    break;
            
                case "Terms and Conditions":
                    console.log(`📌 Processing "Terms and Conditions"`);
                    html += `<tr><td colspan="2" class="section-title footer">🔗 Terms & Conditions | Contact Info</td></tr>
                             <tr><td colspan="2"><p class="product-terms">${value || "Not provided"}</p></td></tr>`;
                    break;
            
                default:
                    console.warn(`⚠️ Unrecognized Field: '${field}' with Value: '${value}'`);
                    break;
                }
            }
        let html="";

        // ✅ Ensure `html` is correctly built before rendering
        html += `
            <div class="factsheet">
                <div class="hero-section">
                    ${heroImage}
                    <div class="title-container">
                        <h1 class="product-title">Pay-As-You-Go IT Support</h1>
                        <h3 class="product-tagline">If you want to get ahead... Get a Hat. Making excellence a Rabbit.</h3>
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

        // ✅ Ensure HTML is set correctly
        if (!html.trim()) {
            console.error("❌ HTML content is empty before rendering!");
        } else {
            factsheetDiv.innerHTML = html;
        }
    } else {
        console.error("❌ No valid data found.");
        factsheetDiv.innerHTML = '<p>No data found in the Google Sheet.</p>';
    }
}

fetchSheetData("Pay As You Go");
