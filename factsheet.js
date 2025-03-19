// FACTSHEET SCRIPT VERSION: 2.1.3
console.log("🚀 FACTSHEET SCRIPT VERSION: 2.1.3");

const SPREADSHEET_ID = "19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0"; // ✅ Replace with correct ID
const SHEET_NAME = "Pay As You Go"; // ✅ Replace with the actual sheet name

function fetchSheetData(sheetName) {
    console.log(`📢 Fetching sheet metadata to get gid for: ${sheetName}`);

    // Construct the URL for metadata request
    const metadataUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

    fetch(metadataUrl)
        .then(response => response.text())
        .then(text => {
            console.log("📥 Raw Metadata Response:", text); // Debugging metadata response
            
            // Extract the JSON part from the response
            const json = JSON.parse(text.substring(47).slice(0, -2));
            
            if (!json.table || !json.table.cols) {
                throw new Error("Invalid metadata response format.");
            }

            // Find the correct GID for the requested sheet name
            const gid = getSheetGID(json, sheetName);
            
            if (!gid) {
                throw new Error(`Sheet '${sheetName}' not found in metadata.`);
            }

            console.log(`✔️ Sheet '${sheetName}' found with GID: ${gid}`);

            // Now fetch the actual sheet data
            const sheetDataUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=${gid}`;
            console.log("📡 Fetching Data from URL:", sheetDataUrl);

            return fetch(sheetDataUrl);
        })
        .then(response => response.text())
        .then(text => {
            console.log("📥 Raw Sheet Data Response:", text); // Debugging sheet response
            
            // Extract JSON from response
            const json = JSON.parse(text.substring(47).slice(0, -2));

            if (!json.table || !json.table.rows) {
                throw new Error("Invalid sheet data format.");
            }

            console.log("✅ Successfully retrieved sheet data:", json.table.rows.length, "rows");

            // Render the factsheet
            renderFactsheet(json.table.rows);
        })
        .catch(error => {
            console.error("❌ Error fetching sheet data:", error);
        });
}

// Function to extract the correct GID from metadata
function getSheetGID(metadata, sheetName) {
    if (!metadata.table || !metadata.table.cols) return null;
    
    for (const col of metadata.table.cols) {
        if (col.label && col.label.trim() === sheetName) {
            return col.id;
        }
    }
    
    return null; // No matching sheet name found
}

// Start fetching the factsheet
fetchSheetData(SHEET_NAME);
