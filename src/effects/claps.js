export function triggerClapBurst(x, y) {
  const particleCount = 20;
  const colors = ['#22d3ee', '#e879f9', '#ffffff']; // Cyan, Purple, White
  
  for (let i = 0; i < particleCount; i++) {
    createParticle(x, y, colors[Math.floor(Math.random() * colors.length)]);
  }
}

function createParticle(x, y, color) {
  const particle = document.createElement('div');
  document.body.appendChild(particle);

  // Initial styles
  const size = Math.random() * 6 + 4;
  particle.style.width = `${size}px`;
  particle.style.height = `${size}px`;
  particle.style.background = color;
  particle.style.position = 'fixed';
  particle.style.left = `${x}px`;
  particle.style.top = `${y}px`;
  particle.style.borderRadius = '50%';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '9999';
  
  // Random movement
  const angle = Math.random() * Math.PI * 2;
  const velocity = Math.random() * 100 + 50; // Distance
  const tx = Math.cos(angle) * velocity;
  const ty = Math.sin(angle) * velocity - 100; // Move slightly upwards

  // Animation
  const animation = particle.animate([
    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
    { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
  ], {
    duration: 800,
    easing: 'cubic-bezier(0, .9, .57, 1)',
  });

  animation.onfinish = () => particle.remove();
}
