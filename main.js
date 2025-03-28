document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const submitButton = document.getElementById('submitButton');
    const loadingSection = document.getElementById('loading');
    const resultsSection = document.getElementById('results');
    const errorMessage = document.getElementById('errorMessage');
    const candidatesList = document.getElementById('candidatesList');

    // Drag and drop handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        fileInput.files = files;
        updateFileList();
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', updateFileList);

    function updateFileList() {
        const fileList = document.getElementById('fileList');
        fileList.innerHTML = '';
        Array.from(fileInput.files).forEach(file => {
            const li = document.createElement('li');
            li.textContent = file.name;
            fileList.appendChild(li);
        });
    }

    submitButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const jobDescription = document.getElementById('jobDescription').value;
        const files = fileInput.files;

        if (!jobDescription || files.length === 0) {
            showError('Please provide both job description and resume files.');
            return;
        }

        showLoading();
        
        const formData = new FormData();
        formData.append('job_description', jobDescription);
        Array.from(files).forEach(file => {
            formData.append('resumes', file);
        });

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Server error');
            }

            const results = await response.json();
            displayResults(results);
        } catch (error) {
            showError('An error occurred while processing the resumes.');
        } finally {
            hideLoading();
        }
    });

    function displayResults(results) {
        candidatesList.innerHTML = '';
        results.forEach(result => {
            const candidateCard = document.createElement('div');
            candidateCard.className = 'candidate-card';
            candidateCard.innerHTML = `
                <div class="candidate-info">
                    <h3>${result.filename}</h3>
                    <p>${result.preview}</p>
                </div>
                <div class="match-score">${Math.round(result.score * 100)}%</div>
            `;
            candidatesList.appendChild(candidateCard);
        });
        resultsSection.style.display = 'block';
    }

    function showLoading() {
        loadingSection.style.display = 'block';
        resultsSection.style.display = 'none';
        errorMessage.style.display = 'none';
    }

    function hideLoading() {
        loadingSection.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
});
