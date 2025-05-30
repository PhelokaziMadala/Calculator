
class Calculator {
    constructor() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForNewInput = false;
        this.history = [];
        
        this.mainDisplay = document.getElementById('mainDisplay');
        this.historyDisplay = document.getElementById('historyDisplay');
        this.historyList = document.getElementById('historyList');
        
        this.initializeEventListeners();
        this.initializeKeyboardSupport();
        this.initializeTheme();
        this.loadHistory();
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        // Button clicks
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleButtonClick(e.target);
            });
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Clear history
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });
    }
    
    initializeKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            e.preventDefault();
            this.handleKeyboardInput(e.key);
        });
    }
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('calculatorTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    handleButtonClick(button) {
        const value = button.dataset.value;
        const action = button.dataset.action;
        
        // Add visual feedback
        button.classList.add('pressed');
        setTimeout(() => button.classList.remove('pressed'), 100);
        
        if (action) {
            this.handleAction(action);
        } else if (value) {
            this.handleInput(value);
        }
    }
    
    handleKeyboardInput(key) {
        const keyMap = {
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
            '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
            '+': '+', '-': '-', '*': '*', '/': '/',
            '.': '.', ',': '.',
            'Enter': 'equals', '=': 'equals',
            'Escape': 'clear', 'c': 'clear', 'C': 'clear',
            'Backspace': 'delete', 'Delete': 'delete'
        };
        
        const mappedKey = keyMap[key];
        if (mappedKey) {
            if (mappedKey === 'equals' || mappedKey === 'clear' || mappedKey === 'delete') {
                this.handleAction(mappedKey);
            } else {
                this.handleInput(mappedKey);
            }
            
            // Visual feedback for keyboard input
            this.highlightButton(mappedKey);
        }
    }
    
    highlightButton(value) {
        const button = document.querySelector(`[data-value="${value}"], [data-action="${value}"]`);
        if (button) {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 100);
        }
    }
    
    handleInput(value) {
        if (['+', '-', '*', '/', '**', '√'].includes(value)) {
            this.handleOperator(value);
        } else if (value === '.') {
            this.handleDecimal();
        } else {
            this.handleNumber(value);
        }
    }
    
    handleAction(action) {
        switch (action) {
            case 'clear':
                this.clear();
                break;
            case 'delete':
                this.delete();
                break;
            case 'equals':
                this.calculate();
                break;
        }
    }
    
    handleNumber(num) {
        if (this.waitingForNewInput) {
            this.currentInput = num;
            this.waitingForNewInput = false;
        } else {
            this.currentInput = this.currentInput === '0' ? num : this.currentInput + num;
        }
        this.updateDisplay();
    }
    
    handleDecimal() {
        if (this.waitingForNewInput) {
            this.currentInput = '0.';
            this.waitingForNewInput = false;
        } else if (!this.currentInput.includes('.')) {
            this.currentInput += '.';
        }
        this.updateDisplay();
    }
    
    handleOperator(op) {
        if (this.operator && !this.waitingForNewInput) {
            this.calculate();
        }
        
        if (op === '√') {
            this.calculateSquareRoot();
            return;
        }
        
        this.previousInput = this.currentInput;
        this.operator = op;
        this.waitingForNewInput = true;
        this.updateHistoryDisplay();
    }
    
    calculate() {
        if (!this.operator || this.waitingForNewInput) return;
        
        const prev = parseFloat(this.previousInput);
        const current = parseFloat(this.currentInput);
        let result;
        
        try {
            switch (this.operator) {
                case '+':
                    result = prev + current;
                    break;
                case '-':
                    result = prev - current;
                    break;
                case '*':
                    result = prev * current;
                    break;
                case '/':
                    if (current === 0) {
                        throw new Error('Division by zero');
                    }
                    result = prev / current;
                    break;
                case '**':
                    result = Math.pow(prev, current);
                    break;
                default:
                    return;
            }
            
            if (!isFinite(result)) {
                throw new Error('Invalid calculation');
            }
            
            // Format result
            result = this.formatResult(result);
            
            // Add to history
            const expression = `${this.previousInput} ${this.getOperatorSymbol(this.operator)} ${this.currentInput} = ${result}`;
            this.addToHistory(expression);
            
            this.currentInput = result.toString();
            this.operator = null;
            this.previousInput = '';
            this.waitingForNewInput = true;
            
        } catch (error) {
            this.showError(error.message);
            return;
        }
        
        this.updateDisplay();
        this.updateHistoryDisplay();
    }
    
    calculateSquareRoot() {
        const current = parseFloat(this.currentInput);
        
        if (current < 0) {
            this.showError('Invalid input');
            return;
        }
        
        const result = Math.sqrt(current);
        const formattedResult = this.formatResult(result);
        
        const expression = `√${this.currentInput} = ${formattedResult}`;
        this.addToHistory(expression);
        
        this.currentInput = formattedResult.toString();
        this.waitingForNewInput = true;
        this.updateDisplay();
    }
    
    formatResult(result) {
        // Handle very large or very small numbers
        if (Math.abs(result) > 1e15 || (Math.abs(result) < 1e-10 && result !== 0)) {
            return parseFloat(result.toExponential(10));
        }
        
        // Round to prevent floating point errors
        const rounded = Math.round(result * 1e10) / 1e10;
        
        // Remove trailing zeros
        return parseFloat(rounded.toString());
    }
    
    getOperatorSymbol(op) {
        const symbols = {
            '+': '+',
            '-': '−',
            '*': '×',
            '/': '÷',
            '**': '^'
        };
        return symbols[op] || op;
    }
    
    clear() {
        this.currentInput = '0';
        this.previousInput = '';
        this.operator = null;
        this.waitingForNewInput = false;
        this.updateDisplay();
        this.updateHistoryDisplay();
    }
    
    delete() {
        if (this.waitingForNewInput) return;
        
        if (this.currentInput.length > 1) {
            this.currentInput = this.currentInput.slice(0, -1);
        } else {
            this.currentInput = '0';
        }
        this.updateDisplay();
    }
    
    showError(message) {
        this.mainDisplay.textContent = `Error: ${message}`;
        this.mainDisplay.classList.add('error');
        setTimeout(() => {
            this.clear();
            this.mainDisplay.classList.remove('error');
        }, 2000);
    }
    
    updateDisplay() {
        this.mainDisplay.textContent = this.currentInput;
    }
    
    updateHistoryDisplay() {
        if (this.operator && this.previousInput) {
            this.historyDisplay.textContent = `${this.previousInput} ${this.getOperatorSymbol(this.operator)}`;
        } else {
            this.historyDisplay.textContent = '';
        }
    }
    
    addToHistory(expression) {
        this.history.unshift(expression);
        if (this.history.length > 50) {
            this.history = this.history.slice(0, 50);
        }
        this.saveHistory();
        this.renderHistory();
    }
    
    renderHistory() {
        this.historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            this.historyList.innerHTML = '<div style="opacity: 0.5; text-align: center;">No calculations yet</div>';
            return;
        }
        
        this.history.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.textContent = item;
            historyItem.addEventListener('click', () => {
                const result = item.split(' = ')[1];
                if (result) {
                    this.currentInput = result;
                    this.waitingForNewInput = false;
                    this.updateDisplay();
                }
            });
            this.historyList.appendChild(historyItem);
        });
    }
    
    clearHistory() {
        this.history = [];
        this.saveHistory();
        this.renderHistory();
    }
    
    saveHistory() {
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
    }
    
    loadHistory() {
        const saved = localStorage.getItem('calculatorHistory');
        if (saved) {
            this.history = JSON.parse(saved);
            this.renderHistory();
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('calculatorTheme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const themeButton = document.getElementById('themeToggle');
        themeButton.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});

// Prevent context menu on buttons for better mobile experience
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('btn')) {
        e.preventDefault();
    }
});

// Handle touch events for better mobile responsiveness
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const touchDiff = touchStartY - touchY;
    
    // Prevent page scroll when interacting with calculator
    if (e.target.closest('.calculator')) {
        if (Math.abs(touchDiff) < 10) {
            e.preventDefault();
        }
    }
});
