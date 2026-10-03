/**
 * Contact Controller (MVCR - Controller Layer)
 * FormSubmit AJAX integration, ticket generator, anti-abuse filter, and mailto fallback
 */

export function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('contact-status');
  const submitBtn = document.getElementById('contact-submit-btn');
  if (!form || !submitBtn) return;

  const btnText = submitBtn.querySelector('.btn-text');
  const btnSpinner = submitBtn.querySelector('.btn-spinner');

  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');

  const firstNameWarning = document.getElementById('first-name-warning');
  const lastNameWarning = document.getElementById('last-name-warning');
  const emailWarning = document.getElementById('email-warning');
  const messageWarning = document.getElementById('message-warning');

  // Comprehensive Multilingual Verbal Abuse, Profanity & Toxicity Moderation Engine
  // Deeply expanded for Philippine Sociolinguistic, Maternal/Ancestral, Anatomical, and Regional Domains
  function detectAbuse(rawText) {
    if (!rawText || typeof rawText !== 'string') return false;
    const text = rawText.toLowerCase().trim();
    if (!text) return false;

    // False-positive exemptions for benign cultural names or sports
    if (/\b(?:lady\s+gaga|tae\s*kwon\s*do|taekwondo)\b/i.test(text)) {
      // If it only contains the benign phrase without other abusive tokens, allow it
      const strippedBenign = text
        .replace(/\b(?:lady\s+gaga|tae\s*kwon\s*do|taekwondo)\b/gi, '')
        .trim();
      if (!strippedBenign) return false;
    }

    // 1. Direct Regex Patterns (Word Boundaries, Slurs, Ancestral Insults, and Disguised Spellings)
    const directPatterns = [
      // 1. Maternal and Ancestral Insults (Maternal, Grandparents, Parents, Clan, Lineage Honor)
      // Catches: putang ina, tangina, taena, tngna, putaena, potaena, tanginamo, putang ina mo, PI mo, etc.
      /\b(?:p+[ou]+t+[a|e]*[e|i]+n+a+|p+[ou]+t+a+n+g+\s*[e|i]+n+a+|t+a+n+g+\s*[e|i]+n+a+|t+a+[e|i]+n+a+|p+t+n+g+[e|i]+n+a+|t+n+g+n+a+|t+n+g+i+n+a+)(?:\s*(?:m+o+|k+a+|n+y+o+|r+i+n+|d+i+n+))?\b/i,
      /\b(?:p+u+k+i+n+a+n+g+\s*[e|i]+n+a+|p+u+k+i+n+g+\s*[e|i]+n+a+|p+u+k+i+n+g+[e|i]+n+a+|p+u+k+i+n+a+n+g+[e|i]+n+a+)\b/i,
      /\b(?:p+[ou*@0]+t+a+|p+\*+t+a+|p+[ou]+t+r+a+g+i+s+|p+u+n+y+[e|i]+t+a+|p+a+n+y+[e|i]+t+a+|p+u+c+h+a+|p+u+t+e+k+)\b/i,
      /\b(?:a+n+a+k+\s+(?:k+a+n+g+\s+|k+a+\s+)?n+g+\s*(?:p+[ou]+t+a+|p+\*+t+a+|t+o+k+w+a+|t+e+t+e+n+g+|t+u+p+a+|t+i+n+a+p+a+|y+a+w+a+|b+a+k+a+n+g+|p+a+t+i+n+g+|b+w+i+s+i+t+|d+e+m+o+n+y+o+))\b/i,
      /\b(?:p+u+t+a+n+g+\s*i+n+a+\s*m+o+|t+a+n+g+i+n+a+\s*m+o+|t+a+e+n+a+\s*m+o+|p+o+t+a+e+n+a+\s*m+o+|p+\.?i+\.?\s*m+o+|p+\.?i+\b)/i,
      // Ancestral jabs targeting family honor: "lolo mo", "lola mo", "nanay mo", "tatay mo", "ina mo", "angkan mo", "lahi mo", "mukha ng lolo mo", etc.
      /\b(?:(?:m+u+k+h+a+|u+l+o+|a+m+o+y+|t+a+d+y+a+n+g+)\s+(?:n+g+\s+)?)?(?:l+o+l+[o|a]+|n+a+n+a+y+|t+a+t+a+y+|i+n+a+|a+m+a+|m+a+g+u+l+a+n+g+|a+n+g+k+a+n+|l+a+h+i+)\s*(?:m+o+|n+y+o+|n+i+n+y+o+|m+o+n+g+|n+i+n+y+o+n+g+|k+a+|k+a+y+o+)(?:\s*(?:r+i+n+|d+i+n+|p+a+n+o+t+|g+a+g+o+|b+o+b+o+|p+a+n+g+[e|i]+t+))?\b/i,
      /\b(?:i+n+a+|n+a+n+a+y+|t+a+t+a+y+|l+o+l+[o|a]+)\s*m+o+(?:\s*(?:r+i+n+|d+i+n+))?\b/i,

      // 2. Genital and Anatomical Profanities
      // Catches: puke, kiki, kepyas, kipyas, titi, utin, bayag, betlog, pekpek, pepe, puday, kupal, burat, tinggil
      /\b(?:p+u+k+[e|i]+|k+i+k+i+|k+e+p+y+a+[s|z]+|k+i+p+y+a+[s|z]+|k+i+p+a+y+|p+u+d+a+y+|t+i+n+g+g+i+l+)\b/i,
      /\b(?:t+i+t+i+|u+t+i+n+|u+t+e+n+|b+u+r+a+t+)\b/i,
      /\b(?:b+a+y+a+g+|b+e+t+l+o+g+|b+i+t+l+o+g+)\b/i,
      /\b(?:i+t+l+o+g+\s*m+o+)\b/i,
      /\b(?:p+e+k+p+e+k+|p+e+k+-+p+e+k+|p+e+p+e+\s*(?:m+o+|k+a+)?)\b/i,
      /\b(?:k+u+p+a+l+|k+o+p+a+l+|c+u+p+a+l+|k+u+p+a+l+o+)\b/i,
      /\b(?:k+a+n+t+[o|u]+t+|k+a+n+t+[o|u]+t+a+n+|c+h+u+p+a+|t+o+r+j+a+c+k+|j+a+k+[o|u]+l+|j+a+b+[o|u]+l+|s+a+l+s+a+l+)\b/i,

      // 3. Excretory and Bodily Function Terms
      // Catches: tae, tumae, amoy tae, mukhang tae, bwisit, buwisit, ihi, amoy ihi
      /\b(?:t+a+e+|t+u+m+a+e+)(?:\s*(?:k+a+|m+o+|k+a+y+o+|n+y+o+|p+a+|n+a+))?\b/i,
      /\b(?:a+m+o+y+|m+u+k+h+a+n+g+|p+u+r+o+)\s*t+a+e+\b/i,
      /\b(?:b+u?w+[i|e]+s+[i|e]+t+)(?:\s*(?:k+a+|m+o+|k+a+y+o+|n+y+o+))?\b/i,
      /\b(?:a+m+o+y+\s*i+h+i+|i+h+i+\s*(?:k+a+|m+o+|n+y+o+)|p+u+r+o+\s*i+h+i+)\b/i,

      // 4. Intellectual and Mental Degradation
      // Catches: gago, tanga, inutil, ulol, olog, bobo, sira-ulo, engot, ungas, timang, hangal, abnoy, buang, baliw
      /\b(?:g+a+g+[o|a]+|k+a+g+a+g+u+h+a+n+|g+a+g+u+h+a+n+|o+g+a+g+)\b/i,
      /\b(?:t+a+n+g+a+|k+a+t+a+n+g+a+h+a+n+|t+a+n+g+a+n+g+)\b/i,
      /\b(?:i+n+u+t+i+l+)\b/i,
      /\b(?:u+l+[o|u]+l+|o+l+[o|u]+l+|o+l+o+g+)\b/i,
      /\b(?:b+[o|u]+b+[o|a]+|k+a+b+o+b+o+h+a+n+)\b/i,
      /\b(?:s+i+r+a+[- ]*u+l+o+|s+i+r+a+u+l+o+n+g+|m+a+y+\s*s+i+r+a+\s*s+a+\s*u+l+o+)\b/i,
      /\b(?:e+n+g+o+t+|u+n+g+a+s+|t+i+m+a+n+g+|h+a+n+g+a+l+|a+b+n+o+y+|m+o+n+g+g+o+l+o+i+d+|b+u+a+n+g+|b+a+l+i+w+)\b/i,

      // 5. Socio-Behavioral and Character Attacks
      // Catches: pokpok, malibog, manyakis, malandi, tarantado, hudas, salbahe, walang hiya, kapal ng mukha
      /\b(?:p+[o|u]+k+[- ]*p+[o|u]+k+|p+u+k+p+u+k+)\b/i,
      /\b(?:m+a+l+i+b+o+g+|l+i+b+o+g+|m+a+n+y+a+k+|m+a+n+y+a+k+i+s+)\b/i,
      /\b(?:m+a+l+a+n+d+i+|k+a+l+a+n+d+i+a+n+|l+a+l+a+n+d+i+)\b/i,
      /\bm+a+k+a+t+i+\s+a+n+g+\b/i,
      /\b(?:t+a+r+a+n+t+a+d+[o|a]+|k+a+t+a+r+a+n+t+a+d+u+h+a+n+|a+t+a+r+a+n+t+a+d+[o|a]+)\b/i,
      /\b(?:h+u+d+a+s+|s+a+l+o+t+|d+e+m+o+n+y+o+|l+i+n+t+i+k+)\b/i,
      /\b(?:s+a+l+b+a+h+[e|i]+)\b/i,
      /\b(?:w+a+l+a+n+g+[- ]*h+i+y+a+|w+a+l+a+\s*k+a+n+g+\s*h+i+y+a+)\b/i,

      // 6. Regional Expletives (Cebuano / Bisaya, Ilonggo, Ilokano)
      // Catches: bilat sa ina mo, bilat ni nanay mo, yawa, pisting yawa, ukis ti inam, giatay, burikat, botohon
      /\b(?:b+i+l+a+t+(?:\s*(?:s+a+|n+i+|s+a+n+g+)?\s*(?:i+n+a+|n+a+n+a+y+|i+l+o+y+|m+o+))?)\b/i,
      /\b(?:p+i+s+t+i?e?n+g+\s*y+a+w+a+|p+e+s+t+e+\s*n+g+a+\s*y+a+w+a+|y+a+w+a+|y+w+a+)\b/i,
      /\b(?:u+k+i+s+\s*t+i+\s*i+n+a+m+|u+k+i+s+\s*n+i+\s*i+n+a+m+|o+k+i+\s*n+i+\s*i+n+a+m+|u+k+i+s+\s*t+i+\s*i+n+a+\s*m+o+|o+k+i+n+i+s+n+a+m+|u+k+i+s+n+a+m+)\b/i,
      /\b(?:g+i+[- ]*a+t+a+y+|p+i+s+t+i?e?n+g+\s*a+t+a+y+|a+t+a+y+\s*(?:k+a+|m+o+|n+y+o+))\b/i,
      /\b(?:b+u+r+i+k+a+t+|b+o+r+i+k+a+t+|b+o+t+o+h+o+n+|k+o+l+e+r+a+)\b/i,

      // Appearance, Body Shaming & Derogatory Insults (panget, pangit, kapangitan, etc.)
      /\b(?:p+a+n+g+[e|i]+t+|p+a+n+g+e+d+|s+h+o+n+g+e+t+|c+h+a+k+a+)(?:\s*(?:k+a+|m+o+|k+a+y+o+|n+y+o+|s+o+b+r+a+))?\b/i,
      /\b(?:a+n+g+\s*)?p+a+n+g+[e|i]+t+(?:\s*(?:m+o+|k+a+|s+o+b+r+a+))?\b/i,
      /\b(?:m+u+k+h+a+(?:n+g+|\s*k+a+n+g+|\s*k+a+|\s*m+o+)?\s*(?:t+a+e+|u+n+g+g+o+y+|a+s+o+|p+a+a+|t+a+n+g+a+|g+a+g+o+|b+a+s+a+h+a+n+|e+w+a+n+|b+a+n+g+k+a+y+|a+d+i+k+|p+e+r+a+|p+a+n+g+[e|i]+t+))\b/i,
      /\b(?:t+a+b+a+c+h+o+y+|b+a+b+o+y+\s*k+a+|a+n+g+\s*t+a+b+a+\s*m+o+|p+a+y+a+t+u+t+|k+a+l+b+o+\s*k+a+|b+a+n+s+o+t+|p+a+n+d+a+k+|n+g+o+n+g+o+|d+u+l+i+n+g+|k+i+r+a+t+|b+i+n+g+o+t+|b+u+n+g+i+|a+m+o+y+\s*t+a+e+|a+m+o+y+\s*l+u+p+a+|a+m+o+y+\s*p+u+t+o+k+)\b/i,

      // Tagalog / Filipino Insults, Demeaning Phrases, Lack of Value / Competence
      /\b(?:w+a+l+a+(?:n+g+|\s*k+a+n+g+|\s*k+a+y+o+n+g+)?\s*(?:k+w+e+n+t+a+|k+u+w+e+n+t+a+|b+i+t+a+w+|b+i+n+a+t+b+a+t+|s+i+l+b+i+|h+i+y+a+|m+o+d+o+|u+t+a+k+|m+a+r+a+r+a+t+i+n+g+|m+a+r+a+t+i+n+g+|p+i+n+a+g+[- ]*a+r+a+l+a+n+))(?:\s*(?:k+a+|m+o+|n+y+o+))?\b/i,
      /\b(?:w+a+l+a+n+g+\s*k+w+e+n+t+a+n+g+|w+a+l+a+n+g+\s*s+i+l+b+i+n+g+)\s*(?:t+a+o+|g+a+w+a+|t+r+a+b+a+h+o+|p+o+r+t+f+o+l+i+o+)?\b/i,
      /\b(?:k+a+p+a+l+\s*(?:n+g+)?\s*m+u+k+h+a+|m+a+k+a+p+a+l+\s*(?:a+n+g+)?\s*m+u+k+h+a+|k+a+p+a+l+\s*m+u+k+s+|k+a+p+a+l+\s*m+o+)\b/i,
      /\b(?:s+a+y+a+n+g+\s*(?:l+a+n+g+\s*)?o+r+a+s+|s+a+y+a+n+g+\s*p+a+s+a+h+o+d+|u+t+a+k+\s*b+i+y+a+|u+t+a+k+\s*t+a+l+a+n+g+k+a+|h+a+m+p+a+s+l+u+p+a+|a+s+a+l+\s*s+q+u+a+t+t+e+r+|s+k+w+a+t+e+r+)\b/i,
      /\b(?:b+a+s+t+o+s+|l+a+p+a+s+t+a+n+g+a+n+|b+a+l+i+w+|b+u+a+n+g+|a+b+n+o+y+|m+o+n+g+g+o+l+o+i+d+)\b/i,
      /\b(?:m+a+n+l+o+l+o+k+o+|s+i+n+u+n+g+a+l+i+n+g+\s*k+a+|t+r+a+y+d+o+r+|t+a+k+s+i+l+|i+p+o+k+r+i+t+[o|a]+)\b/i,
      /\b(?:m+a+m+a+t+a+y+\s*k+a+(?:\s*n+a+)?|p+a+t+a+y+i+n+\s*k+i+t+a+|p+a+p+a+t+a+y+i+n+\s*k+i+t+a+|s+a+s+a+p+a+k+i+n+\s*k+i+t+a+|b+u+g+b+u+g+i+n+\s*k+i+t+a+|s+a+s+a+m+p+a+l+i+n+\s*k+i+t+a+|i+t+u+m+b+a+\s*k+i+t+a+)\b/i,

      // English Profanity, Toxicity, Demeaning Phrases & Slurs
      /\b(?:p+a+k+s+h+[e|i]+t+|p+a+k+y+u+|f+a+k+y+u+|l+[e|e]+t?c+h+e+)\b/i,
      /\b(?:y+o+u+\s*(?:a+r+e+|r+e+)?\s*u+g+l+y+|u+\s*r+\s*u+g+l+y+|u+g+l+y+\s*a+s+\s*f+u+c+k+|u+g+l+y+\s*b+a+s+t+a+r+d+)\b/i,
      /\b(?:w+o+r+t+h+l+e+s+s+|u+s+e+l+e+s+s+|p+i+e+c+e\s+o+f\s+(?:s+h+i+t+|c+r+a+p+)|w+a+s+t+e\s+o+f\s+(?:s+p+a+c+e+|t+i+m+e+)|g+o+o+d\s+f+o+r\s+n+o+t+h+i+n+g+)\b/i,
      /\b(?:f+u+c+k+|f+u+c+k+i+n+g+|f+u+c+k+e+r+|m+o+t+h+e+r+f+u+c+k+e+r+|f+c+k+|f+u+k+|f\*+c*k|f\.u\.c\.k|s+t+f+u|s+h+u+t\s+t+h+e\s+f+u+c+k\s+u+p)\b/i,
      /\b(?:s+h+i+t+|s+h+i+t+t+y+|b+u+l+l+s+h+i+t+|h+o+r+s+e+s+h+i+t+|d+i+p+s+h+i+t+|s+h+\*+t)\b/i,
      /\b(?:b+i+t+c+h+|b+i+t+c+h+e+s+|b+i+t+c+h+i+n+g+|b+i+t+c+h+a+s+s+|b\*+t*c*h|b!tch)\b/i,
      /\b(?:a+s+s+h+o+l+e+|a+r+s+e+h+o+l+e+|d+u+m+b+a+s+s+|j+a+c+k+a+s+s+|a\*+s*hole|a\$\$hole)\b/i,
      /\b(?:b+a+s+t+a+r+d+|b+a+s+t+a+r+d+s+)\b/i,
      /\b(?:c+u+n+t+|c+u+n+t+s+|c\*+n*t)\b/i,
      /\b(?:d+i+c+k+|d+i+c+k+h+e+a+d+|c+o+c+k+|c+o+c+k+s+u+c+k+e+r+)\b/i,
      /\b(?:p+u+s+s+y+|p+u+s+s+i+e+s+)\b/i,
      /\b(?:r+e+t+a+r+d+|r+e+t+a+r+d+e+d+|i+d+i+o+t+|m+o+r+o+n+|i+m+b+e+c+i+l+e+)\b/i,
      /\b(?:w+h+o+r+e+|s+l+u+t+|s+k+a+n+k+)\b/i,
      /\b(?:s+h+a+m+e+l+e+s+s+|d+i+s+g+u+s+t+i+n+g+|p+a+t+h+e+t+i+c+|s+c+u+m+b+a+g+|s+c+u+m+|l+o+s+e+r+|j+e+r+k+|c+r+e+e+p+|t+r+a+s+h+|n+o\s+s+h+a+m+e+|d+i+s+g+r+a+c+e+)\b/i,
      /\b(?:k+i+l+l\s+y+o+u+r+s+e+l+f|k+y+s|g+o\s+d+i+e|d+r+o+p\s+d+e+a+d|h+o+p+e\s+y+o+u\s+d+i+e|h+a+n+g\s+y+o+u+r+s+e+l+f)\b/i,
      /\b(?:n+i+g+g+e+r+|n+i+g+g+a+|f+a+g+g+o+t+|f+a+g+|t+r+a+n+n+y+)\b/i
    ];

    for (const pattern of directPatterns) {
      if (pattern.test(text)) return true;
    }

    // 2. Leetspeak & Substitution Normalization
    // Converts numbers and glyphs into alphabetic counterparts and strips common obscuring characters
    const normalized = text
      .replace(/[@4]/g, 'a')
      .replace(/[3]/g, 'e')
      .replace(/[1!|]/g, 'i')
      .replace(/[0]/g, 'o')
      .replace(/[$5]/g, 's')
      .replace(/[7+]/g, 't')
      .replace(/[8]/g, 'b')
      .replace(/[*_#^~`\-.]/g, '');

    for (const pattern of directPatterns) {
      if (pattern.test(normalized)) return true;
    }

    // 3. Compacted Substring Check
    // Handles spaced-out text ("l o l o   m o", "t a n g i n a") and sequential character repetitions
    const compacted = normalized
      .replace(/[^a-z]/g, '')
      .replace(/(.)\1+/g, '$1');

    const compactRoots = [
      // Maternal & Ancestral
      'lolomo', 'lolamo', 'nanaymo', 'tataymo', 'inamo', 'amamo', 'angkanmo', 'lahimo',
      'lolomong', 'lolamong', 'nanaymong', 'tataymong', 'inamong',
      'mukhanglolomo', 'mukhankanglolomo', 'ulonglolomo',
      'potangina', 'putangina', 'tangina', 'tangena', 'taena', 'potaena', 'putaena',
      'pukinangina', 'pukingina', 'tanginamo', 'putanginamo', 'potaenamo', 'taenamo', 'tngnamo',
      'anakngputa', 'anakngpota', 'anakngtokwa', 'anakngteteng', 'anakngtupa', 'pimo',

      // Genital & Anatomical
      'pekpek', 'puki', 'puke', 'kiki', 'kepyas', 'kipyas', 'kipay', 'puday', 'tinggil',
      'titi', 'utin', 'uten', 'burat', 'bayag', 'betlog', 'itlogmo', 'kupal', 'kopal',
      'kantot', 'kantotan', 'chupa', 'torjack', 'jakol', 'jabol', 'salsal',

      // Scatological & Excretory
      'amoytae', 'mukhangtae', 'mukhakangtae', 'taemo', 'taeka', 'tumae', 'purotae',
      'bwisit', 'buwisit', 'bwiset', 'buwiset', 'amoyihi', 'puroihi',

      // Intellectual Degradation
      'gago', 'gagoka', 'gaguhan', 'kagaguhan', 'tarantado', 'atarantado',
      'ulol', 'olog', 'inutil', 'bobo', 'boboka', 'kabobohan', 'tanga', 'tangaka',
      'siraulo', 'maykasirasulo', 'siraulong', 'utakbiya', 'utaktalangka',
      'engot', 'ungas', 'timang', 'hangal', 'abnoy', 'buang', 'baliw',

      // Socio-Behavioral Attacks
      'pokpok', 'malibog', 'manyak', 'manyakis', 'malandi', 'kalandian',
      'hudas', 'salbahe', 'walanghiya', 'walakanghiya', 'makapalmukha', 'kapalngmukha', 'kapalmuks', 'kapalmo',
      'walangkwenta', 'walakangkwenta', 'walangsilbi', 'walakangsilbi', 'walangutak', 'walakangutak',
      'walangmodo', 'walakangmodo', 'walangbinatbat', 'walakangbinatbat', 'walangbitaw', 'walangpinagaralan',

      // Regional Expletives
      'bilatsainamo', 'bilatninanaymo', 'bilatsangiloymo', 'bilatmo', 'bilat',
      'pestengyawa', 'pistingyawa', 'pestengayawa', 'yawa',
      'ukistiinam', 'ukisiniinam', 'okiniinam', 'ukistinam', 'okinisnam', 'ukisnam',
      'giatay', 'pistingatay', 'atayka', 'burikat', 'borikat', 'botohon', 'kolera',

      // Appearance & Physical Degredation
      'panget', 'pangit', 'shonget', 'chaka', 'kapangitan',
      'mukhangaso', 'mukhangunggoy', 'mukhangpaa', 'mukhangbasahan', 'mukhangbangkay', 'mukhangadik',
      'tabachoy', 'baboyka', 'angtabamo', 'payatut', 'kalboka', 'bansot', 'pandak', 'amoyputok',
      'hampaslupa', 'asalsquatter', 'skwater',

      // English & Hostility
      'pakyu', 'pakshet', 'bastos', 'lapastangan',
      'mamatayka', 'patayinkita', 'papatayinkita', 'sasapakinkita', 'bugbuginkita', 'sasampalinkita', 'itumbakita',
      'killyourself', 'kys', 'godie', 'dropdead', 'hopeyoudie', 'hangyourself',
      'youareugly', 'urugly', 'uglyasfuck', 'worthless', 'useless', 'pieceofshit', 'wasteofspace', 'wasteoftime', 'goodfornothing',
      'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dickhead', 'retard', 'shameless', 'disgusting', 'pathetic', 'scumbag',
      'nigger', 'faggot'
    ];

    for (const root of compactRoots) {
      if (compacted.includes(root)) return true;
    }

    return false;
  }

  function setWarning(inputEl, warningEl, message, isAbuse = false) {
    if (!warningEl) return;
    if (message) {
      warningEl.innerHTML = `<span class="warning-icon" aria-hidden="true">⚠️</span><span class="warning-text">${message}</span>`;
      warningEl.classList.add('visible');
      if (isAbuse) {
        warningEl.classList.add('abuse-warning');
      } else {
        warningEl.classList.remove('abuse-warning');
      }
      if (inputEl) inputEl.classList.add('input-error');
    } else {
      warningEl.innerHTML = '';
      warningEl.classList.remove('visible', 'abuse-warning');
      if (inputEl) inputEl.classList.remove('input-error');
    }
  }

  // 1. Name Validation (No numbers, no special symbols, max 40 chars)
  function handleNameInput(input, warning, fieldName) {
    if (!input || !warning) return;

    // Check for attempted numbers or prohibited symbols
    const hasForbiddenChars = /[^A-Za-zÀ-ÿ\s'-]/.test(input.value);
    if (hasForbiddenChars) {
      setWarning(input, warning, `${fieldName} cannot contain numbers or special symbols.`);
      // Strip forbidden characters immediately
      input.value = input.value.replace(/[^A-Za-zÀ-ÿ\s'-]/g, '');
    } else if (detectAbuse(input.value)) {
      setWarning(input, warning, 'Inappropriate language detected. Please provide a respectful name.', true);
      submitBtn.disabled = true;
    } else if (input.value.length >= 40) {
      setWarning(input, warning, `Maximum limit of 40 characters reached.`);
      submitBtn.disabled = false;
    } else {
      setWarning(input, warning, null);
      submitBtn.disabled = false;
    }
  }

  if (firstNameInput) {
    firstNameInput.addEventListener('input', () => handleNameInput(firstNameInput, firstNameWarning, 'First Name'));
    firstNameInput.addEventListener('blur', () => {
      const val = firstNameInput.value.trim();
      if (!val) {
        setWarning(firstNameInput, firstNameWarning, 'First Name is required.');
      } else {
        handleNameInput(firstNameInput, firstNameWarning, 'First Name');
      }
    });
  }

  if (lastNameInput) {
    lastNameInput.addEventListener('input', () => handleNameInput(lastNameInput, lastNameWarning, 'Last Name'));
    lastNameInput.addEventListener('blur', () => {
      const val = lastNameInput.value.trim();
      if (!val) {
        setWarning(lastNameInput, lastNameWarning, 'Last Name is required.');
      } else {
        handleNameInput(lastNameInput, lastNameWarning, 'Last Name');
      }
    });
  }

  // 2. Email Validation (RFC 5322 pattern & security check)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  function validateEmail(showEmptyError = false) {
    if (!emailInput || !emailWarning) return false;
    const emailVal = emailInput.value.trim();

    if (!emailVal) {
      if (showEmptyError) {
        setWarning(emailInput, emailWarning, 'E-Mail address is required.');
      } else {
        setWarning(emailInput, emailWarning, null);
      }
      return false;
    }

    if (emailVal.length > 80) {
      setWarning(emailInput, emailWarning, 'Email cannot exceed 80 characters.');
      return false;
    }

    // Security check against script injection tags
    if (/<[^>]*>|script|javascript:/i.test(emailVal)) {
      setWarning(emailInput, emailWarning, 'Invalid or unsafe email characters detected.');
      return false;
    }

    if (!emailRegex.test(emailVal)) {
      setWarning(emailInput, emailWarning, 'Please enter a valid email format (e.g., name@domain.com).');
      return false;
    }

    setWarning(emailInput, emailWarning, null);
    return true;
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => validateEmail(false));
    emailInput.addEventListener('blur', () => validateEmail(true));
  }

  // 3. Message Validation & Verbal Abuse Detection
  function validateMessage(showEmptyError = false) {
    if (!messageInput || !messageWarning) return false;
    const msgVal = messageInput.value.trim();

    if (!msgVal) {
      if (showEmptyError) {
        setWarning(messageInput, messageWarning, 'Message content is required.');
      } else {
        setWarning(messageInput, messageWarning, null);
      }
      submitBtn.disabled = false;
      return false;
    }

    // Check for abusive or inappropriate content FIRST (regardless of character length!)
    if (detectAbuse(msgVal)) {
      setWarning(
        messageInput,
        messageWarning,
        'Inappropriate or abusive language detected. Please maintain a safe, respectful, and professional communication environment.',
        true
      );
      submitBtn.disabled = true;
      return false;
    }

    if (msgVal.length < 10) {
      setWarning(messageInput, messageWarning, 'Message must be at least 10 characters.');
      submitBtn.disabled = false;
      return false;
    }

    if (msgVal.length > 1000) {
      setWarning(messageInput, messageWarning, 'Message exceeds the 1,000 character limit.');
      submitBtn.disabled = false;
      return false;
    }

    setWarning(messageInput, messageWarning, null);
    submitBtn.disabled = false;
    return true;
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => validateMessage(false));
    messageInput.addEventListener('blur', () => validateMessage(true));
  }

  // Captivating Receipt Modal & Banner Elements
  const successModal = document.getElementById('contact-success-modal');
  const modalCloseBtn = document.getElementById('receipt-modal-close-btn');
  const modalCloseFooterBtn = document.getElementById('receipt-close-footer-btn');
  const modalCopyBtn = document.getElementById('receipt-copy-btn');
  const modalSendAnotherBtn = document.getElementById('receipt-send-another-btn');
  const copyBtnText = document.getElementById('copy-btn-text');

  const receiptSenderNameDisplay = document.getElementById('receipt-sender-name-display');
  const receiptTicketId = document.getElementById('receipt-ticket-id');
  const receiptSenderName = document.getElementById('receipt-sender-name');
  const receiptSenderEmail = document.getElementById('receipt-sender-email');
  const receiptTimestamp = document.getElementById('receipt-timestamp');
  const receiptMessageBody = document.getElementById('receipt-message-body');

  const inPlaceSuccessBanner = document.getElementById('contact-success-banner');
  const viewReceiptModalTrigger = document.getElementById('view-receipt-modal-trigger');
  const resetContactFormBtn = document.getElementById('reset-contact-form-btn');

  // Ambient Toast Elements
  const toastEl = document.getElementById('transmission-toast');
  const toastDesc = document.getElementById('toast-desc');
  const toastCloseBtn = document.getElementById('toast-close-btn');
  let toastTimer = null;
  let activeReceiptText = '';

  function showToast(desc) {
    if (!toastEl) return;
    if (toastDesc && desc) toastDesc.textContent = desc;
    toastEl.classList.add('active');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('active');
    }, 6000);
  }

  if (toastCloseBtn) {
    toastCloseBtn.addEventListener('click', () => {
      if (toastEl) toastEl.classList.remove('active');
      if (toastTimer) clearTimeout(toastTimer);
    });
  }

  function openReceiptModal() {
    if (!successModal) return;
    successModal.classList.add('open');
    successModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeReceiptModal() {
    if (!successModal) return;
    successModal.classList.remove('open');
    successModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeReceiptModal);
  if (modalCloseFooterBtn) modalCloseFooterBtn.addEventListener('click', closeReceiptModal);

  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) closeReceiptModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successModal && successModal.classList.contains('open')) {
      closeReceiptModal();
    }
  });

  if (viewReceiptModalTrigger) {
    viewReceiptModalTrigger.addEventListener('click', openReceiptModal);
  }

  function resetFormToCleanState() {
    closeReceiptModal();
    if (inPlaceSuccessBanner) inPlaceSuccessBanner.style.display = 'none';
    form.reset();
    setWarning(firstNameInput, firstNameWarning, null);
    setWarning(lastNameInput, lastNameWarning, null);
    setWarning(emailInput, emailWarning, null);
    setWarning(messageInput, messageWarning, null);
    hideStatus();
    if (firstNameInput) firstNameInput.focus();
  }

  if (modalSendAnotherBtn) modalSendAnotherBtn.addEventListener('click', resetFormToCleanState);
  if (resetContactFormBtn) resetContactFormBtn.addEventListener('click', resetFormToCleanState);

  if (modalCopyBtn) {
    modalCopyBtn.addEventListener('click', async () => {
      if (!activeReceiptText) return;
      try {
        await navigator.clipboard.writeText(activeReceiptText);
        if (copyBtnText) copyBtnText.textContent = 'Receipt Copied!';
        modalCopyBtn.classList.add('copied');
        setTimeout(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copy Receipt';
          modalCopyBtn.classList.remove('copied');
        }, 2500);
      } catch {
        // Fallback for non-secure or restricted clipboard contexts
        const tempArea = document.createElement('textarea');
        tempArea.value = activeReceiptText;
        tempArea.style.position = 'fixed';
        tempArea.style.opacity = '0';
        document.body.appendChild(tempArea);
        tempArea.select();
        try {
          document.execCommand('copy');
          if (copyBtnText) copyBtnText.textContent = 'Receipt Copied!';
          modalCopyBtn.classList.add('copied');
          setTimeout(() => {
            if (copyBtnText) copyBtnText.textContent = 'Copy Receipt';
            modalCopyBtn.classList.remove('copied');
          }, 2500);
        } catch (copyErr) {
          console.warn('Clipboard copy error:', copyErr);
        }
        document.body.removeChild(tempArea);
      }
    });
  }

  // 4. Form Submission with Gatekeeping & Captivating Delivery Flow
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = (firstNameInput?.value || '').trim();
    const lastName = (lastNameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const message = (messageInput?.value || '').trim();

    const isFirstValid = firstName.length > 0 && !/[^A-Za-zÀ-ÿ\s'-]/.test(firstName) && firstName.length <= 40;
    const isLastValid = lastName.length > 0 && !/[^A-Za-zÀ-ÿ\s'-]/.test(lastName) && lastName.length <= 40;
    const isEmailValid = validateEmail(true);
    const isMsgValid = validateMessage(true);

    if (!isFirstValid) {
      setWarning(firstNameInput, firstNameWarning, 'First Name must contain only letters (no numbers or symbols).');
      if (firstNameInput) firstNameInput.focus();
      return;
    }

    if (detectAbuse(firstName)) {
      setWarning(firstNameInput, firstNameWarning, 'Inappropriate or abusive language detected in First Name.', true);
      if (firstNameInput) firstNameInput.focus();
      return;
    }

    if (!isLastValid) {
      setWarning(lastNameInput, lastNameWarning, 'Last Name must contain only letters (no numbers or symbols).');
      if (lastNameInput) lastNameInput.focus();
      return;
    }

    if (detectAbuse(lastName)) {
      setWarning(lastNameInput, lastNameWarning, 'Inappropriate or abusive language detected in Last Name.', true);
      if (lastNameInput) lastNameInput.focus();
      return;
    }

    if (!isEmailValid) {
      if (emailInput) emailInput.focus();
      return;
    }

    if (!isMsgValid) {
      if (messageInput) messageInput.focus();
      return;
    }

    // Set loading state
    submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Delivering Message...';
    if (btnSpinner) btnSpinner.style.display = 'inline-block';
    hideStatus();

    // Generate unique transmission reference ID and formatted local timestamp
    const now = new Date();
    const ticketRand = Math.floor(1000 + Math.random() * 9000);
    const ticketId = `#NMS-${now.getFullYear()}-${ticketRand}`;
    const formattedDate = now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const payload = {
      '✦ Sender Name': `${firstName} ${lastName}`.trim(),
      '✦ Sender Email': email,
      '✦ Inquiry Message': message,
      '✦ Transmission Ticket': ticketId,
      '✦ Dispatched Timestamp': formattedDate,
      '✦ Priority Classification': '⚡ Priority Direct Client Transmission',
      '✦ Routing Origin': 'Niño Miguel Developer Portfolio (http://localhost:3000)',
      _subject: `⚡ [Priority Inquiry] Message from ${firstName} ${lastName}`,
      _replyto: email,
      _template: 'box',
      _captcha: 'false',
      _autoresponse: `Mabuhay ${firstName}!\n\nThank you for reaching out through my portfolio (http://localhost:3000). Your transmission (${ticketId}) has been delivered directly into my personal inbox.\n\nI personally review each incoming inquiry and will reply to you as soon as possible.\n\nWarm regards,\nNiño Miguel S. Rodriguez\nFull Stack Web Developer\nManila, Philippines`
    };

    // Prepare rich receipt text for clipboard copying
    activeReceiptText = [
      `=== NIÑO MIGUEL S. RODRIGUEZ - OFFICIAL TRANSMISSION RECEIPT ===`,
      `Transmission ID: ${ticketId}`,
      `Sender Identity: ${firstName} ${lastName}`,
      `Verified Email:  ${email}`,
      `Dispatched At:   ${formattedDate}`,
      `Recipient Inbox: ninomiguelsrodriguez@gmail.com`,
      `Delivery Status: CONFIRMED & QUEUED`,
      `---------------------------------------------------------------`,
      `Inquiry Excerpt:`,
      `"${message}"`,
      `===============================================================`
    ].join('\n');

    // Populate modal elements
    if (receiptSenderNameDisplay) receiptSenderNameDisplay.textContent = firstName;
    if (receiptTicketId) receiptTicketId.textContent = ticketId;
    if (receiptSenderName) receiptSenderName.textContent = `${firstName} ${lastName}`.trim();
    if (receiptSenderEmail) receiptSenderEmail.textContent = email;
    if (receiptTimestamp) receiptTimestamp.textContent = formattedDate;
    if (receiptMessageBody) receiptMessageBody.textContent = `"${message}"`;

    try {
      const response = await fetch('https://formsubmit.co/ajax/ninomiguelsrodriguez@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok || data.success === 'true' || data.success === true) {
        showStatus(`✔ Message delivered successfully! Transmission ${ticketId} dispatched to ninomiguelsrodriguez@gmail.com.`, 'success');
        if (inPlaceSuccessBanner) inPlaceSuccessBanner.style.display = 'flex';
        openReceiptModal();
        showToast(`Transmission ${ticketId} delivered to Niño Miguel's inbox.`);
        form.reset();
        setWarning(firstNameInput, firstNameWarning, null);
        setWarning(lastNameInput, lastNameWarning, null);
        setWarning(emailInput, emailWarning, null);
        setWarning(messageInput, messageWarning, null);
      } else {
        throw new Error(data.message || 'Transmission response not OK');
      }
    } catch (err) {
      console.warn('FormSubmit AJAX fallback triggered:', err);
      // Still show the modal with dispatch details and launch mailto fallback
      if (inPlaceSuccessBanner) inPlaceSuccessBanner.style.display = 'flex';
      openReceiptModal();
      showToast(`Transmission ${ticketId} queued via direct email gateway.`);
      showStatus('Notice: Direct network gateway. Launching your email client with pre-filled message...', 'success');

      const subject = encodeURIComponent(`Portfolio Inquiry from ${firstName} ${lastName} [${ticketId}]`);
      const body = encodeURIComponent(`Transmission ID: ${ticketId}\nName: ${firstName} ${lastName}\nEmail: ${email}\nDate: ${formattedDate}\n\nMessage:\n${message}`);
      window.location.href = `mailto:ninomiguelsrodriguez@gmail.com?subject=${subject}&body=${body}`;
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.textContent = 'Submit Message';
      if (btnSpinner) btnSpinner.style.display = 'none';
    }
  });

  function showStatus(msg, type) {
    if (!statusEl) return;
    statusEl.textContent = msg;
    statusEl.className = `form-status active ${type}`;
  }

  function hideStatus() {
    if (!statusEl) return;
    statusEl.className = 'form-status';
    statusEl.textContent = '';
  }
}