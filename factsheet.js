// FACTSHEET SCRIPT VERSION: 2.3.1
console.log("🚀 FACTSHEET SCRIPT VERSION: 2.3.1");

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

    let currentSection = '';
    let sectionContent = '';
    let sectionHtml = '';
    let sections = [];

    // Iterate over the data rows
    data.forEach((row, index) => {
        const field = row.c[0] && row.c[0].v ? row.c[0].v.trim() : ""; // A column (section header)
        const value = row.c[1] && row.c[1].v ? row.c[1].v.trim() : ""; // B column (content)

        // Skip empty rows or rows with no data
        if (!field.trim() && !value.trim()) {
            return;
        }

        // If we encounter a new section, push the previous section HTML to sections
        if (field && currentSection && currentSection !== field) {
            sections.push({ title: currentSection, content: sectionContent });
            sectionContent = ''; // Reset the section content
        }

        // Process the field as section header
        if (field) {
            currentSection = field;
        }

        // Process the content of the section
        if (value) {
            // Split the content by lines, and treat each line as a paragraph unless it starts with '-'
            const lines = value.split('\n').map(line => line.trim());

            lines.forEach(line => {
                if (line.startsWith('-')) {
                    // Bullet point: add as a list item
                    sectionContent += `<ul><li>${line.substring(1).trim()}</li></ul>`;
                } else {
                    // Regular paragraph: add as a paragraph
                    sectionContent += `<p>${line}</p>`;
                }
            });
        }
    });

    // Push the last section (if any)
    if (currentSection && sectionContent) {
        sections.push({ title: currentSection, content: sectionContent });
    }

    // Generate the final HTML structure
    sections.forEach(section => {
        html += `
            <div class="factsheet-section">
                <h2 class="section-title">${section.title}</h2>
                <div class="section-content">${section.content}</div>
            </div>
        `;
    });

    // Insert the final HTML into the factsheet container
    factsheetDiv.innerHTML = html;
}
