export function initTypewriter() {
  const text = "Building digital experiences.";
  const el = document.getElementById('typewriter');
  if (!el) return;

  let i = 0;
  
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, 100);
    }
  }
  
  setTimeout(type, 1000);
}
