
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prebuilt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

/**
 * Get list of available prebuilt prompts
 */
export function getPrebuiltPrompts(req: Request, res: Response) {
  // 19 prebuilt prompts with actual content
  const prompts = [
    {
      id: 'prompt-001',
      title: 'Pure Catalog Ready',
      description: 'Professional e-commerce presentation with seamless white background and studio lighting',
      prompt: 'Professional e-commerce presentation. The uploaded product stays perfectly intact as the hero element. Place on seamless white background with soft studio lighting from above and sides. Add gentle shadow beneath for depth. Even illumination eliminates harsh contrasts. Pure white backdrop, no distractions. Product fills 70% of frame. Clean, professional product photography style.',
      category: 'Professional',
      difficulty: 'Easy'
    },
    {
      id: 'prompt-002',
      title: 'Kitchen Lifestyle Story',
      description: 'Warm culinary scene with marble counter and morning sunlight',
      prompt: 'Warm culinary scene. The uploaded product remains unchanged as the central focus. Place on marble kitchen counter with morning sunlight through window. Include fresh herbs and coffee cup as subtle props. Blurred kitchen background with shallow depth of field. Warm, inviting atmosphere with natural light creating soft shadows.',
      category: 'Lifestyle',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-003',
      title: 'Nature\'s Embrace',
      description: 'Organic outdoor setting with weathered wood and golden hour lighting',
      prompt: 'Organic outdoor setting. The uploaded product stays perfectly preserved. Position on weathered wood with golden hour sunlight. Blurred forest background with bokeh effect. Include leaves or smooth stones as natural accents. Warm outdoor lighting with authentic atmosphere. Product sharp, background soft.',
      category: 'Background',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-004',
      title: 'Midnight Luxe',
      description: 'Premium black backdrop with dramatic spotlight and rim lighting',
      prompt: 'Premium black backdrop. The uploaded product remains intact. Place on glossy black surface with dramatic spotlight from above creating rim lighting. Pure black background with elegant reflection below. Sophisticated studio lighting emphasizes quality. Moody, luxurious presentation.',
      category: 'Professional',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-005',
      title: 'Coastal Paradise',
      description: 'Bright beach atmosphere with sandy setting and ocean waves',
      prompt: 'Bright beach atmosphere. The uploaded product unchanged at center. Sandy beach setting with bright midday sun. Palm fronds and seashells as props. Blurred ocean waves in background. High-key lighting with warm color temperature. Summer vacation energy with clear product visibility.',
      category: 'Lifestyle',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-006',
      title: 'Heritage Charm',
      description: 'Vintage nostalgic styling with distressed wood and warm lighting',
      prompt: 'Vintage nostalgic styling. The uploaded product perfectly preserved. Distressed wood surface with warm window light. Old books and dried flowers as vintage props. Subtle vignetting for aged effect. Rustic blurred background. Nostalgic atmosphere while maintaining product clarity.',
      category: 'Style',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-007',
      title: 'Metropolitan Pulse',
      description: 'Urban energy backdrop with motion-blurred city streets',
      prompt: 'Urban energy backdrop. The uploaded product sharp in foreground. Motion-blurred city street behind with bokeh lights. Concrete surface placement. Evening lighting mixing street lights and neon. Dynamic urban lifestyle feeling with crystal-clear product focus.',
      category: 'Background',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-008',
      title: 'Curated Collection',
      description: 'Minimalist flat lay with complementary items and clean composition',
      prompt: 'Minimalist flat lay. The uploaded product as hero element. Top-down view with 3-4 complementary items arranged with breathing space. Clean marble or linen surface. Soft even lighting, no harsh shadows. Balanced composition following rule of thirds.',
      category: 'Style',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-009',
      title: 'Gravity Defying',
      description: 'Floating product effect with soft shadows and studio lighting',
      prompt: 'Floating product effect. The uploaded product unchanged, appearing to levitate 12 inches above surface. Soft shadow showing height below. Light gradient background. Even studio lighting from multiple angles. Subtle motion blur at edges suggesting gentle movement.',
      category: 'Creative',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-010',
      title: 'Story Grid',
      description: 'Multiple angle showcase in 2x2 grid format',
      prompt: 'Multiple angle showcase. The uploaded product preserved in each frame. Create 2x2 grid showing: product solo on white, in-use scenario, with accessories, and detail shot. Consistent lighting across frames with thin borders. Each cell tells product story.',
      category: 'Enhancement',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-011',
      title: 'Monochrome Masterpiece',
      description: 'High contrast black and white with dramatic lighting',
      prompt: 'High contrast black and white. The uploaded product with all details preserved, converted to dramatic black and white. Strong directional lighting creating deep shadows and bright highlights. Rich tonal range emphasizing texture. All text remains legible through careful contrast.',
      category: 'Artistic',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-012',
      title: 'Instant Memories',
      description: 'Classic polaroid style with vintage photo frame effect',
      prompt: 'Classic polaroid style. The uploaded product unchanged within instant photo frame. Square format with characteristic white border, thicker at bottom. Slightly faded colors with soft edges. Gentle light leaks in corners. Nostalgic snapshot feeling.',
      category: 'Artistic',
      difficulty: 'Easy'
    },
    {
      id: 'prompt-013',
      title: 'Electric Nights',
      description: 'Neon glow aesthetic with vibrant cyberpunk lighting',
      prompt: 'Neon glow aesthetic. The uploaded product intact with vibrant neon lighting. Pink, blue, and purple lights creating colorful reflections on product surface. Dark background enhancing neon contrast. Subtle lens flares from light sources. Cyberpunk energy.',
      category: 'Creative',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-014',
      title: 'Cinema Shadows',
      description: 'Film noir atmosphere with dramatic black and white treatment',
      prompt: 'Film noir atmosphere. The uploaded product visible with dramatic black and white treatment. Strong side lighting creating bold shadows. Film grain texture with slight vignetting. Mystery atmosphere while maintaining text legibility.',
      category: 'Artistic',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-015',
      title: 'Sunset Magic',
      description: 'Golden hour warmth with orange and amber tones',
      prompt: 'Golden hour warmth. The uploaded product bathed in warm sunset light. Orange and amber tones with long shadows. Soft lens flare and atmospheric haze. Dreamy golden hour quality maintaining product colors.',
      category: 'Lighting',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-016',
      title: 'Nordic Fresh',
      description: 'Scandinavian aesthetic with bright, cool processing',
      prompt: 'Scandinavian aesthetic. The uploaded product with bright, cool processing. Slightly overexposed with blue undertones. Soft diffused lighting like overcast Nordic day. Minimal shadows, crisp and clean feeling.',
      category: 'Style',
      difficulty: 'Easy'
    },
    {
      id: 'prompt-017',
      title: 'Analog Soul',
      description: 'Film photography look with vintage 35mm aesthetic',
      prompt: 'Film photography look. The uploaded product with vintage 35mm aesthetic. Characteristic film colors and organic grain. Natural halation around highlights. Authentic analog feeling preserving product accuracy.',
      category: 'Artistic',
      difficulty: 'Medium'
    },
    {
      id: 'prompt-018',
      title: 'Morning Mist',
      description: 'Ethereal fog atmosphere with soft layers and light rays',
      prompt: 'Ethereal fog atmosphere. The uploaded product emerging from soft morning fog. Multiple fog layers with product in sharp focus. Delicate light rays through haze. Moisture droplets on surface. Mystical, fresh atmosphere.',
      category: 'Lighting',
      difficulty: 'Advanced'
    },
    {
      id: 'prompt-019',
      title: 'Aurora Dreams',
      description: 'Arctic wonderland scene with cinematic staging and pastel colors',
      prompt: 'Arctic wonderland scene. The uploaded product remains perfectly intact with all original colors, labels, text, branding, and details unchanged as the absolute focal point of the composition. Create a meticulously staged cinematic scene with rigid symmetry and frontal, low-angle framing, emphasizing a diagonal composition (45-degree tilt) where all elements align along a single dynamic axis. Color Grading: 60% Dominant: Soft, powdery pastel pinks (Pantone 12-1109 TPX "Marshmallow") saturating the sky, snow, and TV casing. 30% Secondary: Frosted teal blues (HEX #6ECEDA) in the glacial lake, aurora, and TV screen static. 10% Accent: Mustard-yellow (Pantone 15-0950 TPX "Golden Glow") in the aurora streaks, wool tufts, and corroded metal knobs. TV Design: A 1950s Bakelite TV (matte eggshell plastic with hairline cracks) tilted diagonally (top-left corner at 10 o\'clock, bottom-right submerged at 4 o\'clock). Crack: A jagged diagonal fissure (2cm wide) splits the screen from top-left to bottom-right, leaking viscous, neon-bright color bar pigment (RGB values: pink #FF9EB5, teal #5FDAC3, gold #FFD700) that pools into the water below. Materials: Body: Faux-weathered plastic with chipped edges revealing rusted steel underlayers. Details: Three rotary knobs (tarnished brass, 4cm diameter) labeled "VOL," "TUNE," "POWER." Cables: Braided wool cords (undyed cream yarn, 3cm thickness) coiled around the TV\'s base, fraying at the ends. Screen Imagery: Static Overlay: A 1953 RCA-style color bar test pattern (8 vertical bands) glitching every 2 seconds, causing the teal and pink bars to "melt" downward into liquid. Underlying Image: A faint, glowing topographical map (golden-yellow lines on indigo) labeled "DREAM ARCHIPELAGO" dissolves into water that cascades from the screen\'s crack, merging with the glacial lake. Environment: Glacial Lake: Semi-frozen water (translucent teal, 70% opacity) with jagged ice shards (20cm height) encircling the TV. Snowfall: Heavy, dense snowflakes (1cm diameter) falling at 45 degrees, accumulating on the TV\'s top-left corner. Aurora Borealis: Three parallel bands (pink #FFB3D1, teal #7FE5E5, gold #FFE44D) in smooth sine waves, 15° tilt, 80% opacity. Sky: Ultra-high-contrast starfield (ISO 51200 noise pattern) with 2,000 visible stars (randomized 2-4px white dots). Lighting & Effects: Key Light: A frontal, low-orange sodium vapor lamp (3200K) casting sharp diagonal shadows (20° angle) from the TV onto the ice. Bloom: Halation around the aurora and screen, radius 15px, intensity 70%. Textures: Film Grain: 35mm Kodak Vision3 250D overlay (gritty, high-detail). Lens Defects: Two hairline scratches (1px width) at 15° and 75° angles, plus hexagonal lens flare (60% opacity) from the aurora. Physics & Motion: Water: Viscous fluid dynamics—the leaking color bars swirl in 5cm eddies, blending with the glacial lake. Wool: Submerged yarn floats upward in 10cm tufts, swaying at 0.5Hz frequency. Result: A hyper-detailed, reference-free scene that implicitly channels Wes Anderson\'s aesthetic through obsessive symmetry, retro-kitsch materials, and a strict 60/30/10 pastel hierarchy—no director named, all style embedded in granular technical specs. The uploaded product maintains complete visual integrity throughout this elaborate scene, serving as the primary subject despite the artistic environment.',
      category: 'Special',
      difficulty: 'Advanced'
    }
  ];

  res.json(prompts);
}

