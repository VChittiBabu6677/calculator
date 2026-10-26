const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const buttons = document.querySelectorAll('.button');

let expression = '';
let result = '0';
let justEvaluated = false;

function updateDisplay() {
  expressionDisplay.textContent = expression || '0';
  resultDisplay.textContent = result;
}

function isOperator(value) {
  return ['+', '-', '*', '/', '%'].includes(value);
}

function isDigitOrPeriod(value) {
  return /[0-9.]/.test(value);
}

function sanitizeExpression(rawExpression) {
  return rawExpression
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, '');
}

function appendCharacter(value) {
  if (!value) {
    return;
  }

  if (justEvaluated) {
    if (isOperator(value)) {
      expression = result;
      justEvaluated = false;
      expression += value;
      result = '0';
      updateDisplay();
      return;
    }

    if (/[0-9.]/.test(value)) {
      expression = '';
      justEvaluated = false;
    }
  }

  if (value === '(') {
    const previous = expression.slice(-1);
    if (previous && /[0-9)]/.test(previous)) {
      expression += '*';
    }
    expression += value;
    result = '0';
    updateDisplay();
    return;
  }

  if (value === ')') {
    const openParentheses = (expression.match(/\(/g) || []).length;
    const closeParentheses = (expression.match(/\)/g) || []).length;
    if (openParentheses <= closeParentheses || !expression) {
      return;
    }
    expression += value;
    result = '0';
    updateDisplay();
    return;
  }

  if (isOperator(value)) {
    const previous = expression.slice(-1);
    if (!expression) {
      if (value === '-') {
        expression = '-';
      }
      result = '0';
      updateDisplay();
      return;
    }

    if (isOperator(previous)) {
      if (value === '-' && previous !== '-') {
        expression += value;
      } else {
        expression = expression.slice(0, -1) + value;
      }
      result = '0';
      updateDisplay();
      return;
    }

    expression += value;
    result = '0';
    updateDisplay();
    return;
  }

  if (value === '.') {
    const lastNumberMatch = expression.match(/(\d*\.\d*|\d+)$/);
    if (lastNumberMatch && lastNumberMatch[0].includes('.')) {
      return;
    }
    expression += value;
    result = '0';
    updateDisplay();
    return;
  }

  if (/\d/.test(value)) {
    expression += value;
    result = '0';
    updateDisplay();
  }
}

function deleteLastCharacter() {
  expression = expression.slice(0, -1);
  if (!expression) {
    result = '0';
  }
  updateDisplay();
}

function clearExpression() {
  expression = '';
  result = '0';
  justEvaluated = false;
  updateDisplay();
}

function evaluateExpression() {
  const normalizedExpression = sanitizeExpression(expression);
  if (!normalizedExpression) {
    result = '0';
    updateDisplay();
    return;
  }

  const validPattern = /^[-+*/().%0-9]+$/;
  if (!validPattern.test(normalizedExpression)) {
    result = 'Error';
    updateDisplay();
    return;
  }

  try {
    const safeResult = Function(`"use strict"; return (${normalizedExpression});`)();
    if (!Number.isFinite(safeResult)) {
      throw new Error('Invalid calculation');
    }

    result = Number.isInteger(safeResult)
      ? String(safeResult)
      : String(Number(safeResult.toFixed(12)));
    justEvaluated = true;
    updateDisplay();
  } catch (error) {
    result = 'Error';
    updateDisplay();
  }
}

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    if (action === 'clear') {
      clearExpression();
      return;
    }

    if (action === 'delete') {
      deleteLastCharacter();
      return;
    }

    if (action === 'equals') {
      evaluateExpression();
      return;
    }

    appendCharacter(value);
  });
});

document.addEventListener('keydown', (event) => {
  const { key } = event;

  if (/[0-9]/.test(key)) {
    appendCharacter(key);
    return;
  }

  const allowedCharacters = ['.', '+', '-', '*', '/', '%', '(', ')'];
  if (allowedCharacters.includes(key)) {
    appendCharacter(key);
    return;
  }

  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    evaluateExpression();
    return;
  }

  if (key === 'Backspace') {
    event.preventDefault();
    deleteLastCharacter();
    return;
  }

  if (key === 'Escape') {
    clearExpression();
  }
});

updateDisplay();
