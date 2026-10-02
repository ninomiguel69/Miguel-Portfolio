import fs from 'fs';

console.log('====================================================');
console.log('⚡ SIMULATING DINO RUNNER LEAP PHYSICS ACROSS VIEWPORTS');
console.log('====================================================\n');

const viewports = [
  { name: 'Mobile (iPhone 14 / Android)', width: 390 },
  { name: 'Tablet (iPad Mini / Air)', width: 768 },
  { name: 'Laptop (MacBook Pro 13)', width: 1280 },
  { name: 'Desktop Widescreen (1080p)', width: 1920 }
];

const JUMP_DURATION_MS = 720;
const JUMP_APEX_MS = 360;
const timeToApexSec = JUMP_APEX_MS / 1000; // 0.36s

let passed = 0;
let failed = 0;

for (const vp of viewports) {
  console.log(`--- Testing Viewport: ${vp.name} (Track Width: ${vp.width}px) ---`);

  // Runner velocity: traverses 86% of track in 9.6s
  const speedPxPerSec = Math.max(20, (0.86 * vp.width) / 9.6);
  const idealTakeoffDist = speedPxPerSec * timeToApexSec;
  const frameTravel = speedPxPerSec / 60; // Distance traveled in 1 single 60fps frame
  const minTriggerDist = Math.max(4, idealTakeoffDist - frameTravel * 1.5);
  const maxTriggerDist = idealTakeoffDist + frameTravel * 0.5;

  console.log(`  Horizontal Speed: ${speedPxPerSec.toFixed(2)} px/s`);
  console.log(`  Target Takeoff Distance before Hump Center: ${idealTakeoffDist.toFixed(2)} px`);
  console.log(`  Trigger Window: [${minTriggerDist.toFixed(2)}px, ${maxTriggerDist.toFixed(2)}px]`);

  // Simulate an approach toward an obstacle at x = 0.5 * vp.width
  const obsCenter = vp.width * 0.5;
  let actorCenter = obsCenter - 150; // Start 150px away
  let triggeredAtDist = null;
  let frameCount = 0;

  // Simulate 60fps movement (dt = 1/60s = 0.01667s)
  const dt = 1 / 60;
  while (actorCenter < obsCenter + 80 && frameCount < 300) {
    frameCount++;
    actorCenter += speedPxPerSec * dt;
    const distanceAhead = obsCenter - actorCenter;

    if (triggeredAtDist === null && distanceAhead >= minTriggerDist && distanceAhead <= maxTriggerDist) {
      triggeredAtDist = distanceAhead;
      break;
    }
  }

  if (triggeredAtDist !== null) {
    // Calculate where actor will be at the APEX of the jump (after timeToApexSec)
    const positionAtApex = actorCenter + (speedPxPerSec * timeToApexSec);
    const apexOffsetFromObsCenter = Math.abs(positionAtApex - obsCenter);

    console.log(`  ✅ Jump Triggered at: ${triggeredAtDist.toFixed(2)}px in advance`);
    console.log(`  ✅ Position at Apex: ${apexOffsetFromObsCenter.toFixed(2)}px from exact center of hump`);

    // The obstacle width is 16px (half width = 8px).
    // Apex offset must be within 3px of dead-center!
    if (apexOffsetFromObsCenter <= 3.0) {
      console.log(`  🎯 RESULT: PERFECT CENTERED CLEARANCE OVER HUMP!\n`);
      passed++;
    } else {
      console.error(`  ❌ Apex off center by ${apexOffsetFromObsCenter.toFixed(2)}px\n`);
      failed++;
    }
  } else {
    console.error(`  ❌ Failed to trigger jump within window!\n`);
    failed++;
  }
}

console.log('====================================================');
console.log(`🏁 JUMP PHYSICS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================\n');

if (failed > 0) process.exit(1);
