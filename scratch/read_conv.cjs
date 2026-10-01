const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const dbPath = 'C:/Users/Miguel/.gemini/antigravity-ide/conversations/7ad4cec2-1ef1-4835-a178-b5695301d5cf.db';

try {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const row = db.prepare("SELECT step_payload FROM steps WHERE idx = 0").get();
  
  const buf = Buffer.from(row.step_payload);
  const text = buf.toString('utf8');
  
  const startIdx = text.indexOf('Please carefully analyze');
  if (startIdx !== -1) {
    // Find where the message text ends
    // Usually protobuf length or image bytes follow
    // In step 0, images were attached (media_1790863152744.png, etc.), so raw image binary data follows!
    // Let's find where the text ends by stopping before unprintable characters
    let endIdx = startIdx;
    while (endIdx < text.length) {
      const code = text.charCodeAt(endIdx);
      if (code < 32 && code !== 10 && code !== 13 && code !== 9) {
        break;
      }
      endIdx++;
    }
    const cleanPrompt = text.slice(startIdx, endIdx);
    fs.writeFileSync('scratch/previous_prompt.txt', cleanPrompt, 'utf8');
    console.log('=== PREVIOUS PROMPT ===\n' + cleanPrompt + '\n=======================');
  }

} catch (e) {
  console.error('Error:', e);
}
