function renderFactsheet(data) {
    console.log("\ud83d\ude80 Rendering Factsheet...");

    if (!Array.isArray(data) || data.length === 0) {
        console.error("\u274c Error: No data available to render.");
        return;
    }

    let prosList = [];
    let consList = [];
    let pricingInfo = "";
    let heroImageHtml = "";

    data.forEach(row => {
        if (!Array.isArray(row.c) || row.c.length < 2 || !row.c[0] || !row.c[0].v) {
            console.warn("\u26a0\ufe0f Skipping row due to invalid format:", row);
            return;
        }

        let field = row.c[0].v.trim();
        let value = row.c[1] ? row.c[1].v.trim() : "";

        console.log(`\u27a1\ufe0f Processing Row: Field='${field}', Value='${value}'`);

        switch (field) {
            case "Image URL":
                console.log("\ud83d\ude80 Setting Hero Image...");
                let heroImageElement = document.querySelector('.hero-image');
                if (heroImageElement) {
                    heroImageElement.src = value;
                    console.log("\u2705 Image URL Set:", value);
                } else {
                    console.warn("\u26a0\ufe0f Hero Image element not found!");
                }
                heroImageHtml = `<img src="${value}" class="hero-image" alt="Product Image" 
                      onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=No+Image+Available';">`;
                break;

            case "Product Name":
                console.log("\ud83d\udccc Setting Product Name:", value);
                document.querySelector('.product-title').textContent = value;
                break;

            case "Tagline":
                console.log("\ud83d\udccc Setting Tagline:", value);
                document.querySelector('.product-tagline').textContent = value;
                break;

            case "Description":
                console.log("\ud83d\udccc Setting Description:", value);
                document.querySelector('.product-description').textContent = value;
                break;

            case "Unit Cost":
            case "Unit Price":
                console.log("\ud83d\udccc Adding Pricing Info:", `${field} - ${value}`);
                pricingInfo += `<p><strong>${field}:</strong> ${value}</p>`;
                break;

            case "Pros":
                console.log("\ud83d\udccc Adding to 'Pros' List...");
                prosList.push(`<li>${value}</li>`);
                break;

            case "Cons":
                console.log("\ud83d\udccc Adding to 'Cons' List...");
                consList.push(`<li>${value}</li>`);
                break;

            case "Terms and Conditions":
                console.log("\ud83d\udccc Setting Terms & Conditions...");
                document.querySelector('.product-terms').innerHTML = value;
                break;

            default:
                console.warn(`\u26a0\ufe0f Unrecognized Field: '${field}' with Value: '${value}'`);
                break;
        }
    });

    document.querySelector('.pros-list').innerHTML = prosList.join('');
    document.querySelector('.cons-list').innerHTML = consList.join('');
    document.querySelector('.pricing-section').innerHTML = pricingInfo;

    if (heroImageHtml && !document.querySelector('.hero-image')) {
        document.querySelector('.hero-section').innerHTML = heroImageHtml;
    }

    console.log("\u2705 Factsheet Render Completed.");
}
