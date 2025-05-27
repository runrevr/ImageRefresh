
// Custom AI Prompts Beta - JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const selectBtn = document.getElementById('selectBtn');
    const previewSection = document.getElementById('previewSection');
    const preview = document.getElementById('preview');
    const changeImage = document.getElementById('changeImage');
    const promptSection = document.getElementById('promptSection');
    const promptInput = document.getElementById('promptInput');
    const helperBtns = document.querySelectorAll('.helper-btn');
    const transformBtn = document.getElementById('transformBtn');
    const resultSection = document.getElementById('resultSection');

    let currentFile = null;

    // File upload handlers
    selectBtn.addEventListener('click', () => fileInput.click());
    changeImage.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Prompt helper buttons
    helperBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.text;
            const currentValue = promptInput.value;
            
            if (currentValue) {
                promptInput.value = currentValue + ', ' + text;
            } else {
                promptInput.value = text;
            }
            
            // Focus back to textarea
            promptInput.focus();
        });
    });

    // Transform button
    transformBtn.addEventListener('click', handleTransform);

    // Prompt input character counter
    promptInput.addEventListener('input', function() {
        const remaining = 500 - this.value.length;
        if (remaining < 50) {
            this.style.borderColor = remaining < 0 ? '#dc3545' : '#ffc107';
        } else {
            this.style.borderColor = '#ddd';
        }
    });

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            currentFile = file;
            displayPreview(file);
        }
    }

    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            currentFile = files[0];
            fileInput.files = files; // Update file input
            displayPreview(files[0]);
        }
    }

    function displayPreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            previewSection.style.display = 'block';
            promptSection.style.display = 'block';
            uploadArea.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    async function handleTransform() {
        if (!currentFile) {
            showResult('error', 'Please select an image first.');
            return;
        }

        const prompt = promptInput.value.trim();
        if (!prompt) {
            showResult('error', 'Please describe how you want to transform your image.');
            return;
        }

        if (prompt.length > 500) {
            showResult('error', 'Prompt is too long. Maximum 500 characters allowed.');
            return;
        }

        // Disable button and show loading
        transformBtn.disabled = true;
        transformBtn.textContent = 'Transforming...';
        showResult('loading', 'Processing your custom transformation...');

        try {
            // Convert image to base64
            const base64Image = await fileToBase64(currentFile);
            
            // Prepare request data
            const requestData = {
                imageBase64: base64Image,
                customPrompt: prompt,
                userId: 'beta-user' // For beta testing
            };

            // Call the custom prompt transform API
            const response = await fetch('/api/beta/custom-prompt-transform', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                showResult('success', 'Transformation completed!', result.transformedImageUrl);
            } else {
                showResult('error', result.error || 'Transformation failed. Please try again.');
            }

        } catch (error) {
            console.error('Transform error:', error);
            showResult('error', 'Network error. Please check your connection and try again.');
        } finally {
            // Re-enable button
            transformBtn.disabled = false;
            transformBtn.textContent = 'Transform Image';
        }
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    function showResult(type, message, imageUrl = null) {
        resultSection.style.display = 'block';
        resultSection.className = `result-section ${type}`;
        
        let content = `<p>${message}</p>`;
        
        if (imageUrl) {
            content += `
                <div style="margin-top: 20px;">
                    <img src="${imageUrl}" alt="Transformed Image" style="max-width: 100%; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                    <div style="margin-top: 15px;">
                        <a href="${imageUrl}" download="transformed-image.png" style="background: #2A7B9B; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; display: inline-block;">Download Image</a>
                    </div>
                </div>
            `;
        }
        
        resultSection.innerHTML = content;
        resultSection.scrollIntoView({ behavior: 'smooth' });
    }

    // Example prompts for inspiration
    const examplePrompts = [
        "floating on white background with soft shadows and reflections",
        "in a luxury lifestyle setting with elegant lighting",
        "with dynamic motion effects and energy particles",
        "in a minimalist studio setup with professional lighting",
        "surrounded by complementary props in natural lighting"
    ];

    // Add example prompt hint
    promptInput.addEventListener('focus', function() {
        if (!this.value) {
            const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
            this.placeholder = `Example: ${randomPrompt}`;
        }
    });
});
