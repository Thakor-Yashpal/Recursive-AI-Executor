// Application state
let currentState = {
    isExecuting: false,
    currentAttempt: 0,
    maxAttempts: 5,
    executionTimeout: 10,
    startTime: null,
    currentPrompt: '',
    generatedCode: '',
    executionResults: []
};

// Sample data for simulation
const sampleData = {
    prompts: [
        "Create a function to calculate factorial of a number",
        "Generate code to read a CSV file and calculate averages", 
        "Write a function to find prime numbers up to N",
        "Create a class for managing a simple todo list",
        "Generate code to sort a list using quicksort algorithm"
    ],
    codeExamples: {
        factorial: {
            attempts: [
                {
                    code: `def factorial(n):
    if n = 1:  # Syntax error here
        return 1
    return n * factorial(n-1)

# Test the function
print(f"Factorial of 5: {factorial(5)}")`,
                    error: "SyntaxError: invalid syntax (line 2)",
                    success: false
                },
                {
                    code: `def factorial(n):
    if n == 1 or n == 0:
        return 1
    return n * factorial(n-1)

# Test the function
print(f"Factorial of 5: {factorial(5)}")`,
                    output: "Factorial of 5: 120",
                    success: true
                }
            ]
        },
        prime: {
            attempts: [
                {
                    code: `def find_primes(n):
    primes = []
    for i in range(2, n):
        is_prime = True
        for j in range(2, i):
            if i % j == 0:
                is_prime = False
                break
        if is_prime:
            primes.append(i)
    return primes

# Test the function
primes = find_primes(20)
print(f"Prime numbers up to 20: {primes}")`,
                    output: "Prime numbers up to 20: [2, 3, 5, 7, 11, 13, 17, 19]",
                    success: true
                }
            ]
        },
        todo: {
            attempts: [
                {
                    code: `class TodoList:
    def __init__(self):
        self.tasks = []
    
    def add_task(self, task):
        self.tasks.append({"task": task, "completed": False})
    
    def complete_task(self, index):
        if 0 <= index < len(self.tasks):
            self.tasks[index]["completed"] = True
    
    def list_tasks(self):
        for i, task in enumerate(self.tasks):
            status = "✓" if task["completed"] else "○"
            print(f"{i+1}. {status} {task['task']}")

# Test the class
todo = TodoList()
todo.add_task("Buy groceries")
todo.add_task("Walk the dog")
todo.complete_task(0)
todo.list_tasks()`,
                    output: `1. ✓ Buy groceries
2. ○ Walk the dog`,
                    success: true
                }
            ]
        },
        quicksort: {
            attempts: [
                {
                    code: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x = pivot]  # Error here
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Test the function
test_array = [3, 6, 8, 10, 1, 2, 1]
sorted_array = quicksort(test_array)
print(f"Original: {test_array}")
print(f"Sorted: {sorted_array}")`,
                    error: "SyntaxError: invalid syntax (line 7)",
                    success: false
                },
                {
                    code: `def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Test the function
test_array = [3, 6, 8, 10, 1, 2, 1]
sorted_array = quicksort(test_array)
print(f"Original: {test_array}")
print(f"Sorted: {sorted_array}")`,
                    output: `Original: [3, 6, 8, 10, 1, 2, 1]
Sorted: [1, 1, 2, 3, 6, 8, 10]`,
                    success: true
                }
            ]
        },
        csv: {
            attempts: [
                {
                    code: `import csv
import statistics

def analyze_csv_data():
    # Simulate CSV data
    data = [
        ['Name', 'Age', 'Score'],
        ['Alice', '25', '85'],
        ['Bob', '30', '92'],
        ['Charlie', '35', '78'],
        ['Diana', '28', '96']
    ]
    
    ages = [int(row[1]) for row in data[1:]]
    scores = [int(row[2]) for row in data[1:]]
    
    print("CSV Data Analysis:")
    print(f"Average age: {statistics.mean(ages):.1f}")
    print(f"Average score: {statistics.mean(scores):.1f}")
    print(f"Highest score: {max(scores)}")
    print(f"Lowest score: {min(scores)}")

# Run analysis
analyze_csv_data()`,
                    output: `CSV Data Analysis:
Average age: 29.5
Average score: 87.8
Highest score: 96
Lowest score: 78`,
                    success: true
                }
            ]
        }
    }
};

// DOM elements
let elements = {};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing app...');
    
    // Initialize DOM elements
    elements = {
        promptInput: document.getElementById('promptInput'),
        runBtn: document.getElementById('runBtn'),
        clearBtn: document.getElementById('clearBtn'),
        codeViewer: document.getElementById('codeViewer'),
        executionLog: document.getElementById('executionLog'),
        statusIndicator: document.getElementById('statusIndicator'),
        statusText: document.getElementById('statusText'),
        attemptCount: document.getElementById('attemptCount'),
        maxAttempts: document.getElementById('maxAttempts'),
        executionTime: document.getElementById('executionTime'),
        helpBtn: document.getElementById('helpBtn'),
        settingsBtn: document.getElementById('settingsBtn'),
        helpModal: document.getElementById('helpModal'),
        settingsModal: document.getElementById('settingsModal'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        loadingText: document.getElementById('loadingText')
    };

    console.log('Elements initialized:', elements);
    
    initializeEventListeners();
    initializeSettings();
    updateUI();
});

function initializeEventListeners() {
    console.log('Initializing event listeners...');
    
    try {
        // Sample prompts
        document.querySelectorAll('.sample-item').forEach((item, index) => {
            console.log(`Adding click listener to sample item ${index}`);
            item.addEventListener('click', function() {
                const prompt = this.dataset.prompt;
                console.log('Sample item clicked:', prompt);
                elements.promptInput.value = prompt;
                elements.promptInput.focus();
            });
        });

        // Main actions
        if (elements.runBtn) {
            elements.runBtn.addEventListener('click', function() {
                console.log('Run button clicked');
                executePrompt();
            });
        }
        
        if (elements.clearBtn) {
            elements.clearBtn.addEventListener('click', function() {
                console.log('Clear button clicked');
                clearAll();
            });
        }

        // Code actions
        const copyCodeBtn = document.getElementById('copyCodeBtn');
        const downloadCodeBtn = document.getElementById('downloadCodeBtn');
        
        if (copyCodeBtn) {
            copyCodeBtn.addEventListener('click', copyCode);
        }
        
        if (downloadCodeBtn) {
            downloadCodeBtn.addEventListener('click', downloadCode);
        }

        // Log actions
        const clearLogBtn = document.getElementById('clearLogBtn');
        const downloadLogBtn = document.getElementById('downloadLogBtn');
        
        if (clearLogBtn) {
            clearLogBtn.addEventListener('click', clearLog);
        }
        
        if (downloadLogBtn) {
            downloadLogBtn.addEventListener('click', downloadLog);
        }

        // Modal controls
        if (elements.helpBtn) {
            elements.helpBtn.addEventListener('click', function() {
                console.log('Help button clicked');
                showModal('helpModal');
            });
        }
        
        if (elements.settingsBtn) {
            elements.settingsBtn.addEventListener('click', function() {
                console.log('Settings button clicked');
                showModal('settingsModal');
            });
        }
        
        const closeHelpModal = document.getElementById('closeHelpModal');
        const closeSettingsModal = document.getElementById('closeSettingsModal');
        
        if (closeHelpModal) {
            closeHelpModal.addEventListener('click', () => hideModal('helpModal'));
        }
        
        if (closeSettingsModal) {
            closeSettingsModal.addEventListener('click', () => hideModal('settingsModal'));
        }
        
        // Close modals on backdrop click
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
            backdrop.addEventListener('click', function() {
                const modal = this.parentElement;
                hideModal(modal.id);
            });
        });

        // Settings
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettings);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        if (!currentState.isExecuting) {
                            executePrompt();
                        }
                        e.preventDefault();
                        break;
                    case 'k':
                        clearAll();
                        e.preventDefault();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                hideAllModals();
            }
        });
        
        console.log('Event listeners initialized successfully');
    } catch (error) {
        console.error('Error initializing event listeners:', error);
    }
}

function initializeSettings() {
    try {
        const savedSettings = localStorage.getItem('recursiveAISettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            currentState.maxAttempts = settings.maxAttempts || 5;
            currentState.executionTimeout = settings.timeout || 10;
            
            const maxAttemptsSelect = document.getElementById('maxAttemptsSelect');
            const timeoutSelect = document.getElementById('timeoutSelect');
            const themeSelect = document.getElementById('themeSelect');
            
            if (maxAttemptsSelect) maxAttemptsSelect.value = currentState.maxAttempts;
            if (timeoutSelect) timeoutSelect.value = currentState.executionTimeout;
            
            if (settings.theme && themeSelect) {
                document.documentElement.setAttribute('data-color-scheme', settings.theme);
                themeSelect.value = settings.theme;
            }
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
}

async function executePrompt() {
    console.log('Execute prompt called');
    
    const prompt = elements.promptInput.value.trim();
    
    if (!prompt) {
        showNotification('Please enter a prompt first', 'warning');
        return;
    }
    
    if (currentState.isExecuting) {
        console.log('Already executing, returning');
        return;
    }

    console.log('Starting execution for prompt:', prompt);

    // Reset state
    currentState.isExecuting = true;
    currentState.currentAttempt = 0;
    currentState.startTime = Date.now();
    currentState.currentPrompt = prompt;
    currentState.executionResults = [];

    // Update UI
    updateStatus('processing', 'Initializing...');
    if (elements.runBtn) {
        elements.runBtn.classList.add('loading');
        elements.runBtn.disabled = true;
    }
    showLoadingSpinner('Analyzing prompt...');

    // Clear previous results
    clearPreviousResults();

    // Add initial log entry
    addLogEntry('info', `Starting execution for prompt: "${prompt}"`);

    try {
        // Start execution process
        await executeRecursively();
    } catch (error) {
        console.error('Error during execution:', error);
        addLogEntry('error', `Execution error: ${error.message}`);
        updateStatus('error', 'Execution failed');
        currentState.isExecuting = false;
        if (elements.runBtn) {
            elements.runBtn.classList.remove('loading');
            elements.runBtn.disabled = false;
        }
        hideLoadingSpinner();
    }
}

function clearPreviousResults() {
    if (elements.codeViewer) {
        elements.codeViewer.innerHTML = '';
    }
    if (elements.executionLog) {
        elements.executionLog.innerHTML = '';
    }
}

async function executeRecursively() {
    console.log('Starting recursive execution');
    
    while (currentState.currentAttempt < currentState.maxAttempts && currentState.isExecuting) {
        currentState.currentAttempt++;
        updateUI();
        
        console.log(`Attempt ${currentState.currentAttempt}/${currentState.maxAttempts}`);
        
        addLogEntry('info', `Attempt ${currentState.currentAttempt}/${currentState.maxAttempts}: Generating code...`);
        updateStatus('processing', `Generating code (Attempt ${currentState.currentAttempt})...`);
        updateLoadingText('Generating code with AI...');
        
        // Simulate AI code generation delay
        await delay(1500);
        
        const codeResult = generateCode(currentState.currentPrompt, currentState.currentAttempt);
        console.log('Generated code result:', codeResult);
        
        // Display generated code
        displayCode(codeResult.code);
        addLogEntry('info', 'Code generated successfully. Executing...');
        
        updateStatus('processing', 'Executing code...');
        updateLoadingText('Executing Python code...');
        
        // Simulate code execution delay
        await delay(2000);
        
        // Execute code
        const executionResult = await executeCode(codeResult);
        console.log('Execution result:', executionResult);
        
        if (executionResult.success) {
            // Success!
            addLogEntry('success', `Execution successful!`);
            addLogEntry('success', `Output:\n${executionResult.output}`);
            updateStatus('success', 'Execution completed successfully');
            hideLoadingSpinner();
            break;
        } else {
            // Error occurred
            addLogEntry('error', `Execution failed: ${executionResult.error}`);
            
            if (currentState.currentAttempt >= currentState.maxAttempts) {
                addLogEntry('error', 'Maximum attempts reached. Execution failed.');
                updateStatus('error', 'Execution failed - max attempts reached');
                hideLoadingSpinner();
                break;
            } else {
                addLogEntry('warning', 'Retrying with error context...');
                await delay(1000);
            }
        }
    }
    
    // Cleanup
    console.log('Execution completed, cleaning up');
    currentState.isExecuting = false;
    if (elements.runBtn) {
        elements.runBtn.classList.remove('loading');
        elements.runBtn.disabled = false;
    }
    updateExecutionTime();
}

function generateCode(prompt, attempt) {
    console.log('Generating code for prompt:', prompt, 'attempt:', attempt);
    
    // Simulate AI code generation based on prompt patterns
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('factorial')) {
        const attempts = sampleData.codeExamples.factorial.attempts;
        const index = Math.min(attempt - 1, attempts.length - 1);
        return attempts[index];
    } else if (promptLower.includes('prime')) {
        return sampleData.codeExamples.prime.attempts[0];
    } else if (promptLower.includes('todo')) {
        return sampleData.codeExamples.todo.attempts[0];
    } else if (promptLower.includes('quicksort') || promptLower.includes('sort')) {
        const attempts = sampleData.codeExamples.quicksort.attempts;
        const index = Math.min(attempt - 1, attempts.length - 1);
        return attempts[index];
    } else if (promptLower.includes('csv')) {
        return sampleData.codeExamples.csv.attempts[0];
    } else {
        // Generic code generation
        return {
            code: `# Generated code for: ${prompt}
def main():
    print("Hello, World!")
    print("This is a generic response to your prompt.")
    
    # TODO: Implement specific functionality for: ${prompt}
    
    return "Task completed successfully"

# Execute main function
result = main()
print(f"Result: {result}")`,
            output: `Hello, World!
This is a generic response to your prompt.
Result: Task completed successfully`,
            success: true
        };
    }
}

async function executeCode(codeResult) {
    console.log('Executing code:', codeResult);
    // Simulate code execution
    await delay(1000);
    
    if (codeResult.success) {
        return {
            success: true,
            output: codeResult.output
        };
    } else {
        return {
            success: false,
            error: codeResult.error
        };
    }
}

function displayCode(code) {
    console.log('Displaying code:', code);
    
    if (!elements.codeViewer) {
        console.error('Code viewer element not found');
        return;
    }
    
    const codeElement = document.createElement('pre');
    const codeInner = document.createElement('code');
    codeInner.className = 'language-python';
    codeInner.textContent = code;
    codeElement.appendChild(codeInner);
    
    elements.codeViewer.innerHTML = '';
    elements.codeViewer.appendChild(codeElement);
    
    // Apply syntax highlighting
    if (window.Prism && window.Prism.highlightElement) {
        try {
            Prism.highlightElement(codeInner);
        } catch (error) {
            console.log('Syntax highlighting failed:', error);
        }
    }
    
    currentState.generatedCode = code;
}

function addLogEntry(type, message) {
    console.log('Adding log entry:', type, message);
    
    if (!elements.executionLog) {
        console.error('Execution log element not found');
        return;
    }
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type} fade-in`;
    
    const timestamp = document.createElement('div');
    timestamp.className = 'log-timestamp';
    timestamp.textContent = new Date().toLocaleTimeString();
    
    const content = document.createElement('div');
    content.className = 'log-content';
    content.textContent = message;
    
    logEntry.appendChild(timestamp);
    logEntry.appendChild(content);
    
    elements.executionLog.appendChild(logEntry);
    elements.executionLog.scrollTop = elements.executionLog.scrollHeight;
    
    currentState.executionResults.push({
        type,
        message,
        timestamp: new Date().toISOString()
    });
}

function updateStatus(status, text) {
    console.log('Updating status:', status, text);
    
    if (elements.statusIndicator && elements.statusText) {
        const icon = elements.statusIndicator.querySelector('i');
        if (icon) {
            icon.className = `fas fa-circle status-${status}`;
        }
        elements.statusText.textContent = text;
    }
}

function updateUI() {
    if (elements.attemptCount) {
        elements.attemptCount.textContent = currentState.currentAttempt;
    }
    if (elements.maxAttempts) {
        elements.maxAttempts.textContent = currentState.maxAttempts;
    }
    updateExecutionTime();
}

function updateExecutionTime() {
    if (elements.executionTime) {
        if (currentState.startTime) {
            const elapsed = Math.round((Date.now() - currentState.startTime) / 1000);
            elements.executionTime.textContent = `${elapsed}s`;
        } else {
            elements.executionTime.textContent = '0s';
        }
    }
    
    if (currentState.isExecuting) {
        setTimeout(updateExecutionTime, 1000);
    }
}

function clearAll() {
    console.log('Clearing all');
    
    if (currentState.isExecuting) {
        if (!confirm('Execution is in progress. Are you sure you want to stop?')) {
            return;
        }
        currentState.isExecuting = false;
        if (elements.runBtn) {
            elements.runBtn.classList.remove('loading');
            elements.runBtn.disabled = false;
        }
        hideLoadingSpinner();
    }
    
    if (elements.promptInput) {
        elements.promptInput.value = '';
    }
    
    if (elements.codeViewer) {
        elements.codeViewer.innerHTML = '<div class="placeholder-content"><i class="fas fa-code"></i><p>Generated Python code will appear here</p><span>Enter a prompt and click "Run" to get started</span></div>';
    }
    
    if (elements.executionLog) {
        elements.executionLog.innerHTML = '<div class="placeholder-content"><i class="fas fa-terminal"></i><p>Execution output will appear here</p><span>Run your first prompt to see the results</span></div>';
    }
    
    currentState.currentAttempt = 0;
    currentState.startTime = null;
    currentState.executionResults = [];
    currentState.generatedCode = '';
    
    updateStatus('idle', 'Ready');
    updateUI();
}

function clearLog() {
    if (elements.executionLog) {
        elements.executionLog.innerHTML = '<div class="placeholder-content"><i class="fas fa-terminal"></i><p>Execution output will appear here</p><span>Run your first prompt to see the results</span></div>';
    }
    currentState.executionResults = [];
}

function copyCode() {
    if (!currentState.generatedCode) {
        showNotification('No code to copy', 'warning');
        return;
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentState.generatedCode).then(() => {
            showNotification('Code copied to clipboard', 'success');
        }).catch(() => {
            showNotification('Failed to copy code', 'error');
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentState.generatedCode;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('Code copied to clipboard', 'success');
        } catch (err) {
            showNotification('Failed to copy code', 'error');
        }
        document.body.removeChild(textArea);
    }
}

function downloadCode() {
    if (!currentState.generatedCode) {
        showNotification('No code to download', 'warning');
        return;
    }
    
    try {
        const blob = new Blob([currentState.generatedCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'generated_code.py';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Code downloaded', 'success');
    } catch (error) {
        console.error('Download failed:', error);
        showNotification('Download failed', 'error');
    }
}

function downloadLog() {
    if (currentState.executionResults.length === 0) {
        showNotification('No log to download', 'warning');
        return;
    }
    
    try {
        const logData = {
            prompt: currentState.currentPrompt,
            attempts: currentState.currentAttempt,
            maxAttempts: currentState.maxAttempts,
            generatedCode: currentState.generatedCode,
            executionResults: currentState.executionResults,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'execution_log.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Log downloaded', 'success');
    } catch (error) {
        console.error('Download failed:', error);
        showNotification('Download failed', 'error');
    }
}

function showModal(modalId) {
    console.log('Showing modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    } else {
        console.error('Modal not found:', modalId);
    }
}

function hideModal(modalId) {
    console.log('Hiding modal:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

function hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

function saveSettings() {
    const maxAttemptsSelect = document.getElementById('maxAttemptsSelect');
    const timeoutSelect = document.getElementById('timeoutSelect');
    const themeSelect = document.getElementById('themeSelect');
    
    if (!maxAttemptsSelect || !timeoutSelect || !themeSelect) {
        console.error('Settings elements not found');
        return;
    }
    
    const maxAttempts = parseInt(maxAttemptsSelect.value);
    const timeout = parseInt(timeoutSelect.value);
    const theme = themeSelect.value;
    
    currentState.maxAttempts = maxAttempts;
    currentState.executionTimeout = timeout;
    
    document.documentElement.setAttribute('data-color-scheme', theme);
    
    const settings = {
        maxAttempts,
        timeout,
        theme
    };
    
    try {
        localStorage.setItem('recursiveAISettings', JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save settings:', error);
    }
    
    updateUI();
    hideModal('settingsModal');
    showNotification('Settings saved', 'success');
}

function showLoadingSpinner(text) {
    console.log('Showing loading spinner:', text);
    if (elements.loadingText && elements.loadingSpinner) {
        elements.loadingText.textContent = text;
        elements.loadingSpinner.classList.remove('hidden');
    }
}

function hideLoadingSpinner() {
    console.log('Hiding loading spinner');
    if (elements.loadingSpinner) {
        elements.loadingSpinner.classList.add('hidden');
    }
}

function updateLoadingText(text) {
    if (elements.loadingText) {
        elements.loadingText.textContent = text;
    }
}

function showNotification(message, type = 'info') {
    console.log('Showing notification:', message, type);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Get the appropriate color based on type
    let borderColor = 'var(--color-info)';
    switch(type) {
        case 'success':
            borderColor = 'var(--color-success)';
            break;
        case 'error':
            borderColor = 'var(--color-error)';
            break;
        case 'warning':
            borderColor = 'var(--color-warning)';
            break;
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-surface);
        color: var(--color-text);
        padding: 12px 16px;
        border-radius: 8px;
        border-left: 4px solid ${borderColor};
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Utility functions
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Add CSS for notifications
const notificationStyles = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;

// Add styles to head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);