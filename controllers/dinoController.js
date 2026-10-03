/**
 * Dino Dance Runner Controller (MVCR - Controller Layer)
 * Interactive arcade game loop, auto-leap obstacle physics, sound synthesizer, and score counter
 */

export function initDinoDanceRunner() {
  const stage = document.getElementById('footer-dino-stage');
  const track = document.getElementById('dino-track-wrapper');
  const actor = document.getElementById('dino-runner-actor');
  const liveScoreEl = document.getElementById('dino-live-score');
  const floatScoresEl = document.getElementById('dino-float-scores');
  const soundToggleBtn = document.getElementById('dino-sound-toggle');
  const soundIconEl = document.getElementById('sound-icon');

  if (!stage || !actor) return;

  const obstacles = Array.from(document.querySelectorAll('.dino-obstacle'));
  let currentScore = 420;
  let isJumping = false;
  let soundEnabled = true;
  let audioCtx = null;
  let lastJumpTime = 0;
  let lastObstacleJumped = null;

  // Sound toggle button
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      soundEnabled = !soundEnabled;
      soundToggleBtn.classList.toggle('sound-muted', !soundEnabled);
      if (soundIconEl) {
        soundIconEl.textContent = soundEnabled ? '🔊' : '🔇';
      }
      const label = soundToggleBtn.querySelector('.sound-label');
      if (label) {
        label.textContent = soundEnabled ? '8-BIT AUDIO ON' : 'AUDIO MUTED';
      }
    });
  }

  // Web Audio API 8-bit retro arcade jump sound
  function playArcadeJumpSound() {
    if (!soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      if (!audioCtx) return;
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
      // Audio context might fail on restricted autoplay, fail gracefully
    }
  }

  // Floating combo popup in track
  const praiseWords = ['+100 PTS!', 'AUTO-LEAP!', 'PERFECT JUMP!', 'CLEAN MOVE!', 'DANCE JUMP!', 'COMBO x2!'];
  function spawnScorePopup(xPos) {
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

  // Jump Timing Constants: Perfectly tuned 720ms athletic leap with 50% apex (360ms)
  const JUMP_DURATION_MS = 720;
  const JUMP_APEX_RATIO = 0.50; // True crest over the hump at 50%
  const JUMP_APEX_MS = JUMP_DURATION_MS * JUMP_APEX_RATIO;

  // Jump Trigger Logic
  function triggerJump(isAuto = false, relatedObs = null) {
    if (isJumping) return;
    const now = Date.now();
    if (now - lastJumpTime < JUMP_DURATION_MS - 60) return; // Cooldown to finish jump arc
    lastJumpTime = now;
    isJumping = true;
    actor.classList.add('dino-jumping');

    playArcadeJumpSound();

    if (isAuto && relatedObs) {
      // Synchronize electric flash & combo points precisely when Miguel is soaring directly above the hump (at apex!)
      setTimeout(() => {
        relatedObs.classList.add('dino-obstacle-passed');
        setTimeout(() => {
          relatedObs.classList.remove('dino-obstacle-passed');
        }, 650);

        // Add bonus score
        currentScore += 100;
        if (liveScoreEl) {
          liveScoreEl.textContent = String(currentScore).padStart(5, '0');
          liveScoreEl.style.color = '#00f0ff';
          liveScoreEl.style.textShadow = '0 0 14px rgba(0, 240, 255, 0.9)';
          setTimeout(() => {
            liveScoreEl.style.color = '#ffffff';
            liveScoreEl.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.45)';
          }, 600);
        }

        const actorRect = actor.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();
        const relativeX = actorRect.left - trackRect.left + (actorRect.width / 2);
        spawnScorePopup(relativeX);
      }, JUMP_APEX_MS);
    }

    setTimeout(() => {
      actor.classList.remove('dino-jumping');
      isJumping = false;
    }, JUMP_DURATION_MS);
  }

  // Collision / Proximity Detection Loop for Automatic Jumping over Obstacles ("Humps")
  let prevActorLeft = null;
  const obsCooldowns = new Map();
  let isStageVisible = false;

  function checkObstacleProximity() {
    if (!isStageVisible) return;
    if (track && actor && obstacles.length > 0) {
      const trackRect = track.getBoundingClientRect();
      const trackWidth = trackRect.width || 1000;
      const actorRect = actor.getBoundingClientRect();
      const currentActorLeft = actorRect.left;

      if (prevActorLeft !== null) {
        // True direction of movement
        const isMovingRight = currentActorLeft >= prevActorLeft;
        const actorCenter = actorRect.left + (actorRect.width / 2);
        const now = Date.now();

        // Exact horizontal runner velocity derived from CSS keyframe animation:
        // Traverses 3% to 89% (86% of track width) in 9.6s (48% of 20s cycle)
        const runnerSpeedPxPerSec = Math.max(20, (0.86 * trackWidth) / 9.6);
        // Time in seconds to the apex (peak) of the jump
        const timeToApexSec = JUMP_APEX_MS / 1000; // 0.36s
        // Ideal takeoff distance from actor center to obstacle center
        // so that after traveling for timeToApexSec, actor center is EXACTLY at obstacle center
        const idealTakeoffDist = runnerSpeedPxPerSec * timeToApexSec;
        // Detection capture window (calibrated for sub-pixel accuracy at apex, preventing premature leaps)
        const frameTravel = runnerSpeedPxPerSec / 60;
        const minTriggerDist = Math.max(4, idealTakeoffDist - frameTravel * 1.5);
        const maxTriggerDist = idealTakeoffDist + frameTravel * 0.5;

        obstacles.forEach((obs) => {
          const obsRect = obs.getBoundingClientRect();
          const obsCenter = obsRect.left + (obsRect.width / 2);
          const obsId = obs.getAttribute('data-obs-id') || obs.className || 'obs';
          const dirKey = isMovingRight ? `${obsId}_R` : `${obsId}_L`;
          const lastJumped = obsCooldowns.get(dirKey) || 0;

          // Only trigger if cooldown passed (1.6s between re-jumping the same obstacle in same direction)
          if (now - lastJumped > 1600) {
            const distanceAhead = isMovingRight ? (obsCenter - actorCenter) : (actorCenter - obsCenter);

            // Trigger jump precisely at takeoff point so crest occurs dead-center over the hump
            if (distanceAhead >= minTriggerDist && distanceAhead <= maxTriggerDist) {
              obsCooldowns.set(dirKey, now);
              triggerJump(true, obs);
            }
          }
        });
      }
      prevActorLeft = currentActorLeft;
    }
    if (isStageVisible) {
      requestAnimationFrame(checkObstacleProximity);
    }
  }

  if ('IntersectionObserver' in window) {
    const dinoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isStageVisible = entry.isIntersecting;
        if (isStageVisible) {
          prevActorLeft = null;
          requestAnimationFrame(checkObstacleProximity);
        }
      });
    }, { rootMargin: '120px' });
    dinoObserver.observe(stage);
  } else {
    isStageVisible = true;
    requestAnimationFrame(checkObstacleProximity);
  }

  // Real-time ticking score counter just like Chrome Dino
  setInterval(() => {
    currentScore++;
    if (liveScoreEl) {
      liveScoreEl.textContent = String(currentScore).padStart(5, '0');
      if (currentScore % 100 === 0) {
        liveScoreEl.style.color = '#ff2a3a';
        liveScoreEl.style.textShadow = '0 0 14px rgba(255, 42, 58, 0.9)';
        setTimeout(() => {
          liveScoreEl.style.color = '#ffffff';
          liveScoreEl.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.45)';
        }, 800);
      }
    }
  }, 180);

  // Click / tap to jump manually
  if (track) {
    track.addEventListener('click', (e) => {
      if (e.target.closest('#dino-sound-toggle')) return;
      e.preventDefault();
      triggerJump(false);
      const trackRect = track.getBoundingClientRect();
      const relativeX = e.clientX - trackRect.left;
      spawnScorePopup(relativeX);
    });
  }

  // Keyboard Spacebar jump if viewing the footer area
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target === document.body) {
      const rect = stage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        e.preventDefault();
        triggerJump(false);
      }
    }
  });
}
