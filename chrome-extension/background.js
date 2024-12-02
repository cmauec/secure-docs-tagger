chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Error setting panel behavior:', error));

// Function to extract document ID from Google Docs URL
function getDocumentIdFromUrl(url) {
    const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
}

// Function to get auth token
async function getAuthToken() {
    try {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, function (token) {
                if (chrome.runtime.lastError) {
                    console.error('Auth error:', chrome.runtime.lastError);
                    reject(chrome.runtime.lastError);
                } else {
                    console.log('Token obtained successfully');
                    resolve(token);
                }
            });
        });
    } catch (error) {
        console.error('Error getting auth token:', error);
        chrome.runtime.sendMessage({
            type: 'contentUpdate',
            error: 'Authentication failed. Please check console for details.'
        });
        return null;
    }
}

// Function to fetch document content
async function fetchDocumentContent(documentId, token) {
    try {
        console.log('Fetching document:', documentId);
        const response = await fetch(
            `https://docs.googleapis.com/v1/documents/${documentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);

            if (response.status === 401) {
                // Token might be expired, try to remove it and get a new one
                await new Promise((resolve) => chrome.identity.removeCachedAuthToken({ token }, resolve));
                const newToken = await getAuthToken();
                if (newToken) {
                    return fetchDocumentContent(documentId, newToken);
                }
            }

            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Document fetched successfully');
        return data;
    } catch (error) {
        console.error('Error fetching document:', error);
        return null;
    }
}

// Function to extract text from document structure
function extractTextFromDoc(doc) {
    try {
        let text = '';
        if (doc.body && doc.body.content) {
            doc.body.content.forEach(element => {
                if (element.paragraph) {
                    element.paragraph.elements.forEach(elem => {
                        if (elem.textRun && elem.textRun.content) {
                            text += elem.textRun.content;
                        }
                    });
                }
            });
        }
        return text || 'No text content found in document';
    } catch (error) {
        console.error('Error extracting text:', error);
        return null;
    }
}

// Function to process Google Doc
async function processGoogleDoc(tab) {
    try {
        if (!tab) {
            console.log('No tab provided');
            return;
        }

        chrome.runtime.sendMessage({
            type: 'statusUpdate',
            status: 'Loading document...'
        });

        console.log('Processing tab:', tab);

        if (tab.url && tab.url.includes('docs.google.com/document')) {
            console.log('Google Doc detected:', tab.url);
            const documentId = getDocumentIdFromUrl(tab.url);

            if (documentId) {
                console.log('Document ID:', documentId);

                const token = await getAuthToken();
                if (token) {
                    const docData = await fetchDocumentContent(documentId, token);
                    if (docData) {
                        const content = extractTextFromDoc(docData);

                        chrome.runtime.sendMessage({
                            type: 'statusUpdate',
                            status: 'Initializing AI model...'
                        });

                        // Check AI capabilities
                        const capabilities = await chrome.aiOriginTrial.languageModel.capabilities();
                        console.log('AI capabilities:', capabilities.available);

                        let classification = null;
                        if (capabilities.available) {
                            try {
                                chrome.runtime.sendMessage({
                                    type: 'statusUpdate',
                                    status: 'Creating AI session...'
                                });

                                // Create AI session for classification
                                const session = await chrome.aiOriginTrial.languageModel.create({
                                    systemPrompt: `Classify the confidentiality level of a document into one of the four provided categories: Public (0), Internal Use (1), Restrictive (2), Confidential (3).
                                    Carefully analyze the content of the document and determine the most appropriate level, providing a clear and logical justification for why that level was assigned. Ensure that the justification explains how the document's content aligns with the selected category, considering aspects such as disclosure risk, information sensitivity, and intended access scope.
                                    # Confidentiality Levels
                                    - **Public (0)**: Information that can be made available to anyone and poses no risk if disclosed.
                                    - **Internal Use (1)**: Information intended primarily for internal use within the organization but with low impact if disclosed externally.
                                    - **Restrictive (2)**: Information with significant restrictions that could negatively affect the organization or its members if disclosed.
                                    - **Confidential (3)**: Highly sensitive information that, if disclosed, could cause severe harm to the organization or its interests.
                                    # Output Format
                                    The result must be provided in JSON format as shown below:
                                    {
                                    "Confidentiality Level": number,
                                    "Justification": "justification for the classification"
                                    }
                                    # Notes
                                    - Always provide a clear justification for the chosen confidentiality level.
                                    - Avoid justifying based solely on the title or keywords; consider the full context of the document.
                                    - Ensure that the classification and reasoning fully align with the level of risk posed by disclosure.
                                    # Important
                                    - You must respond ONLY with a JSON object in the exact format specified above.
                                    - Do not include any additional text or explanation outside the JSON object.
                                    - The "Confidentiality Level" must be a number (0, 1, 2, or 3), not a string.`,
                                    language: 'en'
                                });

                                chrome.runtime.sendMessage({
                                    type: 'statusUpdate',
                                    status: 'Analyzing document content...'
                                });

                                // Get classification from AI
                                const aiResponse = await session.prompt(content);
                                console.log('Raw AI Response:', aiResponse);

                                // Parse the response to ensure it's valid JSON
                                try {
                                    // If the response is already an object, use it directly
                                    if (typeof aiResponse === 'object' && aiResponse !== null) {
                                        classification = aiResponse;
                                    } else {
                                        // Try to parse the response as JSON
                                        classification = JSON.parse(aiResponse);
                                    }

                                    // Validate the response format
                                    if (!('Confidentiality Level' in classification) || !('Justification' in classification)) {
                                        throw new Error('Invalid response format');
                                    }

                                    // Ensure Confidentiality Level is a number
                                    classification['Confidentiality Level'] = Number(classification['Confidentiality Level']);
                                    if (isNaN(classification['Confidentiality Level']) ||
                                        classification['Confidentiality Level'] < 0 ||
                                        classification['Confidentiality Level'] > 3) {
                                        throw new Error('Invalid confidentiality level');
                                    }

                                    chrome.runtime.sendMessage({
                                        type: 'statusUpdate',
                                        status: 'Document classified successfully'
                                    });

                                    console.log('Parsed Classification:', classification);
                                } catch (parseError) {
                                    console.error('Error parsing AI response:', parseError);
                                    classification = {
                                        'Confidentiality Level': 0,
                                        'Justification': 'Error processing classification. Defaulting to Public level.'
                                    };
                                }
                            } catch (aiError) {
                                console.error('Error in AI classification:', aiError);
                                chrome.runtime.sendMessage({
                                    type: 'statusUpdate',
                                    status: 'Error in AI classification'
                                });
                            }
                        }

                        chrome.runtime.sendMessage({
                            type: 'contentUpdate',
                            error: content ? null : 'Failed to load document content',
                            title: tab.title || docData.title,
                            documentId: documentId,
                            classification: classification
                        });
                    }
                }
            } else {
                chrome.runtime.sendMessage({
                    type: 'contentUpdate',
                    error: 'Could not extract document ID from URL'
                });
            }
        } else {
            chrome.runtime.sendMessage({
                type: 'contentUpdate',
                error: 'Not a Google Doc'
            });
        }
    } catch (error) {
        console.error('Error processing Google Doc:', error);
        chrome.runtime.sendMessage({
            type: 'contentUpdate',
            error: 'Error processing Google Doc'
        });
    }
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'refreshContent') {
        chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
            if (tabs[0]) {
                await processGoogleDoc(tabs[0]);
            }
        });
    }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0] && tabs[0].id === tabId) {
                processGoogleDoc(tab);
            }
        });
    }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        processGoogleDoc(tab);
    } catch (error) {
        console.error('Error getting tab info:', error);
    }
}); 