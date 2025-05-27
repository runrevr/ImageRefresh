// Custom Prompt Upload Handler - Completely Independent

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const previewSection = document.getElementById('previewSection');
const promptSection = document.getElementById('promptSection');
const preview = document.getElementById('preview');
const promptInput = document.getElementById('promptInput');
const transformBtn = document.getElementById('transformBtn');

let selectedFile = null;

// File selection
selectBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    }
});

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
}

function handleFile(file) {
    selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
        preview.src = e.target.result;
        uploadArea.style.display = 'none';
        previewSection.style.display = 'block';
        promptSection.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Prompt helpers
document.querySelectorAll('.helper-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-text');
        promptInput.value += (promptInput.value ? ' ' : '') + text;
    });
});

// Transform
transformBtn.addEventListener('click', async () => {
    if (!selectedFile || !promptInput.value.trim()) {
        alert('Please select an image and enter a prompt');
        return;
    }

    transformBtn.disabled = true;
    transformBtn.textContent = 'Processing...';

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('prompt', promptInput.value);

    try {
        const response = await fetch('/api/beta/custom-prompt-transform', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            // Handle successful transformation
            console.log('Transformation started:', result.jobId);
            // Add your result handling here
        } else {
            alert('Transformation failed: ' + result.error);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    } finally {
        transformBtn.disabled = false;
        transformBtn.textContent = 'Transform Image';
    }
});