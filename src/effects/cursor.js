export function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot = document.getElementById('cursor-dot');
  
  if (!cursor || !dot) return;

  // Initialize to center of screen to avoid jump
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let dotX = mouseX;
  let dotY = mouseY;
  let isHovering = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    // Smooth follow for outer circle
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    // Faster follow for inner dot
    dotX += (mouseX - dotX) * 0.5;
    dotY += (mouseY - dotY) * 0.5;

    const scale = isHovering ? 1.5 : 1;

    // Manually subtract half width/height to center (cursor: 32px, dot: 4px)
    cursor.style.transform = `translate(${cursorX - 16}px, ${cursorY - 16}px) scale(${scale})`;
    dot.style.transform = `translate(${dotX - 2}px, ${dotY - 2}px)`;

    requestAnimationFrame(animate);
  }
  
  animate();

  // Hover effects using Event Delegation
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .cursor-pointer')) {
      isHovering = true;
      cursor.classList.add('border-cyan-200', 'bg-cyan-400/10');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .cursor-pointer')) {
      isHovering = false;
      cursor.classList.remove('border-cyan-200', 'bg-cyan-400/10');
    }
  });
}
