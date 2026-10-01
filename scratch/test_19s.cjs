const { execSync } = require('child_process');
const ffmpeg = require('ffmpeg-static');
const { removeBackground } = require('@imgly/background-removal-node');
const fs = require('fs');
const path = require('path');

async function test19s() {
  const cropJpg = path.resolve('scratch', 'crop_19s.jpg');
  // At 19.5s in timeline_20s.jpg, Niño is at roughly x=300..450, y=500..850 in a 1920x1080 video?
  // Let's check video dimensions: 1920x1080 or 1280x720?
  // Let's get probe
}
