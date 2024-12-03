const contentDiv = document.getElementById('content');
const statusDiv = document.getElementById('status');

function updateStatus(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'status-entry';
    logEntry.innerHTML = `${timestamp}: ${message}`;

    // Add new entry at the bottom
    statusDiv.appendChild(logEntry);

    // Scroll to the bottom
    statusDiv.scrollTop = statusDiv.scrollHeight;

    console.log(`Status: ${message}`);
}

function updateContent(content, title = '', classification = null) {
    contentDiv.innerHTML = '';

    if (title) {
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        titleElement.className = 'doc-title';
        contentDiv.appendChild(titleElement);
    }

    if (classification) {
        // Confidentiality Level Section
        const levelSection = document.createElement('div');
        levelSection.className = 'classification-section';

        const levelLabel = document.createElement('div');
        levelLabel.className = 'section-label';
        levelLabel.textContent = 'Confidentiality Level';
        levelSection.appendChild(levelLabel);

        const levelValue = document.createElement('div');
        levelValue.className = `level-indicator level-${classification['Confidentiality Level']}`;
        levelValue.textContent = getLevelText(classification['Confidentiality Level']);
        levelSection.appendChild(levelValue);

        contentDiv.appendChild(levelSection);

        // Justification Section
        const justificationSection = document.createElement('div');
        justificationSection.className = 'classification-section';

        const justificationLabel = document.createElement('div');
        justificationLabel.className = 'section-label';
        justificationLabel.textContent = 'Justification';
        justificationSection.appendChild(justificationLabel);

        const justificationValue = document.createElement('div');
        justificationValue.className = 'justification-text';
        justificationValue.textContent = classification.Justification;
        justificationSection.appendChild(justificationValue);

        contentDiv.appendChild(justificationSection);

        // Update Classification Button
        const updateButton = document.createElement('button');
        updateButton.className = 'update-button';
        updateButton.innerHTML = '<img src="images/update.png" alt="Update Classification" style="width: 16px; height: 16px; vertical-align: middle;" /> Update Classification';
        updateButton.onclick = () => {
            // Clear classification but keep title
            const title = contentDiv.querySelector('.doc-title');
            contentDiv.innerHTML = '';
            if (title) contentDiv.appendChild(title);

            updateStatus('Analyzing document...');
            chrome.runtime.sendMessage({ type: 'refreshContent' });
        };
        contentDiv.appendChild(updateButton);
    }
}

function getLevelText(level) {
    const levels = {
        0: 'Public',
        1: 'Internal Use',
        2: 'Restrictive',
        3: 'Confidential'
    };
    return levels[level] || 'Unknown';
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Message received:', message);

    if (message.type === 'statusUpdate') {
        updateStatus(message.status);
    } else if (message.type === 'contentUpdate') {
        if (message.error) {
            updateStatus(`Error: ${message.error}`);
            updateContent('', message.title);
        } else {
            updateContent('', message.title, message.classification);
        }
    }
});

// Initial status
updateStatus('Starting classification'); 