/**
 * Dino Runner View & Sound Subsystem (MVCR - View Layer)
 * Manages floating score popups, score displays, and Web Audio retro arcade effects
 */

const praiseWords = ['+100 PTS!', 'AUTO-LEAP!', 'PERFECT JUMP!', 'CLEAN MOVE!', 'DANCE JUMP!', 'COMBO x2!'];

export function spawnScorePopup(floatScoresEl, xPos) {
  if (!floatScoresEl) return;
  const text = praiseWords[Math.floor(Math.random() * praiseWords.length)];
  const pop = document.createElement('div');
  pop.className = 'dino-popup-score';
  pop.textContent = text;
  if (xPos !== undefined) {
    pop.style.left = `${Math.max(10, Math.min(xPos, floatScoresEl.clientWidth - 90))}px`;
  }
  floatScoresEl.appendChild(pop);
  setTimeout(() => {
    pop.remove();
  }, 1100);
}

export function playArcadeJumpSound(soundEnabled, getAudioContext) {
  if (!soundEnabled) return;
  try {
    const audioCtx = getAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'square'; // Classic 8-bit arcade tone
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.14);

    gain.gain.setValueAtTime(0.08, now); // Gentle volume, never harsh
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.19);
  } catch (_) {
    // Fail gracefully on autoplay restrictions
  }
}
