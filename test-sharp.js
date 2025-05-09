import sharp from 'sharp';

console.log('Sharp version:', sharp.versions);

// Try a simple operation
sharp({
  create: {
    width: 100,
    height: 100,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
  }
})
.png()
.toBuffer()
.then(data => {
  console.log('Sharp is working correctly! Generated a buffer of size:', data.length);
})
.catch(err => {
  console.error('Sharp error:', err);
});