const fs = require('fs');
const path = require('path');

// =====================================================================
// KONFIGURATION
// =====================================================================
const BASE_URL = 'https://www.coreindexanalytics.com';
const DOCS_DIR = path.join(__dirname, 'docs');
const SITEMAP_FILE = path.join(DOCS_DIR, 'sitemap.xml');

console.log('🗺️ Starte Sitemap-Generierung...');

// =====================================================================
// HILFSFUNKTION: Alle HTML-Dateien rekursiv finden
// =====================================================================
function getHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getHtmlFiles(filePath, fileList);
        } else if (filePath.endsWith('.html')) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

// =====================================================================
// SITEMAP BAUEN
// =====================================================================
function generateSitemap() {
    if (!fs.existsSync(DOCS_DIR)) {
        console.error('❌ Fehler: Der "docs" Ordner existiert nicht. Bitte erst build.js ausführen.');
        return;
    }

    const allHtmlFiles = getHtmlFiles(DOCS_DIR);
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    let xmlUrls = '';

    allHtmlFiles.forEach(filePath => {
        // Pfad für die URL anpassen (Windows-Backslash zu Slash)
        let relativePath = filePath.replace(DOCS_DIR, '').replace(/\\/g, '/');
        
        // Den Root-Router (index.html im Hauptordner) ignorieren wir, da er "noindex" ist
        if (relativePath === '/index.html') return;

        // SEO-Prioritäten intelligent setzen
        let priority = '0.6'; // Standard für pSEO-Einzelseiten (karriere-test-xyz.html)
        let changefreq = 'monthly';

        if (relativePath.endsWith('/index.html')) {
            priority = '1.0'; // Die Hub-Seiten (Startseiten der Sprachen) sind am wichtigsten
            changefreq = 'weekly';
        } else if (relativePath.includes('methodik.html') || relativePath.includes('profile.html')) {
            priority = '0.8'; // Wichtige Unterseiten
        } else if (relativePath.includes('impressum.html') || relativePath.includes('datenschutz.html')) {
            priority = '0.1'; // Legal-Seiten sind für SEO unwichtig
            changefreq = 'yearly';
        }

        const url = `${BASE_URL}${relativePath}`;

        xmlUrls += `
    <url>
        <loc>${url}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>${changefreq}</changefreq>
        <priority>${priority}</priority>
    </url>`;
    });

    const sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;

    fs.writeFileSync(SITEMAP_FILE, sitemapXML, 'utf8');
    
    console.log(`✅ Sitemap erfolgreich erstellt! (${allHtmlFiles.length - 1} URLs hinzugefügt)`);
    console.log(`📂 Gespeichert unter: ${SITEMAP_FILE}`);
}

generateSitemap();