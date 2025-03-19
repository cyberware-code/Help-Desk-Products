// FACTSHEET SCRIPT VERSION: 2.1.0
console.log("🚀 FACTSHEET SCRIPT VERSION: 2.1.0");

function fetchSheetData(sheetName) {
    // Define your Google Sheets URL here
    const sheetURL = `https://docs.google.com/spreadsheets/d/your_spreadsheet_id/gviz/tq?tqx=out:json&tq=&gid=${sheetName}`;

    fetch(sheetURL)
        .then(response => response.json())
        .then(data => {
            console.log("📊 Data Retrieved:", data);
            renderFactsheet(data.table.rows); // Pass the rows to the render function
        })
        .catch(error => {
            console.error("❌ Error fetching sheet data:", error);
        });
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
                    productName = `<h1 class="product-title">${value}</h1>`;
                    break;
                
                case "Tagline":
                    tagline = `<h3 class="product-tagline">${value}</h3>`;
                    break;
                
                case "Description":
                    description = `<p class="product-description">${value}</p>`;
                    break;
                
                case "What it Covers":
                    features += `<li>${value}</li>`;
                    break;
                
                case "Ideal For":
                    idealFor += `<li>${value}</li>`;
                    break;
                
                case "Unit Cost":
                case "Unit Price":
                    pricing += `<strong>${field}:</strong> ${value}<br>`;
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
                    terms += `<p>${value}</p>`;
                    break;

                default:
                    console.warn(`⚠️ Unrecognized Field: '${field}' with Value: '${value}'`);
                    break;
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

// Example call to fetch the factsheet data
fetchSheetData('Pay As You Go');