/**
 * Helper function to download and save image from URL
 */
async function downloadAndSaveImage(imageUrl: string, filename: string): Promise<string> {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    const savedPath = `uploads/prebuilt-${filename}-${Date.now()}.png`;
    await fs.writeFile(savedPath, uint8Array);
    
    return savedPath;
  } catch (error) {
    console.error('[Prebuilt Transform] Error downloading image:', error);
    throw error;
  }
}

/**
 * Transform image using prebuilt prompt
 */
export async function transformWithPrebuiltPrompt(req: Request, res: Response) {
  const startTime = Date.now();
  
  try {
    const { promptId, imagePath } = req.body;
    
    console.log(`[Prebuilt Transform] Starting transformation with prompt: ${promptId}`);
    console.log(`[Prebuilt Transform] Image path: ${imagePath}`);

    if (!promptId || !imagePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing promptId or imagePath' 
      });
    }

    // Get the prompt details
    const prompts = [
      {
        id: 'prompt-001',
        title: 'Pure Catalog Ready',
        description: 'Professional e-commerce presentation with seamless white background and studio lighting',
        prompt: 'Professional e-commerce presentation. The uploaded product stays perfectly intact as the hero element. Place on seamless white background with soft studio lighting from above and sides. Add gentle shadow beneath for depth. Even illumination eliminates harsh contrasts. Pure white backdrop, no distractions. Product fills 70% of frame. Clean, professional product photography style.',
        category: 'Professional',
        difficulty: 'Easy'
      },
      {
        id: 'prompt-002',
        title: 'Kitchen Lifestyle Story',
        description: 'Warm culinary scene with marble counter and morning sunlight',
        prompt: 'Warm culinary scene. The uploaded product remains unchanged as the central focus. Place on marble kitchen counter with morning sunlight through window. Include fresh herbs and coffee cup as subtle props. Blurred kitchen background with shallow depth of field. Warm, inviting atmosphere with natural light creating soft shadows.',
        category: 'Lifestyle',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-003',
        title: 'Nature\'s Embrace',
        description: 'Organic outdoor setting with weathered wood and golden hour lighting',
        prompt: 'Organic outdoor setting. The uploaded product stays perfectly preserved. Position on weathered wood with golden hour sunlight. Blurred forest background with bokeh effect. Include leaves or smooth stones as natural accents. Warm outdoor lighting with authentic atmosphere. Product sharp, background soft.',
        category: 'Background',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-004',
        title: 'Midnight Luxe',
        description: 'Premium black backdrop with dramatic spotlight and rim lighting',
        prompt: 'Premium black backdrop. The uploaded product remains intact. Place on glossy black surface with dramatic spotlight from above creating rim lighting. Pure black background with elegant reflection below. Sophisticated studio lighting emphasizes quality. Moody, luxurious presentation.',
        category: 'Professional',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-005',
        title: 'Coastal Paradise',
        description: 'Bright beach atmosphere with sandy setting and ocean waves',
        prompt: 'Bright beach atmosphere. The uploaded product unchanged at center. Sandy beach setting with bright midday sun. Palm fronds and seashells as props. Blurred ocean waves in background. High-key lighting with warm color temperature. Summer vacation energy with clear product visibility.',
        category: 'Lifestyle',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-006',
        title: 'Heritage Charm',
        description: 'Vintage nostalgic styling with distressed wood and warm lighting',
        prompt: 'Vintage nostalgic styling. The uploaded product perfectly preserved. Distressed wood surface with warm window light. Old books and dried flowers as vintage props. Subtle vignetting for aged effect. Rustic blurred background. Nostalgic atmosphere while maintaining product clarity.',
        category: 'Style',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-007',
        title: 'Metropolitan Pulse',
        description: 'Urban energy backdrop with motion-blurred city streets',
        prompt: 'Urban energy backdrop. The uploaded product sharp in foreground. Motion-blurred city street behind with bokeh lights. Concrete surface placement. Evening lighting mixing street lights and neon. Dynamic urban lifestyle feeling with crystal-clear product focus.',
        category: 'Background',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-008',
        title: 'Curated Collection',
        description: 'Minimalist flat lay with complementary items and clean composition',
        prompt: 'Minimalist flat lay. The uploaded product as hero element. Top-down view with 3-4 complementary items arranged with breathing space. Clean marble or linen surface. Soft even lighting, no harsh shadows. Balanced composition following rule of thirds.',
        category: 'Style',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-009',
        title: 'Gravity Defying',
        description: 'Floating product effect with soft shadows and studio lighting',
        prompt: 'Floating product effect. The uploaded product unchanged, appearing to levitate 12 inches above surface. Soft shadow showing height below. Light gradient background. Even studio lighting from multiple angles. Subtle motion blur at edges suggesting gentle movement.',
        category: 'Creative',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-010',
        title: 'Story Grid',
        description: 'Multiple angle showcase in 2x2 grid format',
        prompt: 'Multiple angle showcase. The uploaded product preserved in each frame. Create 2x2 grid showing: product solo on white, in-use scenario, with accessories, and detail shot. Consistent lighting across frames with thin borders. Each cell tells product story.',
        category: 'Enhancement',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-011',
        title: 'Monochrome Masterpiece',
        description: 'High contrast black and white with dramatic lighting',
        prompt: 'High contrast black and white. The uploaded product with all details preserved, converted to dramatic black and white. Strong directional lighting creating deep shadows and bright highlights. Rich tonal range emphasizing texture. All text remains legible through careful contrast.',
        category: 'Artistic',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-012',
        title: 'Instant Memories',
        description: 'Classic polaroid style with vintage photo frame effect',
        prompt: 'Classic polaroid style. The uploaded product unchanged within instant photo frame. Square format with characteristic white border, thicker at bottom. Slightly faded colors with soft edges. Gentle light leaks in corners. Nostalgic snapshot feeling.',
        category: 'Artistic',
        difficulty: 'Easy'
      },
      {
        id: 'prompt-013',
        title: 'Electric Nights',
        description: 'Neon glow aesthetic with vibrant cyberpunk lighting',
        prompt: 'Neon glow aesthetic. The uploaded product intact with vibrant neon lighting. Pink, blue, and purple lights creating colorful reflections on product surface. Dark background enhancing neon contrast. Subtle lens flares from light sources. Cyberpunk energy.',
        category: 'Creative',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-014',
        title: 'Cinema Shadows',
        description: 'Film noir atmosphere with dramatic black and white treatment',
        prompt: 'Film noir atmosphere. The uploaded product visible with dramatic black and white treatment. Strong side lighting creating bold shadows. Film grain texture with slight vignetting. Mystery atmosphere while maintaining text legibility.',
        category: 'Artistic',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-015',
        title: 'Sunset Magic',
        description: 'Golden hour warmth with orange and amber tones',
        prompt: 'Golden hour warmth. The uploaded product bathed in warm sunset light. Orange and amber tones with long shadows. Soft lens flare and atmospheric haze. Dreamy golden hour quality maintaining product colors.',
        category: 'Lighting',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-016',
        title: 'Nordic Fresh',
        description: 'Scandinavian aesthetic with bright, cool processing',
        prompt: 'Scandinavian aesthetic. The uploaded product with bright, cool processing. Slightly overexposed with blue undertones. Soft diffused lighting like overcast Nordic day. Minimal shadows, crisp and clean feeling.',
        category: 'Style',
        difficulty: 'Easy'
      },
      {
        id: 'prompt-017',
        title: 'Analog Soul',
        description: 'Film photography look with vintage 35mm aesthetic',
        prompt: 'Film photography look. The uploaded product with vintage 35mm aesthetic. Characteristic film colors and organic grain. Natural halation around highlights. Authentic analog feeling preserving product accuracy.',
        category: 'Artistic',
        difficulty: 'Medium'
      },
      {
        id: 'prompt-018',
        title: 'Morning Mist',
        description: 'Ethereal fog atmosphere with soft layers and light rays',
        prompt: 'Ethereal fog atmosphere. The uploaded product emerging from soft morning fog. Multiple fog layers with product in sharp focus. Delicate light rays through haze. Moisture droplets on surface. Mystical, fresh atmosphere.',
        category: 'Lighting',
        difficulty: 'Advanced'
      },
      {
        id: 'prompt-019',
        title: 'Aurora Dreams',
        description: 'Arctic wonderland scene with cinematic staging and pastel colors',
        prompt: 'Arctic wonderland scene. The uploaded product remains perfectly intact with all original colors, labels, text, branding, and details unchanged as the absolute focal point of the composition. Create a meticulously staged cinematic scene with rigid symmetry and frontal, low-angle framing, emphasizing a diagonal composition (45-degree tilt) where all elements align along a single dynamic axis. Color Grading: 60% Dominant: Soft, powdery pastel pinks (Pantone 12-1109 TPX "Marshmallow") saturating the sky, snow, and TV casing. 30% Secondary: Frosted teal blues (HEX #6ECEDA) in the glacial lake, aurora, and TV screen static. 10% Accent: Mustard-yellow (Pantone 15-0950 TPX "Golden Glow") in the aurora streaks, wool tufts, and corroded metal knobs. TV Design: A 1950s Bakelite TV (matte eggshell plastic with hairline cracks) tilted diagonally (top-left corner at 10 o\'clock, bottom-right submerged at 4 o\'clock). Crack: A jagged diagonal fissure (2cm wide) splits the screen from top-left to bottom-right, leaking viscous, neon-bright color bar pigment (RGB values: pink #FF9EB5, teal #5FDAC3, gold #FFD700) that pools into the water below. Materials: Body: Faux-weathered plastic with chipped edges revealing rusted steel underlayers. Details: Three rotary knobs (tarnished brass, 4cm diameter) labeled "VOL," "TUNE," "POWER." Cables: Braided wool cords (undyed cream yarn, 3cm thickness) coiled around the TV\'s base, fraying at the ends. Screen Imagery: Static Overlay: A 1953 RCA-style color bar test pattern (8 vertical bands) glitching every 2 seconds, causing the teal and pink bars to "melt" downward into liquid. Underlying Image: A faint, glowing topographical map (golden-yellow lines on indigo) labeled "DREAM ARCHIPELAGO" dissolves into water that cascades from the screen\'s crack, merging with the glacial lake. Environment: Glacial Lake: Semi-frozen water (translucent teal, 70% opacity) with jagged ice shards (20cm height) encircling the TV. Snowfall: Heavy, dense snowflakes (1cm diameter) falling at 45 degrees, accumulating on the TV\'s top-left corner. Aurora Borealis: Three parallel bands (pink #FFB3D1, teal #7FE5E5, gold #FFE44D) in smooth sine waves, 15° tilt, 80% opacity. Sky: Ultra-high-contrast starfield (ISO 51200 noise pattern) with 2,000 visible stars (randomized 2-4px white dots). Lighting & Effects: Key Light: A frontal, low-orange sodium vapor lamp (3200K) casting sharp diagonal shadows (20° angle) from the TV onto the ice. Bloom: Halation around the aurora and screen, radius 15px, intensity 70%. Textures: Film Grain: 35mm Kodak Vision3 250D overlay (gritty, high-detail). Lens Defects: Two hairline scratches (1px width) at 15° and 75° angles, plus hexagonal lens flare (60% opacity) from the aurora. Physics & Motion: Water: Viscous fluid dynamics—the leaking color bars swirl in 5cm eddies, blending with the glacial lake. Wool: Submerged yarn floats upward in 10cm tufts, swaying at 0.5Hz frequency. Result: A hyper-detailed, reference-free scene that implicitly channels Wes Anderson\'s aesthetic through obsessive symmetry, retro-kitsch materials, and a strict 60/30/10 pastel hierarchy—no director named, all style embedded in granular technical specs. The uploaded product maintains complete visual integrity throughout this elaborate scene, serving as the primary subject despite the artistic environment.',
        category: 'Special',
        difficulty: 'Advanced'
      }
    ];

    const selectedPrompt = prompts.find(p => p.id === promptId);
    if (!selectedPrompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid prompt ID' 
      });
    }

    const prompt = selectedPrompt.prompt;
    const variations = 2; // Generate 2 variations as requested

    // Generate multiple variations using GPT-image-01
    const transformedUrls: string[] = [];
    
    console.log(`[Prebuilt Transform] Generating ${variations} variations`);
    
    try {
      const response = await openai.images.edit({
        model: "gpt-image-01",
        image: fs.createReadStream(imagePath),
        prompt: prompt,
        n: 2, // Generate 2 variations in single call
        size: "1024x1024",
        response_format: "url"
      });

      if (response.data && response.data.length > 0) {
        // Download and save each variation
        for (let i = 0; i < response.data.length; i++) {
          const imageUrl = response.data[i].url;
          if (imageUrl) {
            const savedPath = await downloadAndSaveImage(imageUrl, `prebuilt-${promptId}-${i + 1}`);
            transformedUrls.push(savedPath);
            console.log(`[Prebuilt Transform] Variation ${i + 1} saved:`, savedPath);
          }
        }
      }
    } catch (error) {
      console.error(`[Prebuilt Transform] Error generating variations:`, error);
    }

    const processingTime = Math.round((Date.now() - startTime) / 1000);

    if (transformedUrls.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to generate any variations'
      });
    }

    console.log(`[Prebuilt Transform] Successfully generated ${transformedUrls.length} variations in ${processingTime}s`);

    res.json({
      success: true,
      originalImage: imagePath,
      transformedImages: transformedUrls,
      promptUsed: selectedPrompt,
      processingTime: processingTime,
      variations: transformedUrls.length
    });

  } catch (error) {
    console.error('[Prebuilt Transform] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to transform image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Export the upload middleware
export const uploadMiddleware = upload.single('image');
