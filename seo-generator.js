// ==========================================
//  C.O.R.E. SEO-Profile optimieren (GPT-4o)
// ==========================================
const fs = require('fs');
const path = require('path');

// ==========================================
// 1. HIER DEINEN OPENAI API-KEY EINTRAGEN
// ==========================================
const API_KEY = "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";

const inputPath = path.join(__dirname, 'professions.json');
const outputPath = path.join(__dirname, 'professions_optimiert.json');

// Hilfsfunktion für eine kurze Pause (Rate-Limit-Schutz)
const delay = ms => new Promise(res => setTimeout(res, ms));

async function generateProfessionSEO(jobName, cluster) {
    const prompt = `
Du bist ein erfahrener Arbeitspsychologe, Karriere-Diagnostiker und Top-Tier SEO Copywriter (Level: McKinsey / High-End SaaS). 
Erstelle für den Beruf "${jobName}" (Cluster: ${cluster}) die tiefenpsychologischen SEO-Inhalte für eine Landingpage.

DEINE REGELN UND CONSTRAINTS (STRIKT EINHALTEN):
1. **Kein KI-Bullshit:** Verwende NIEMALS typische KI-Wörter wie "revolutionär", "maßgeschneidert", "entfesseln", "transformieren", "Navigieren in der heutigen schnelllebigen Welt", "Tauche ein" oder "Synergien".
2. **Tonalität (E-E-A-T):** Analytisch, direkt, radikal ehrlich. Keine toxische Positivität. Du musst den wahren, ungeschönten Schmerz (Pain Point) und die systemischen Hürden des Berufs "${jobName}" exakt treffen. Nutze echtes Branchen-Vokabular.
3. **Zeichenlimits (HART):** 
   - 'seo_title': MAXIMAL 60 Zeichen. Struktur: "[Nutzen] für [Beruf] | C.O.R.E."
   - 'seo_desc': MAXIMAL 160 Zeichen. Muss den Schmerz ansprechen und eine Lösung bieten.

ZU BEFÜLLENDE FELDER (als JSON):
- "seo_title": (max 60 Zeichen)
- "seo_desc": (max 160 Zeichen)
- "infobox": Ein Absatz, der EXAKT mit "<strong>Die Realität als ${jobName}:</strong> " beginnt. Beschreibt den ungeschönten Branchenalltag.
- "seo_deepdive_h2": Eine Überschrift, die den psychologischen oder systemischen Kernkonflikt benennt.
- "seo_deepdive_text": Ein ca. 80-100 Wörter langer Absatz. Beschreibt, warum Standard-Tipps hier nicht helfen und wie unbewusste Ängste (z.B. Existenzangst, Imposter-Syndrom, Helfersyndrom, mangelnde Abgrenzung) die Person blockieren.
- "faq_q1": Eine sehr spezifische Frage aus dem Berufsalltag.
- "faq_a1": Die fundierte, seriöse Antwort.

HIER SIND 4 PERFEKTE BEISPIELE (GOLDEN STANDARD). 
Orientiere dich exakt an dieser Länge, Sprachqualität und psychologischen Tiefe, passe sie aber an die Realität von "${jobName}" an:

[
  {
    "seo_title": "Karriere- & Burnout-Test: Softwareentwickler | C.O.R.E.",
    "seo_desc": "Frustriert von Legacy-Code und endlosen Sprints? Der C.O.R.E. Test analysiert deine wahren beruflichen Blockaden in der Tech-Branche. Komplett kostenfrei.",
    "infobox": "<strong>Die Realität als Softwareentwickler:</strong> Als Entwickler jonglierst du täglich zwischen unklaren Anforderungen, technischer Schuld (Legacy-Code) und unrealistischen Sprint-Zielen. Oft bist du gefangen zwischen dem eigenen Qualitätsanspruch (Clean Code) und dem Druck des Managements (Time-to-Market). Das ständige Aufholen neuer Frameworks befeuert das Imposter-Syndrom, während endlose Daily-Standups den für Deep Work nötigen Fokus zerstören.",
    "seo_deepdive_h2": "Warum Clean Code nicht vor dem Burnout schützt",
    "seo_deepdive_text": "Einem Entwickler wird oft geraten, einfach klarer zum Produktmanager 'Nein' zu sagen. In der Realität bist du jedoch oft der Flaschenhals zwischen fehlerhaften Altsystemen und unerbittlichen Release-Zyklen. Die ständige kognitive Überlastung durch Kontextwechsel führt zu chronischer Erschöpfung. Der C.O.R.E. Index dekonstruiert diese Dynamik: Wir analysieren objektiv, ob dein Verbleib in toxischen Tech-Umgebungen durch Versagensangst, mangelnde Abgrenzung oder die bloße Bequemlichkeit eines gut bezahlten 'goldenen Käfigs' motiviert ist.",
    "faq_q1": "Wie hilft mir dieser Test bei meinem Imposter-Syndrom?",
    "faq_a1": "Der Index misst keine fachliche Seniorität. Er isoliert psychometrisch exakt jene unbewussten Ängste, die dazu führen, dass du trotz exzellenter Skills ständig an dir zweifelst und dich in Verhandlungen unter Wert verkaufst."
  },
  {
    "seo_title": "Burnout-Test für Pflegekräfte: C.O.R.E. Diagnostik",
    "seo_desc": "Am Limit im Schichtdienst? Finde heraus, ob das System oder fehlende Abgrenzung dich in den Burnout treiben. Fundierter, psychologischer Test für die Pflege.",
    "infobox": "<strong>Die Realität als Pflegekraft:</strong> Dein Beruf fordert emotionale und physische Höchstleistungen. Der systematische Personalmangel zwingt dich dazu, echte menschliche Zuwendung einer gnadenlosen Taktung unterzuordnen. Dieses Umfeld nutzt das Helfersyndrom gnadenlos aus: Man macht unbezahlte Überstunden und springt an freien Tagen ein, weil man Patienten und das restliche Team nicht im Stich lassen kann – ein direkter Weg in die Erschöpfungsdepression.",
    "seo_deepdive_h2": "Der moralische Druck: Wenn Abgrenzung unmöglich scheint",
    "seo_deepdive_text": "Einem Büroangestellten kann man raten, um 17 Uhr den Stift fallen zu lassen. In der Pflege bedeutet 'Dienst nach Vorschrift' oft, dass echte Menschen leiden. Dieser moralische Erpressungsmechanismus führt dazu, dass Pflegekräfte systematisch ihre eigenen Grenzen überschreiten. Unser diagnostisches Verfahren zeigt dir schwarz auf weiß auf, inwieweit dein intrinsisches Helfersyndrom und die Angst vor Konflikten dich in einer gefährlichen Abwärtsspirale aus Erschöpfung und unbezahlter Mehrarbeit festhalten.",
    "faq_q1": "Ersetzt dieses Assessment eine ärztliche Burnout-Diagnose?",
    "faq_a1": "Nein. Es ist eine psychometrische Kausalitätsanalyse deines Arbeitsalltags im klinischen Umfeld. Bei akuter physischer oder psychischer Erschöpfung kontaktiere bitte umgehend medizinisches Fachpersonal."
  },
  {
    "seo_title": "Karriere-Diagnostik: Marketing Manager | C.O.R.E.",
    "seo_desc": "Gefangen im ROI-Druck und ständigen Rechtfertigungen? Entdecke deine beruflichen Blockaden im Marketing. Direkt, fundiert und ohne toxische Positivität.",
    "infobox": "<strong>Die Realität als Marketing Manager:</strong> Du stehst unter permanentem ROI-Druck, während fast jeder Stakeholder im Unternehmen meint, deinen Job besser zu verstehen. Die Grenzen zwischen Arbeit und Freizeit verschwimmen durch die 'Always-On'-Mentalität. Gleichzeitig musst du dich ständig beweisen und Erfolge nach außen verkaufen, was unweigerlich zu einer toxischen Kultur der Selbstdarstellung führt.",
    "seo_deepdive_h2": "Die Erschöpfung durch ständige Sichtbarkeit",
    "seo_deepdive_text": "Im Marketing wird erwartet, dass man stets kreativ, dynamisch und motiviert auftritt. Gleichzeitig bist du oft der Sündenbock, wenn utopische Wachstumsziele des Managements nicht erreicht werden. Die Notwendigkeit, intern als ewiger Optimist auftreten zu müssen, brennt auf Dauer massiv aus. Der C.O.R.E. Index durchleuchtet, ob deine aktuelle Stagnation auf inkompetente Unternehmensstrukturen zurückzuführen ist, oder ob Statusangst und das Bedürfnis nach ständiger externer Validierung dich lähmen.",
    "faq_q1": "Berücksichtigt der Test den Unterschied zwischen Agentur und Inhouse?",
    "faq_a1": "Ja. Die Metrik bewertet Konfliktmuster, die sowohl im Agentur-Umfeld (extremer Pitch-Druck, Überstunden) als auch in Inhouse-Corporate-Strukturen (Politik und Bürokratie) auftreten."
  },
  {
    "seo_title": "Karriere-Test für Handwerk & Technik | C.O.R.E.",
    "seo_desc": "Ausgebremst von Bürokratie und Inkompetenz? Analysiere deine Frustration im Handwerk und finde klare Lösungswege. Pragmatisch und wissenschaftlich fundiert.",
    "infobox": "<strong>Die Realität als Handwerker & Techniker:</strong> Du bist derjenige, der theoretische, oft absurde Pläne aus dem Büro in der harten Realität umsetzen muss. Lieferengpässe, Pfusch von Vorgängern und Preisdruck gehören zum Alltag. Wenn du pragmatisch durchgreifst, stößt du auf bürokratische Hürden. Die Frustration steigt enorm, wenn echte Macher von inkompetenten Strukturen und sinnlosen Vorschriften ausgebremst werden.",
    "seo_deepdive_h2": "Macher in einem System aus theoretischer Inkompetenz",
    "seo_deepdive_text": "Als Techniker oder Handwerker bist du es gewohnt, Probleme greifbar und direkt zu lösen. Der absolute Motivationskiller entsteht, wenn du durch praxisferne Planer oder unfähiges Projektmanagement künstlich behindert wirst. Anstatt zu erschaffen, verbringst du deine Zeit mit Mängelverwaltung. Dieser Test analysiert präzise, wie du mit diesem systemischen Frust umgehst – ob du in Zynismus verfällst oder ob unbewusste Existenzängste dich davor abhalten, den Schritt in die Selbstständigkeit zu wagen.",
    "faq_q1": "Ich arbeite nicht im Büro. Funktioniert die Auswertung trotzdem für mich?",
    "faq_a1": "Absolut. Der Test verzichtet komplett auf 'Corporate Bullshit'. Er misst reale psychologische Reaktionen auf echten Stress, unklare Anweisungen und die direkte Verantwortung am Bau oder an der Maschine."
  }
]

GIB AUSSCHLIESSLICH EIN GÜLTIGES JSON-OBJEKT FÜR "${jobName}" ZURÜCK!
`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-5.4",
                response_format: { type: "json_object" }, 
                messages: [
                    { role: "system", content: "Du gibst ausschließlich JSON aus." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7 
            })
        });

        if (!response.ok) {
            const errBody = await response.text();
            throw new Error(`API Fehler: ${response.status} - ${errBody}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        
        return JSON.parse(content);
        
    } catch (error) {
        console.error(`❌ Fehler bei ${jobName}:`, error.message);
        return null;
    }
}

async function processProfessions() {
    console.log('🚀 Starte KI-Generierung für professions.json mit GPT-4o...\n');
    
    if (!fs.existsSync(inputPath)) {
        console.error('❌ Fehler: professions.json nicht gefunden im Ordner', __dirname);
        return;
    }
    
    const professions = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    console.log(`📌 ${professions.length} Berufe gefunden. Generierung läuft...\n`);

    const professionsOptimiert = [];

    for (let i = 0; i < professions.length; i++) {
        let prof = professions[i];
        
        if (prof.seo_title && prof.seo_deepdive_text) {
            console.log(`⏭️ [${i+1}/${professions.length}] ${prof.name} bereits optimiert, überspringe.`);
            professionsOptimiert.push(prof);
            continue;
        }

        console.log(`⏳ [${i+1}/${professions.length}] Generiere Deep-Dive für: ${prof.name}...`);
        
        const generatedData = await generateProfessionSEO(prof.name, prof.cluster);
        
        if (generatedData) {
            const profGesichert = {
                ...prof, 
                ...generatedData 
            };
            professionsOptimiert.push(profGesichert);
        } else {
            professionsOptimiert.push(prof);
        }

        // Nach jedem Beruf speichern
        fs.writeFileSync(outputPath, JSON.stringify(professionsOptimiert, null, 2), 'utf8');

        // Kurze Pause für Rate-Limiting
        await delay(1500);
    }

    console.log('\n✅ FERTIG! Alle Berufe wurden erfolgreich optimiert und in professions_optimiert.json gespeichert.');
    console.log('👉 Benenne nun "professions_optimiert.json" in "professions.json" um und starte dein Build-Skript!');
}

processProfessions();