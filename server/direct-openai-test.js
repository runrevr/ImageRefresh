// Test file for direct OpenAI API testing with different form-data methods
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');
const FormData = require('form-data');

// For direct Fetch API testing
const fetch = require('node-fetch');

// Fixed test paths
const TEMP_DIR = path.join(process.cwd(), 'uploads', 'test-direct');
const OUTPUT_DIR = path.join(process.cwd(), 'uploads', 'results');

// Create directories if they don't exist
[TEMP_DIR, OUTPUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Find a test image from uploads directory
async function findTestImage() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const files = fs.readdirSync(uploadsDir);
  
  // Look for jpg or png files
  const imageFile = files.find(file => 
    (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) && 
    !file.includes('transformed')
  );
  
  if (!imageFile) {
    throw new Error('No test image found in uploads directory');
  }
  
  const imagePath = path.join(uploadsDir, imageFile);
  console.log(`Using test image: ${imagePath}`);
  return imagePath;
}

// Create a plain PNG file using Sharp
async function createPngFile(inputPath) {
  const outputPath = path.join(TEMP_DIR, 'test-image.png');
  console.log(`Converting image to PNG with Sharp: ${inputPath} -> ${outputPath}`);
  
  await sharp(inputPath)
    .toFormat('png')
    .toFile(outputPath);
    
  console.log(`PNG file created: ${outputPath}`);
  console.log(`Size: ${fs.statSync(outputPath).size} bytes`);
  
  // Read a few bytes to verify it's a PNG
  const buffer = fs.readFileSync(outputPath);
  const header = buffer.slice(0, 8);
  console.log('PNG header bytes:', [...header].map(b => b.toString(16).padStart(2, '0')).join(' '));
  
  return outputPath;
}

// Method 1: Using node-fetch with custom boundary
async function testWithNodeFetch(pngPath, prompt) {
  console.log('TESTING WITH NODE-FETCH AND CUSTOM BOUNDARY');
  
  // Generate a unique boundary string
  const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
  
  // Read the image file
  const imageBuffer = fs.readFileSync(pngPath);
  
  // Create form data manually with explicit boundary
  let body = '';
  
  // Add the image part
  body += `--${boundary}\r\n`;
  body += 'Content-Disposition: form-data; name="image"; filename="image.png"\r\n';
  body += 'Content-Type: image/png\r\n\r\n';
  
  // Convert text body to buffer and concat with image and closing boundary
  const bodyStart = Buffer.from(body, 'utf-8');
  const bodyEnd = Buffer.from(`\r\n--${boundary}\r\nContent-Disposition: form-data; name="prompt"\r\n\r\n${prompt}\r\n--${boundary}\r\nContent-Disposition: form-data; name="n"\r\n\r\n1\r\n--${boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\n1024x1024\r\n--${boundary}--\r\n`, 'utf-8');
  
  // Concatenate buffers
  const requestBody = Buffer.concat([bodyStart, imageBuffer, bodyEnd]);
  
  try {
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': requestBody.length.toString()
      },
      body: requestBody
    });
    
    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    if (responseData.data && responseData.data[0] && responseData.data[0].url) {
      console.log('Success! Image URL:', responseData.data[0].url);
      return responseData.data[0].url;
    } else {
      console.error('No image URL in response');
      return null;
    }
  } catch (error) {
    console.error('Error with node-fetch:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Method 2: Using axios with form-data package
async function testWithAxios(pngPath, prompt) {
  console.log('\nTESTING WITH AXIOS AND FORM-DATA PACKAGE');
  
  const form = new FormData();
  
  // Add the PNG file with explicit content type
  form.append('image', fs.createReadStream(pngPath), {
    filename: 'image.png',
    contentType: 'image/png'
  });
  
  // Add other required fields
  form.append('prompt', prompt);
  form.append('n', '1');
  form.append('size', '1024x1024');
  
  try {
    const response = await axios.post('https://api.openai.com/v1/images/edits', form, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders()
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    if (response.data && response.data.data && response.data.data[0] && response.data.data[0].url) {
      console.log('Success! Image URL:', response.data.data[0].url);
      return response.data.data[0].url;
    } else {
      console.error('No image URL in response');
      return null;
    }
  } catch (error) {
    console.error('Error with axios:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

// Method 3: Using curl through child process
async function testWithCurl(pngPath, prompt) {
  console.log('\nTESTING WITH CURL COMMAND');
  
  const { spawn } = require('child_process');
  
  return new Promise((resolve, reject) => {
    const curlArgs = [
      '-X', 'POST',
      'https://api.openai.com/v1/images/edits',
      '-H', `Authorization: Bearer ${process.env.OPENAI_API_KEY}`,
      '-F', `image=@${pngPath};type=image/png`,
      '-F', `prompt=${prompt}`,
      '-F', 'n=1',
      '-F', 'size=1024x1024'
    ];
    
    console.log('Running curl with args:', curlArgs.join(' '));
    
    const curl = spawn('curl', curlArgs);
    
    let stdout = '';
    let stderr = '';
    
    curl.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    curl.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    curl.on('close', (code) => {
      console.log(`curl process exited with code ${code}`);
      console.log('stdout:', stdout);
      
      if (code !== 0) {
        console.error('stderr:', stderr);
        reject(new Error(`curl failed with code ${code}`));
        return;
      }
      
      try {
        const responseData = JSON.parse(stdout);
        console.log('Response data:', JSON.stringify(responseData, null, 2));
        
        if (responseData.data && responseData.data[0] && responseData.data[0].url) {
          console.log('Success! Image URL:', responseData.data[0].url);
          resolve(responseData.data[0].url);
        } else {
          console.error('No image URL in response');
          resolve(null);
        }
      } catch (error) {
        console.error('Error parsing curl response:', error);
        reject(error);
      }
    });
  });
}

// Main test function
async function runTests() {
  try {
    // Find a test image
    const testImagePath = await findTestImage();
    
    // Convert to PNG
    const pngPath = await createPngFile(testImagePath);
    
    // Test prompt
    const prompt = "Add a subtle glowing effect to the image";
    
    // Run all test methods
    console.log('\n========== STARTING TESTS ==========\n');
    
    // Test with node-fetch (custom boundary)
    await testWithNodeFetch(pngPath, prompt);
    
    // Test with axios
    await testWithAxios(pngPath, prompt);
    
    // Test with curl
    await testWithCurl(pngPath, prompt);
    
    console.log('\n========== TESTS COMPLETED ==========\n');
  } catch (error) {
    console.error('Test error:', error);
  }
}

// Run the tests
runTests();