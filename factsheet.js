async function fetchSheetData(sheetName) {
    const SHEET_ID = '19U1S1RD2S0dY_zKgE2CPmTp-5O4VUSfXCCC0qLg0oq0'; 
    const API_KEY = 'AIzaSyBm8quffA_U1BTUnbBxXeLKuHYyEzLFX7E';

    // Fetch the list of available sheets
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties&key=${API_KEY}`;

    console.log(`Fetching sheet list from: ${metadataUrl}`);

    try {
        const metadataResponse = await fetch(metadataUrl);
        const metadata = await metadataResponse.json();

        console.log("Sheet Metadata:", metadata); // Debugging API response

        if (!metadata.sheets) {
            throw new Error("No sheets found in the Google Sheet.");
        }

        // Find the `gid` for the given `sheetName`
        const sheet = metadata.sheets.find(s => s.properties.title === sheetName);

        if (!sheet) {
            throw new Error(`Sheet '${sheetName}' not found.`);
        }

        const sheetId = sheet.properties.sheetId;
        console.log(`Found Sheet '${sheetName}' with GID: ${sheetId}`);

        // Fetch data using the correct `gid`
        const dataUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=&gid=${sheetId}`;

        console.log(`Fetching data from: ${dataUrl}`);

        const response = await fetch(dataUrl);
        const text = await response.text();
        const json = JSON.parse(text.substring(47, text.length - 2)); // Remove JSONP wrapper

        console.log("Raw Data from Google Sheets:", json);

        if (json.table && json.table.rows) {
            return renderFactsheet(json.table.rows);
        } else {
            console.error(`Error: No data found in sheet '${sheetName}'.`);
            document.getElementById('factsheet').innerHTML = `<p style="color:red;">Error: Unable to load '${sheetName}'.</p>`;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        document.getElementById('factsheet').innerHTML = `<p style="color:red;">Error fetching data: ${error}</p>`;
    }
}

function renderFactsheet(data) {
    const factsheetDiv = document.getElementById('factsheet');
    let html = '';
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
    let faqs = '';
    let terms = '';

    if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const row = data[i] || [];
            const field = row[0] ? row[0].trim() : "";
            const value = row[1] ? applyFormatting(row[1].trim()) : "";

            switch (field) {
                case "Image URL":
                    heroImage = `<img src="${value}" alt="Product Image" class="hero-image">`;
                    break;
                case "Product Name":
                    productName = `<h1>${value}</h1>`;
                    break;
                case "Tagline":
                    tagline = `<h3>${value}</h3>`;
                    break;
                case "Description":
                    description = `<p>${value}</p>`;
                    break;
                case "Key Features":
                    features += `<li>${value}</li>`;
                    break;
                case "Ideal For":
                    idealFor += `<li>${value}</li>`;
                    break;
                case "Pricing":
                    pricing = `<p>${value}</p>`;
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
                    faqs += `<li>${value}</li>`;
                    break;
                case "Terms and Conditions":
                    terms = `<p>${value}</p>`;
                    break;
            }
        }

        html = `
            ${heroImage}
            <div class="header">
                ${productName}
                ${tagline}
            </div>
            <div class="description">${description}</div>
            <div class="features">
                <h2>Key Features</h2>
                <ul>${features}</ul>
            </div>
            <div class="ideal-for">
                <h2>Ideal For</h2>
                <ul>${idealFor}</ul>
            </div>
            <div class="pricing">
                <h2>Pricing</h2>
                ${pricing}
            </div>
            <div class="exclusions">
                <h2>What is Excluded</h2>
                <ul>${exclusions}</ul>
            </div>
            <div class="pros-cons">
                <h2>Pros & Cons</h2>
                <h3>Pros</h3><ul>${pros}</ul>
                <h3>Cons</h3><ul>${cons}</ul>
            </div>
            <div class="faq">
                <h2>Frequently Asked Questions</h2>
                <ul>${faqs}</ul>
            </div>
            <div class="footer">
                <h2>Terms and Conditions</h2>
                ${terms}
            </div>
        `;
    } else {
        html = '<p>No data found in the Google Sheet.</p>';
    }

    factsheetDiv.innerHTML = html;
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
