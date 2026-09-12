document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function copyToClipboard(text, msg) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(msg || 'Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  }

  // Copy Color Swatches on click
  document.querySelectorAll('.color-swatch-card').forEach(card => {
    card.addEventListener('click', () => {
      const color = card.getAttribute('data-color');
      copyToClipboard(color, `Color ${color} copied!`);
    });
  });

  // Copy Style Note Button (Top Nav)
  const copyStyleNoteBtn = document.getElementById('copyStyleNoteBtn');
  const styleNoteText = document.getElementById('styleNoteText');
  if (copyStyleNoteBtn && styleNoteText) {
    copyStyleNoteBtn.addEventListener('click', () => {
      copyToClipboard(styleNoteText.textContent, 'Claude Style Note copied!');
    });
  }

  // Copy Note Box Button
  const copyNoteBoxBtn = document.getElementById('copyNoteBoxBtn');
  if (copyNoteBoxBtn && styleNoteText) {
    copyNoteBoxBtn.addEventListener('click', () => {
      copyToClipboard(styleNoteText.textContent, 'Style Note copied!');
    });
  }

  // Copy CSS Variables
  const copyCssVariablesBtn = document.getElementById('copyCssVariablesBtn');
  if (copyCssVariablesBtn) {
    copyCssVariablesBtn.addEventListener('click', () => {
      const cssTokens = `:root {
  --color-bg: #F8FAFC;
  --color-text: #0F172A;
  --color-primary: #3B82F6;
  --color-secondary: #6366F1;
  --color-card: #FFFFFF;
  --font-heading: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-code: 'JetBrains Mono', monospace;
}`;
      copyToClipboard(cssTokens, 'CSS Design Tokens copied!');
    });
  }

  // Slider Controls
  const headingSizeSlider = document.getElementById('headingSizeSlider');
  const headingSizeVal = document.getElementById('headingSizeVal');
  const headingSample = document.getElementById('headingSample');

  if (headingSizeSlider && headingSample) {
    headingSizeSlider.addEventListener('input', (e) => {
      const size = `${e.target.value}px`;
      headingSample.style.fontSize = size;
      headingSizeVal.textContent = size;
    });
  }

  const bodySizeSlider = document.getElementById('bodySizeSlider');
  const bodySizeVal = document.getElementById('bodySizeVal');
  const bodySample = document.getElementById('bodySample');

  if (bodySizeSlider && bodySample) {
    bodySizeSlider.addEventListener('input', (e) => {
      const size = `${e.target.value}px`;
      bodySample.style.fontSize = size;
      bodySizeVal.textContent = size;
    });
  }
});
