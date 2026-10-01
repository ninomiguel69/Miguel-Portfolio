const sharp = require('sharp');

async function inspect15() {
  const { data, info } = await sharp('scratch/test_clean_frame15.png').raw().toBuffer({ resolveWithObject: true });
  for (let y = 0; y < 60; y += 5) {
    let nonTrans = 0;
    let avgR = 0, avgG = 0, avgB = 0;
    for (let x = 0; x < info.width; x++) {
      const idx = (y * info.width + x) * 4;
      const alpha = data[idx + 3];
      if (alpha > 20) {
        nonTrans++;
        avgR += data[idx];
        avgG += data[idx + 1];
        avgB += data[idx + 2];
      }
    }
    if (nonTrans > 0) {
      console.log(`y=${y}: ${nonTrans} non-transparent pixels, avg RGB=(${Math.round(avgR/nonTrans)}, ${Math.round(avgG/nonTrans)}, ${Math.round(avgB/nonTrans)})`);
    } else {
      console.log(`y=${y}: clean transparent`);
    }
  }
}

inspect15().catch(console.error);
