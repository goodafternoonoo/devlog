import { triggerClapBurst } from '../effects/claps.js';
import { supabase } from '../lib/supabase.js';

export class Modal {
  constructor() {
    this.createModalElement();
    this.bindEvents();
    this.subscription = null;
  }

  createModalElement() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300';
    
    this.container = document.createElement('div');
    this.container.className = 'relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a1a1f] border border-white/10 rounded-2xl shadow-2xl transform scale-95 transition-transform duration-300 p-8 md:p-12';
    
    // Close Button
    this.closeBtn = document.createElement('button');
    this.closeBtn.className = 'absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-10';
    this.closeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;

    // Content Area
    this.contentArea = document.createElement('div');
    this.contentArea.className = 'prose prose-invert prose-cyan max-w-none mb-12';

    // Clap Section
    this.clapSection = document.createElement('div');
    this.clapSection.className = 'flex justify-center items-center pt-8 border-t border-white/10';

    this.container.appendChild(this.closeBtn);
    this.container.appendChild(this.contentArea);
    this.container.appendChild(this.clapSection);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
  }

  bindEvents() {
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  async open(post) {
    this.isOpen = true;
    this.currentPostId = post.id;
    
    // Populate Content
    this.contentArea.innerHTML = `
      <div class="mb-8 border-b border-white/10 pb-8">
        <div class="flex gap-2 mb-4">
          ${post.tags.map(tag => `<span class="text-xs font-mono px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">${tag}</span>`).join('')}
        </div>
        <h2 class="text-3xl md:text-4xl font-bold mb-2 text-white">${post.title}</h2>
        <p class="text-gray-400 font-mono text-sm">${post.date}</p>
      </div>
      <div class="text-gray-300 leading-relaxed space-y-4">
        ${post.content}
      </div>
    `;

    // Initial Clap Count (Use passed data first, then fetch latest)
    this.renderClapButton(post.claps || 0);
    this.fetchLatestClaps();

    // Subscribe to Realtime Changes
    this.subscribeToClaps();

    // Show Modal
    this.overlay.classList.remove('opacity-0', 'pointer-events-none');
    this.container.classList.remove('scale-95');
    this.container.classList.add('scale-100');
    
    // Disable body scroll
    document.body.style.overflow = 'hidden';
  }

  renderClapButton(count) {
    this.clapSection.innerHTML = `
      <button id="clap-btn" class="group relative flex flex-col items-center gap-2 transition-transform active:scale-90">
        <div class="relative w-16 h-16 flex items-center justify-center rounded-full bg-white/5 border border-white/10 group-hover:border-cyan-400/50 group-hover:bg-cyan-400/10 transition-all duration-300">
          <span class="text-2xl">👏</span>
          <div class="absolute inset-0 rounded-full border border-cyan-400 opacity-0 scale-110 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500"></div>
        </div>
        <span id="clap-count" class="font-mono text-sm text-gray-400 group-hover:text-cyan-300 transition-colors">${count} Claps</span>
      </button>
    `;

    const btn = this.clapSection.querySelector('#clap-btn');
    btn.addEventListener('click', (e) => this.handleClap(e));
  }

  async fetchLatestClaps() {
    const { data, error } = await supabase
      .from('posts')
      .select('claps')
      .eq('id', this.currentPostId)
      .single();
    
    if (data) {
      this.updateClapCountUI(data.claps);
    }
  }

  subscribeToClaps() {
    if (this.subscription) supabase.removeChannel(this.subscription);

    this.subscription = supabase
      .channel(`public:posts:id=eq.${this.currentPostId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'posts', 
        filter: `id=eq.${this.currentPostId}` 
      }, (payload) => {
        this.updateClapCountUI(payload.new.claps);
      })
      .subscribe();
  }

  updateClapCountUI(count) {
    const countEl = this.clapSection.querySelector('#clap-count');
    if (countEl) {
      countEl.textContent = `${count} Claps`;
      countEl.classList.add('text-cyan-300');
    }
  }

  async handleClap(e) {
    // Optimistic UI Update (Visual feedback immediately)
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    triggerClapBurst(centerX, centerY);

    // Fetch current count to increment safely
    // Note: In a high-concurrency app, we should use an RPC function (increment_claps).
    // For now, simple read-modify-write is okay for a toy project.
    const { data } = await supabase
      .from('posts')
      .select('claps')
      .eq('id', this.currentPostId)
      .single();

    if (data) {
      const newCount = data.claps + 1;
      await supabase
        .from('posts')
        .update({ claps: newCount })
        .eq('id', this.currentPostId);
        
      // UI will be updated via Realtime subscription automatically
    }
  }

  close() {
    this.isOpen = false;
    
    // Unsubscribe
    if (this.subscription) {
      supabase.removeChannel(this.subscription);
      this.subscription = null;
    }

    // Hide Modal
    this.overlay.classList.add('opacity-0', 'pointer-events-none');
    this.container.classList.remove('scale-100');
    this.container.classList.add('scale-95');
    
    // Enable body scroll
    document.body.style.overflow = '';
  }
}
