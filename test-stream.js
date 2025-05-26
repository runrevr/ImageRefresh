
import fs from 'fs';

try {
  const imageStream = fs.createReadStream('/home/runner/workspace/uploads/images-1748299014587-619687295.png');
  imageStream.on('data', (chunk) => {
    console.log('Stream chunk received. Size:', chunk.length, 'bytes');
  });
  imageStream.on('end', () => {
    console.log('Stream ended successfully');
  });
  imageStream.on('error', (error) => {
    console.error('Stream error:', error.message);
  });
} catch (error) {
  console.error('Stream creation error:', error.message);
}
