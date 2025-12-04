import { handleTilt, resetTilt } from '../effects/tilt.js';

export function createPostCard(post) {
  const card = document.createElement('div');
  card.className = 'group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:border-cyan-500/30 hover:shadow-2xl hover:shadow-cyan-500/10 preserve-3d cursor-pointer post-card';
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.dataset.tags = post.tags.join(',');
  
  card.innerHTML = `
    <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div class="relative z-10 transform transition-transform duration-300 group-hover:translate-z-10">
      <div class="flex justify-between items-start mb-4">
        <div class="flex gap-2 flex-wrap">
          ${post.tags.map(tag => `
            <button 
              class="post-tag text-xs font-mono px-2 py-1 rounded bg-white/5 text-cyan-300 border border-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/30 transition-colors z-20 relative"
              data-tag="${tag}"
            >
              ${tag}
            </button>
          `).join('')}
        </div>
        <span class="text-xs text-gray-500 font-mono whitespace-nowrap ml-2">${post.date}</span>
      </div>
      <h3 class="text-xl font-bold mb-3 group-hover:text-cyan-200 transition-colors">${post.title}</h3>
      <p class="text-gray-400 text-sm leading-relaxed mb-6">${post.excerpt}</p>
      <div class="flex items-center text-cyan-400 text-sm font-medium opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        글 읽기 <span class="ml-2">→</span>
      </div>
    </div>
  `;

  // Add Tilt Event
  card.addEventListener('mousemove', handleTilt);
  card.addEventListener('mouseleave', resetTilt);

  return card;
}
