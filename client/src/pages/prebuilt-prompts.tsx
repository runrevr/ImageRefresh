import React from 'react';
import { useLocation } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Direct imports for result images
import promptResult001 from '@/assets/prompt-result-001.png';
import promptResult002 from '@/assets/prompt-result-002.png';
import promptResult003 from '@/assets/prompt-result-003.png';
import promptResult004 from '@/assets/prompt-result-004.png';
import promptResult005 from '@/assets/prompt-result-005.png';
import promptResult006 from '@/assets/prompt-result-006.png';
import promptResult007 from '@/assets/prompt-result-007.png';
import promptResult008 from '@/assets/prompt-result-008.png';
import promptResult009 from '@/assets/prompt-result-009.png';
import promptResult010 from '@/assets/prompt-result-010.png';
import promptResult011 from '@/assets/prompt-result-011.png';
import promptResult012 from '@/assets/prompt-result-012.png';
import promptResult013 from '@/assets/prompt-result-013.png';
import promptResult014 from '@/assets/prompt-result-014.png';
import promptResult015 from '@/assets/prompt-result-015.png';
import promptResult016 from '@/assets/prompt-result-016.png';
import promptResult017 from '@/assets/prompt-result-017.png';
import promptResult018 from '@/assets/prompt-result-018.png';
import promptResult019 from '@/assets/prompt-result-019.png';

// Result images for all 19 prompts
const resultImages = {
  'prompt-001': promptResult001, // Pure Catalog Ready (ceramic mug)
  'prompt-002': promptResult002, // Kitchen Lifestyle (honey jars)
  'prompt-003': promptResult003, // Nature's Embrace (witch hazel)
  'prompt-004': promptResult004, // Midnight Luxe (black wallet)
  'prompt-005': promptResult005, // Coastal Paradise (sunscreen)
  'prompt-006': promptResult006, // Heritage Charm (humidifier)
  'prompt-007': promptResult007, // Metropolitan Pulse (turntable)
  'prompt-008': promptResult008, // Curated Collection (water bottle)
  'prompt-009': promptResult009, // Artisan Crafted (ceramic mug variant)
  'prompt-010': promptResult010, // Festive Gathering (honey jars variant)
  'prompt-011': promptResult011, // Wellness Journey (witch hazel variant)
  'prompt-012': promptResult012, // Executive Excellence (black wallet variant)
  'prompt-013': promptResult013, // Beach Day Essential (sunscreen variant)
  'prompt-014': promptResult014, // Home Sanctuary (humidifier variant)
  'prompt-015': promptResult015, // Audio Experience (turntable variant)
  'prompt-016': promptResult016, // Active Lifestyle (water bottle variant)
  'prompt-017': promptResult017, // Professional Edge (ceramic mug business)
  'prompt-018': promptResult018, // Gourmet Experience (honey jars premium)
  'prompt-019': promptResult019, // Zen Moment (witch hazel spa)
};

