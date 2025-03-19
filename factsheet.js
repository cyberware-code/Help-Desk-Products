// FACTSHEET SCRIPT VERSION: 2.1.0
console.log("🚀 FACTSHEET SCRIPT VERSION: 2.1.0 LOADED");

// Function to fetch data from Google Sheets
function fetchSheetData(sheetId, gid, callback) {
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&tq=&gid=${gid}`;
    console.log("📢 Fetching data from:", sheetUrl);

    fetch(sheetUrl)
        .then(response => response.text())
        .then(text => {
            const match = text.match(/google.visualization.Query.setResponse\(([\s\S]*)\);/);
            if (!match || match.length < 2) {
                throw new Error("Invalid response format from Google Sheets.");
            }

            const jsonData = JSON.parse(match[1]);

            if (!jsonData.table || !jsonData.table.rows) {
                throw new Error("No table data found in the response.");
            }

            console.log("📥 Successfully retrieved", jsonData.table.rows.length, "rows from Google Sheets.");
            callback(jsonData.table.rows);
        })
        .catch(error => {
            console.error("❌ Error fetching sheet data:", error);
        });
}

// Function to render the factsheet
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
                    console.warn(`⚠️ Unrecognized Field: '${field}' with Value: 
