const fs = require('fs');
const path = require('path');

// =====================================================================
// 1. GLOBAL KONFIGURATION
// =====================================================================
const CONFIG = {
    baseLang: 'de',          
    targetLangs: ['en', 'es', 'fr', 'it', 'nl', 'sv', 'pl', 'pt', 'tr', 'ja', 'ko', 'hi', 'da', 'cs', 'no', 'fi', 'ar', 'id'],
    useAI: false,            
    openaiKey: 'DEIN_OPENAI_API_KEY_HIER', 
};

console.log('🚀 Starte das C.O.R.E. pSEO Build-System...\n');

// =====================================================================
// 2. KI-ÜBERSETZUNG (Unverändert gelassen)
// =====================================================================
async function translateWithGPT(content, targetLang, isJson = false) {
    // ... [Dein bestehender Übersetzungs-Code bleibt hier exakt gleich] ...
    if (!CONFIG.openaiKey || CONFIG.openaiKey.startsWith('DEIN')) {
        console.error('❌ KI abgebrochen: Kein API Key.');
        return content;
    }

           const systemPrompt = isJson 
        ? `You are an expert technical translator for psychometric data. Translate the values of the following JSON into language code "${targetLang}". 

CRITICAL TECHNICAL RULES:
1. ONLY translate the string values of these specific keys: "name", "cluster", "seo_title", "seo_desc", "infobox", "seo_deepdive_h2", "seo_deepdive_text", "faq_q1", "faq_a1", "question", "text", "corporate_view", "shadow_conflict", "headline", "base_type", "fear_mutation".
2. DO NOT TOUCH or translate ANY JSON keys (the text before the colon).
3. DO NOT TOUCH the values for "slug", "profile_id", "category", or "id". They MUST remain exactly the same in every language to keep the URL routing and JS logic intact.
4. DO NOT translate any placeholders wrapped in curly braces or brackets, such as {{JOB_NAME}}, {{JOB_CLUSTER}}, or [Branche]. Keep them exactly as they are.
5. For arrays (like "action_steps"): translate the strings inside the array, but keep the array structure intact.
6. Tone: Keep the psychological tone direct, unpolished, and brutally honest (no toxic positivity).
7. Return ONLY valid, parsable JSON. No markdown formatting, no backticks like \`\`\`json.`
        
        : `You are an expert web UI translator. Translate the visible text of this HTML into language code "${targetLang}". 

CRITICAL TECHNICAL RULES:
1. NEVER translate placeholders like {{JOB_NAME}}, {{CROSS_LINKS}}, {{SEO_TITLE}}, etc. They must remain exactly as they are.
2. Update the language attribute in the HTML tag (e.g., change <html lang="de"> to <html lang="${targetLang}">).
3. KEEP ALL HTML tags, attributes (href, id, class, style), and JavaScript logic 100% intact. Only translate the human-readable text between the tags.
4. Output ONLY the raw HTML code. Do not wrap your response in markdown code blocks like \`\`\`html.`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CONFIG.openaiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-5.4-mini', 
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: content }
                ],
                temperature: 0.1
            })
        });

                const data = await response.json();

        // 🚨 NEU: Fehler von OpenAI abfangen und ausgeben
        if (data.error) {
            console.error(`\n🚨 OPENAI API FEHLER: ${data.error.message}\n`);
            throw new Error(data.error.message); // Bricht hier ab und springt in den catch-Block
        }

        // Wenn alles gut ging, Text verarbeiten
        let result = data.choices[0].message.content.trim();
        if (isJson) result = result.replace(/^```json\s*|```$/g, ''); 
        if (!isJson) result = result.replace(/^```html\s*|```$/g, ''); 
        return result;

    } catch (err) {
        // Hier landet jetzt der OpenAI-Fehler und wird uns in der Konsole gezeigt!
        console.error(`❌ Fehler bei der KI-Übersetzung:`, err.message || err);
        throw err; // WICHTIG: Das wirft den Fehler an die Retry-Schleife weiter!
    }
}