export default function PrebuiltPrompts() {
  const [, setLocation] = useLocation();

  // Mock credits for development
  const freeCredits = 1;
  const paidCredits = 10;

  // 19 prebuilt prompts with actual content
  const prebuiltPrompts = [
    {
      id: 'prompt-001',
      title: 'Pure Catalog Ready',
      description: 'Professional e-commerce presentation with seamless white background and studio lighting',
      category: 'Professional',
      difficulty: 'Easy',
      promptText: 'Professional e-commerce presentation. The uploaded product stays perfectly intact as the hero element. Place on seamless white background with soft studio lighting from above and sides. Add gentle shadow beneath for depth. Even illumination eliminates harsh contrasts. Pure white backdrop, no distractions. Product fills 70% of frame. Clean, professional product photography style.',
      resultImage: resultImages['prompt-001']
    },
    {
      id: 'prompt-002', 
      title: 'Kitchen Lifestyle Story',
      description: 'Warm culinary scene with marble counter and morning sunlight',
      category: 'Lifestyle',
      difficulty: 'Medium',
      promptText: 'Warm culinary scene. The uploaded product remains unchanged as the central focus. Place on marble kitchen counter with morning sunlight through window. Include fresh herbs and coffee cup as subtle props. Blurred kitchen background with shallow depth of field. Warm, inviting atmosphere with natural light creating soft shadows.',
      resultImage: resultImages['prompt-002']
    },
    {
      id: 'prompt-003',
      title: 'Nature\'s Embrace',
      description: 'Organic outdoor setting with weathered wood and golden hour lighting',
      category: 'Background', 
      difficulty: 'Medium',
      promptText: 'Organic outdoor setting. The uploaded product stays perfectly preserved. Position on weathered wood with golden hour sunlight. Blurred forest background with bokeh effect. Include leaves or smooth stones as natural accents. Warm outdoor lighting with authentic atmosphere. Product sharp, background soft.',
      resultImage: resultImages['prompt-003']
    },
    {
      id: 'prompt-004',
      title: 'Midnight Luxe',
      description: 'Premium black backdrop with dramatic spotlight and rim lighting',
      category: 'Professional',
      difficulty: 'Advanced',
      promptText: 'Premium black backdrop. The uploaded product remains intact. Place on glossy black surface with dramatic spotlight from above creating rim lighting. Pure black background with elegant reflection below. Sophisticated studio lighting emphasizes quality. Moody, luxurious presentation.',
      resultImage: resultImages['prompt-004']
    },
    {
      id: 'prompt-005',
      title: 'Coastal Paradise',
      description: 'Bright beach atmosphere with sandy setting and ocean waves',
      category: 'Lifestyle',
      difficulty: 'Medium',
      promptText: 'Bright beach atmosphere. The uploaded product unchanged at center. Sandy beach setting with bright midday sun. Palm fronds and seashells as props. Blurred ocean waves in background. High-key lighting with warm color temperature. Summer vacation energy with clear product visibility.',
      resultImage: resultImages['prompt-005']
    },
    {
      id: 'prompt-006',
      title: 'Heritage Charm',
      description: 'Vintage nostalgic styling with distressed wood and warm lighting',
      category: 'Style',
      difficulty: 'Medium',
      promptText: 'Vintage nostalgic styling. The uploaded product perfectly preserved. Distressed wood surface with warm window light. Old books and dried flowers as vintage props. Subtle vignetting for aged effect. Rustic blurred background. Nostalgic atmosphere while maintaining product clarity.',
      resultImage: resultImages['prompt-006']
    },
    {
      id: 'prompt-007',
      title: 'Metropolitan Pulse',
      description: 'Urban energy backdrop with motion-blurred city streets',
      category: 'Background',
      difficulty: 'Advanced',
      promptText: 'Urban energy backdrop. The uploaded product sharp in foreground. Motion-blurred city street behind with bokeh lights. Concrete surface placement. Evening lighting mixing street lights and neon. Dynamic urban lifestyle feeling with crystal-clear product focus.',
      resultImage: resultImages['prompt-007']
    },
    {
      id: 'prompt-008',
      title: 'Curated Collection',
      description: 'Minimalist flat lay with complementary items and clean composition',
      category: 'Style',
      difficulty: 'Medium',
      promptText: 'Minimalist flat lay. The uploaded product as hero element. Top-down view with 3-4 complementary items arranged with breathing space. Clean marble or linen surface. Soft even lighting, no harsh shadows. Balanced composition following rule of thirds.',
      resultImage: resultImages['prompt-008']
    },
    {
      id: 'prompt-009',
      title: 'Gravity Defying',
      description: 'Floating product effect with soft shadows and studio lighting',
      category: 'Creative',
      difficulty: 'Advanced',
      promptText: 'Floating product effect. The uploaded product unchanged, appearing to levitate 12 inches above surface. Soft shadow showing height below. Light gradient background. Even studio lighting from multiple angles. Subtle motion blur at edges suggesting gentle movement.',
      resultImage: resultImages['prompt-009']
    },
    {
      id: 'prompt-010',
      title: 'Story Grid',
      description: 'Multiple angle showcase in 2x2 grid format',
      category: 'Enhancement',
      difficulty: 'Advanced',
      promptText: 'Multiple angle showcase. The uploaded product preserved in each frame. Create 2x2 grid showing: product solo on white, in-use scenario, with accessories, and detail shot. Consistent lighting across frames with thin borders. Each cell tells product story.',
      resultImage: resultImages['prompt-010']
    },
    {
      id: 'prompt-011',
      title: 'Monochrome Masterpiece',
      description: 'High contrast black and white with dramatic lighting',
      category: 'Artistic',
      difficulty: 'Medium',
      promptText: 'High contrast black and white. The uploaded product with all details preserved, converted to dramatic black and white. Strong directional lighting creating deep shadows and bright highlights. Rich tonal range emphasizing texture. All text remains legible through careful contrast.',
      resultImage: resultImages['prompt-011']
    },
    {
      id: 'prompt-012',
      title: 'Instant Memories',
      description: 'Classic polaroid style with vintage photo frame effect',
      category: 'Artistic',
      difficulty: 'Easy',
      promptText: 'Classic polaroid style. The uploaded product unchanged within instant photo frame. Square format with characteristic white border, thicker at bottom. Slightly faded colors with soft edges. Gentle light leaks in corners. Nostalgic snapshot feeling.',
      resultImage: resultImages['prompt-012']
    },
    {
      id: 'prompt-013',
      title: 'Electric Nights',
      description: 'Neon glow aesthetic with vibrant cyberpunk lighting',
      category: 'Creative',
      difficulty: 'Advanced',
      promptText: 'Neon glow aesthetic. The uploaded product intact with vibrant neon lighting. Pink, blue, and purple lights creating colorful reflections on product surface. Dark background enhancing neon contrast. Subtle lens flares from light sources. Cyberpunk energy.',
      resultImage: resultImages['prompt-013']
    },
    {
      id: 'prompt-014',
      title: 'Cinema Shadows',
      description: 'Film noir atmosphere with dramatic black and white treatment',
      category: 'Artistic',
      difficulty: 'Advanced',
      promptText: 'Film noir atmosphere. The uploaded product visible with dramatic black and white treatment. Strong side lighting creating bold shadows. Film grain texture with slight vignetting. Mystery atmosphere while maintaining text legibility.',
      resultImage: resultImages['prompt-014']
    },
    {
      id: 'prompt-015',
      title: 'Sunset Magic',
      description: 'Golden hour warmth with orange and amber tones',
      category: 'Lighting',
      difficulty: 'Medium',
      promptText: 'Golden hour warmth. The uploaded product bathed in warm sunset light. Orange and amber tones with long shadows. Soft lens flare and atmospheric haze. Dreamy golden hour quality maintaining product colors.',
      resultImage: resultImages['prompt-015']
    },
    {
      id: 'prompt-016',
      title: 'Nordic Fresh',
      description: 'Scandinavian aesthetic with bright, cool processing',
      category: 'Style',
      difficulty: 'Easy',
      promptText: 'Scandinavian aesthetic. The uploaded product with bright, cool processing. Slightly overexposed with blue undertones. Soft diffused lighting like overcast Nordic day. Minimal shadows, crisp and clean feeling.',
      resultImage: resultImages['prompt-016']
    },
    {
      id: 'prompt-017',
      title: 'Analog Soul',
      description: 'Film photography look with vintage 35mm aesthetic',
      category: 'Artistic',
      difficulty: 'Medium',
      promptText: 'Film photography look. The uploaded product with vintage 35mm aesthetic. Characteristic film colors and organic grain. Natural halation around highlights. Authentic analog feeling preserving product accuracy.',
      resultImage: resultImages['prompt-017']
    },
    {
      id: 'prompt-018',
      title: 'Morning Mist',
      description: 'Ethereal fog atmosphere with soft layers and light rays',
      category: 'Lighting',
      difficulty: 'Advanced',
      promptText: 'Ethereal fog atmosphere. The uploaded product emerging from soft morning fog. Multiple fog layers with product in sharp focus. Delicate light rays through haze. Moisture droplets on surface. Mystical, fresh atmosphere.',
      resultImage: resultImages['prompt-018']
    },
    {
      id: 'prompt-019',
      title: 'Aurora Dreams',
      description: 'Arctic wonderland scene with cinematic staging and pastel colors',
      category: 'Special',
      difficulty: 'Advanced',
      promptText: 'Arctic wonderland scene. The uploaded product remains perfectly intact with all original colors, labels, text, branding, and details unchanged as the absolute focal point of the composition. Create a meticulously staged cinematic scene with rigid symmetry and frontal, low-angle framing, emphasizing a diagonal composition (45-degree tilt) where all elements align along a single dynamic axis. Color Grading: 60% Dominant: Soft, powdery pastel pinks (Pantone 12-1109 TPX "Marshmallow") saturating the sky, snow, and TV casing. 30% Secondary: Frosted teal blues (HEX #6ECEDA) in the glacial lake, aurora, and TV screen static. 10% Accent: Mustard-yellow (Pantone 15-0950 TPX "Golden Glow") in the aurora streaks, wool tufts, and corroded metal knobs. TV Design: A 1950s Bakelite TV (matte eggshell plastic with hairline cracks) tilted diagonally (top-left corner at 10 o\'clock, bottom-right submerged at 4 o\'clock). Crack: A jagged diagonal fissure (2cm wide) splits the screen from top-left to bottom-right, leaking viscous, neon-bright color bar pigment (RGB values: pink #FF9EB5, teal #5FDAC3, gold #FFD700) that pools into the water below. Materials: Body: Faux-weathered plastic with chipped edges revealing rusted steel underlayers. Details: Three rotary knobs (tarnished brass, 4cm diameter) labeled "VOL," "TUNE," "POWER." Cables: Braided wool cords (undyed cream yarn, 3cm thickness) coiled around the TV\'s base, fraying at the ends. Screen Imagery: Static Overlay: A 1953 RCA-style color bar test pattern (8 vertical bands) glitching every 2 seconds, causing the teal and pink bars to "melt" downward into liquid. Underlying Image: A faint, glowing topographical map (golden-yellow lines on indigo) labeled "DREAM ARCHIPELAGO" dissolves into water that cascades from the screen\'s crack, merging with the glacial lake. Environment: Glacial Lake: Semi-frozen water (translucent teal, 70% opacity) with jagged ice shards (20cm height) encircling the TV. Snowfall: Heavy, dense snowflakes (1cm diameter) falling at 45 degrees, accumulating on the TV\'s top-left corner. Aurora Borealis: Three parallel bands (pink #FFB3D1, teal #7FE5E5, gold #FFE44D) in smooth sine waves, 15° tilt, 80% opacity. Sky: Ultra-high-contrast starfield (ISO 51200 noise pattern) with 2,000 visible stars (randomized 2-4px white dots). Lighting & Effects: Key Light: A frontal, low-orange sodium vapor lamp (3200K) casting sharp diagonal shadows (20° angle) from the TV onto the ice. Bloom: Halation around the aurora and screen, radius 15px, intensity 70%. Textures: Film Grain: 35mm Kodak Vision3 250D overlay (gritty, high-detail). Lens Defects: Two hairline scratches (1px width) at 15° and 75° angles, plus hexagonal lens flare (60% opacity) from the aurora. Physics & Motion: Water: Viscous fluid dynamics—the leaking color bars swirl in 5cm eddies, blending with the glacial lake. Wool: Submerged yarn floats upward in 10cm tufts, swaying at 0.5Hz frequency. Result: A hyper-detailed, reference-free scene that implicitly channels Wes Anderson\'s aesthetic through obsessive symmetry, retro-kitsch materials, and a strict 60/30/10 pastel hierarchy—no director named, all style embedded in granular technical specs. The uploaded product maintains complete visual integrity throughout this elaborate scene, serving as the primary subject despite the artistic environment.',
      resultImage: resultImages['prompt-019']
    }
  ];

  const handleSelectPrompt = (prompt: any) => {
    // Store the selected prompt in sessionStorage
    sessionStorage.setItem('selectedPrebuiltPrompt', JSON.stringify(prompt));
    // Navigate to upload page
    setLocation('/prebuilt-upload');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Enhancement': 'bg-blue-100 text-blue-800',
      'Style': 'bg-purple-100 text-purple-800', 
      'Background': 'bg-indigo-100 text-indigo-800',
      'Lighting': 'bg-orange-100 text-orange-800',
      'Professional': 'bg-gray-100 text-gray-800',
      'Creative': 'bg-pink-100 text-pink-800',
      'Artistic': 'bg-teal-100 text-teal-800',
      'Lifestyle': 'bg-green-100 text-green-800',
      'Special': 'bg-red-100 text-red-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar freeCredits={freeCredits} paidCredits={paidCredits} />
      <main className="flex-grow pt-16">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#1F2937] mb-4">
              Prebuilt Prompts
            </h1>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Expert-designed prompts to quickly transform your product images
            </p>
            <div className="mt-6 flex justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {prebuiltPrompts.length} Professional Prompts Available
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {prebuiltPrompts.map((prompt, index) => (
              <div 
                key={prompt.id}
                onClick={() => handleSelectPrompt(prompt)}
                className="h-full overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-[#E5E7EB] hover:border-[#06B6D4] hover:scale-[1.03] cursor-pointer rounded-lg"
              >
                <div className="relative">
                  {/* Background image placeholder with overlay */}
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    {/* Show result image if available, otherwise show number */}
                    {prompt.resultImage ? (
                      <img 
                        src={prompt.resultImage} 
                        alt={`${prompt.title} result example`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-cover bg-center flex items-center justify-center">
                        <div className="text-4xl font-bold text-gray-400">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/80 flex flex-col items-center justify-end px-4 py-6 text-center">
                      {/* Category and Difficulty badges */}
                      <div className="flex gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(prompt.category)}`}>
                          {prompt.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(prompt.difficulty)}`}>
                          {prompt.difficulty}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold mb-2 text-white">
                        {prompt.title}
                      </h3>
                      <p className="text-sm text-white/90 mb-4 line-clamp-2">
                        {prompt.description}
                      </p>
                      <button className="bg-[#F97316] hover:bg-[#F97316]/90 text-white py-2 px-4 rounded-lg transition-colors font-medium text-sm">
                        Use This Prompt
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => {
                console.log('Back button clicked - going to product-image-lab');
                window.location.href = '/product-image-lab';
              }}
              className="px-8 py-3 border border-[#E5E7EB] text-[#6B7280] rounded-lg hover:bg-[#FAFAFA] hover:border-[#06B6D4] transition-colors"
            >
              ← Back to Product Lab
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}