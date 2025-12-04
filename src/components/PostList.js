import { createPostCard } from './PostCard.js';
import { Modal } from './Modal.js';
import { debounce } from '../utils/helpers.js';

let activeTag = null;
let searchQuery = '';
let gridElement = null;

// Unified Filter Function
function applyFilters() {
  if (!gridElement) return;
  
  const cards = Array.from(gridElement.querySelectorAll('.post-card'));
  
  // [First] Capture current positions
  const positions = new Map();
  cards.forEach(card => {
    if (card.style.display !== 'none') {
      const rect = card.getBoundingClientRect();
      positions.set(card, { left: rect.left, top: rect.top });
    }
  });

  // Update Tag Styles
  document.querySelectorAll('.post-tag').forEach(btn => {
    if (activeTag && btn.dataset.tag === activeTag) {
      btn.classList.add('bg-cyan-500', 'text-black', 'border-cyan-400');
      btn.classList.remove('bg-white/5', 'text-cyan-300', 'border-white/5');
    } else {
      btn.classList.remove('bg-cyan-500', 'text-black', 'border-cyan-400');
      btn.classList.add('bg-white/5', 'text-cyan-300', 'border-white/5');
    }
  });

  // [Last] Filter Cards
  cards.forEach(card => {
    const cardTags = card.dataset.tags.split(',');
    const title = card.querySelector('h3').textContent.toLowerCase();
    const excerpt = card.querySelector('p').textContent.toLowerCase();
    
    const matchesTag = !activeTag || cardTags.includes(activeTag);
    const matchesSearch = !searchQuery || title.includes(searchQuery) || excerpt.includes(searchQuery);
    
    const isVisible = matchesTag && matchesSearch;

    if (isVisible) {
      card.style.display = 'block';
      if (card.style.opacity === '0') {
         requestAnimationFrame(() => {
           card.style.opacity = '1';
           card.style.transform = 'scale(1)';
         });
      }
    } else {
      card.style.display = 'none';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.9)';
    }
  });

  // [Invert & Play] Animate movement
  cards.forEach(card => {
    if (card.style.display === 'none') return;

    const first = positions.get(card);
    const last = card.getBoundingClientRect();

    if (first) {
      const deltaX = first.left - last.left;
      const deltaY = first.top - last.top;

      if (deltaX !== 0 || deltaY !== 0) {
        card.style.transition = 'none';
        card.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            card.style.transition = 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.3s ease';
            card.style.transform = '';
          });
        });
      }
    }
  });
}

// Debounce the filter application for search
const debouncedApplyFilters = debounce(() => {
  applyFilters();
}, 300);

export function setSearchQuery(query) {
  searchQuery = query.toLowerCase();
  debouncedApplyFilters();
}

export function renderPostList(posts, containerId) {
  gridElement = document.getElementById(containerId);
  if (!gridElement) return;
  
  gridElement.innerHTML = '';
  
  const modal = new Modal();

  posts.forEach((post, index) => {
    const card = createPostCard(post);
    
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('post-tag')) {
        e.stopPropagation();
        // Toggle Tag
        const clickedTag = e.target.dataset.tag;
        activeTag = activeTag === clickedTag ? null : clickedTag;
        applyFilters();
        return;
      }
      modal.open(post);
    });

    gridElement.appendChild(card);
    
    setTimeout(() => {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}