// =====================================================================
// 3. SPRACH-ORDNER GENERIEREN (Unverändert gelassen)
// =====================================================================
// =====================================================================
// 3. SPRACH-ORDNER GENERIEREN (Mit Chunking & Retry-Sicherheit)
// =====================================================================
async function checkAndTranslateSources() {
    if (!CONFIG.useAI) return;

    for (const lang of CONFIG.targetLangs) {
        const targetSrcDir = path.join(__dirname, 'src', lang);
        const baseSrcDir = path.join(__dirname, 'src', CONFIG.baseLang);

        if (!fs.existsSync(targetSrcDir) || fs.readdirSync(targetSrcDir).length === 0) {
            console.log(`🤖 KI übersetzt Daten von [${CONFIG.baseLang}] nach [${lang}]...`);
            fs.mkdirSync(targetSrcDir, { recursive: true });

            const files = fs.readdirSync(baseSrcDir);
            for (const file of files) {
                console.log(`\n 📝 Bearbeite: ${file}...`);
                const content = fs.readFileSync(path.join(baseSrcDir, file), 'utf8');
                const isJson = file.endsWith('.json');

                if (isJson) {
                    // JSON in Pakete aufteilen, damit die KI nicht abbricht
                    let dataArray = JSON.parse(content);
                    // Wenn es kein Array ist (z.B. ein einfaches Objekt), machen wir ein Array daraus
                    if (!Array.isArray(dataArray)) dataArray = [dataArray]; 

                    let translatedArray = [];
                    const chunkSize = 10; // Wir senden 10 Berufe pro API-Call

                    for (let i = 0; i < dataArray.length; i += chunkSize) {
                        const chunk = dataArray.slice(i, i + chunkSize);
                        console.log(`    ⏳ Übersetze Block ${Math.floor(i / chunkSize) + 1} von ${Math.ceil(dataArray.length / chunkSize)}...`);
                        
                        let attempt = 0;
                        let success = false;
                        
                        // Retry-Logik: Versuche es bis zu 3x, falls die API zickt
                        while (attempt < 3 && !success) {
                            try {
                                const chunkString = JSON.stringify(chunk, null, 2);
                                const translatedChunkString = await translateWithGPT(chunkString, lang, true);
                                const translatedChunk = JSON.parse(translatedChunkString); // Check ob valides JSON
                                
                                translatedArray.push(...translatedChunk);
                                success = true;
                            } catch (e) {
                                attempt++;
                                console.log(`    ⚠️ Fehler in Block ${Math.floor(i / chunkSize) + 1}. Versuch ${attempt}/3...`);
                                if (attempt === 3) {
                                    console.error(`    ❌ Block final fehlgeschlagen! Übernehme Original-Text für diesen Block.`);
                                    translatedArray.push(...chunk); // Fallback auf Original
                                }
                            }
                        }
                    }
                    
                    // Speichere die wieder zusammengesetzte, übersetzte JSON
                    fs.writeFileSync(path.join(targetSrcDir, file), JSON.stringify(translatedArray, null, 4), 'utf8');
                    console.log(` ✅ ${file} komplett übersetzt!`);

                } else {
                    // HTML-Dateien wie index-master.html werden am Stück übersetzt
                    const translated = await translateWithGPT(content, lang, false);
                    fs.writeFileSync(path.join(targetSrcDir, file), translated, 'utf8');
                    console.log(` ✅ ${file} komplett übersetzt!`);
                }
            }
            console.log(`\n🎉 [${lang}] Ordner erfolgreich fertiggestellt!\n`);
        }
    }
}

// =====================================================================
// 4. HAUPT-BUILD ENGINE (Angepasst für das neue Hub-Design)
// =====================================================================
async function buildEngine() {
    await checkAndTranslateSources();

    const allLangs = [CONFIG.baseLang, ...CONFIG.targetLangs];
    const baseOutputDir = path.join(__dirname, 'docs');
    if (!fs.existsSync(baseOutputDir)) fs.mkdirSync(baseOutputDir);

    allLangs.forEach(lang => {
        const currentSrcDir = path.join(__dirname, 'src', lang);
        const outputDir = path.join(__dirname, 'docs', lang);

        if (!fs.existsSync(currentSrcDir)) return;
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        console.log(`🌍 Generiere HTML für: [${lang.toUpperCase()}]`);

        // Kopiere JSONs
        fs.copyFileSync(path.join(currentSrcDir, 'questions.json'), path.join(outputDir, 'questions.json'));
        fs.copyFileSync(path.join(currentSrcDir, 'profiles.json'), path.join(outputDir, 'profiles.json'));

        const professions = JSON.parse(fs.readFileSync(path.join(currentSrcDir, 'professions.json'), 'utf8'));
        
        let indexTemplate = "";
        try { indexTemplate = fs.readFileSync(path.join(currentSrcDir, 'index-master.html'), 'utf8'); } 
        catch (e) { console.error("Fehler: index-master.html fehlt!"); return; }

        // --- HIER PASSIERT DIE NEUE CLUSTER-MAGIE FÜR DIE HUB-SEITE ---
        const clusteredProfessions = {};

        // 1. Berufe generieren und in Cluster sortieren
        professions.forEach(prof => {
            let fileName = `karriere-test-${prof.slug}.html`;
            
            // SEO Interlinking (5 verwandte Berufe aus dem gleichen Cluster)
            let crossLinksHTML = professions
                .filter(p => p.slug !== prof.slug && p.cluster === prof.cluster)
                .slice(0, 5)
                .map(p => `<a href="karriere-test-${p.slug}.html" style="display: inline-block; background: var(--bg-body, #fff); padding: 8px 18px; margin: 0 10px 10px 0; border-radius: 50px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted, #64748B); text-decoration: none; border: 1px solid var(--border-light, #E2E8F0); transition: all 0.2s;">${p.name}</a>`)
                .join('');

            // Platzhalter ersetzen
           
                 let content = indexTemplate
                .replace(/\{\{LANG\}\}/g, lang)
                .replace(/\{\{JOB_SLUG\}\}/g, prof.slug || '')
                .replace(/\{\{JOB_NAME\}\}/g, prof.name || '')
                .replace(/\{\{JOB_CLUSTER\}\}/g, prof.cluster || '')
                .replace(/\{\{CROSS_LINKS\}\}/g, crossLinksHTML)
                .replace(/\{\{INFOBOX_CONTENT\}\}/g, prof.infobox || '')
                .replace(/\{\{SEO_TITLE\}\}/g, prof.seo_title || `Karriere-Analyse für ${prof.name} | C.O.R.E. Index`)
                .replace(/\{\{SEO_DESC\}\}/g, prof.seo_desc || `Entdecke deine beruflichen Hürden als ${prof.name}.`)
                .replace(/\{\{SEO_DEEPDIVE_H2\}\}/g, prof.seo_deepdive_h2 || '')
                .replace(/\{\{SEO_DEEPDIVE_TEXT\}\}/g, prof.seo_deepdive_text || '')
                .replace(/\{\{FAQ_Q1\}\}/g, prof.faq_q1 || '')
                .replace(/\{\{FAQ_A1\}\}/g, prof.faq_a1 || ''); 

            fs.writeFileSync(path.join(outputDir, fileName), content, 'utf8');

            // Ins Cluster-Objekt für die Hub-Seite einsortieren
            const clusterName = prof.cluster || 'Weitere Berufe';
            if (!clusteredProfessions[clusterName]) clusteredProfessions[clusterName] = [];
            clusteredProfessions[clusterName].push({ name: prof.name, file: fileName });
        });

        // 2. Das High-End HTML für die Hub-Seite (Verzeichnis) bauen
        let clusterBlocksHTML = '';
        for (const [cluster, jobs] of Object.entries(clusteredProfessions)) {
                    let jobLinks = jobs.map(j => `
                <a href="${j.file}" class="job-link">
                    <span style="font-size: 1.1rem; font-weight: 500;">${j.name}</span>
                    <span class="arrow">&rarr;</span>
                </a>
            `).join('');

            clusterBlocksHTML += `
                <div style="margin-bottom: 60px;">
                    <h2 style="font-size: 1.5rem; text-transform: uppercase; letter-spacing: 2px; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px;">${cluster}</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 0 40px;">
                        ${jobLinks}
                    </div>
                </div>
            `;
        }

                              // 3. Lade die (bereits durch KI übersetzte) hub-master.html
        let hubTemplate = "";
        try { 
            hubTemplate = fs.readFileSync(path.join(currentSrcDir, 'hub-master.html'), 'utf8'); 
        } catch (e) { 
            console.error(`❌ Fehler: hub-master.html fehlt im Ordner src/${lang}!`); 
            return; 
        }

        // Setze die fertig generierten Cluster-Blöcke in den Platzhalter ein
        let finalHubHTML = hubTemplate
            .replace(/\{\{CLUSTER_BLOCKS\}\}/g, clusterBlocksHTML)
            .replace(/\{\{LANG\}\}/g, lang); // Zur Sicherheit die Sprache setzen

        fs.writeFileSync(path.join(outputDir, 'index.html'), finalHubHTML, 'utf8');
        
        
        

        console.log(`✅ ${professions.length} pSEO Seiten & Hub für [${lang}] erstellt.`);
    });
    
    console.log('\n🚀 Build-Prozess komplett abgeschlossen! Alle Dateien liegen im "docs" Ordner.');
}

buildEngine();