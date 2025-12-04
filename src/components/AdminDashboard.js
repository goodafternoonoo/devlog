import { supabase } from '../lib/supabase.js';

export class AdminDashboard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentView = 'list'; // 'list' | 'editor'
    this.editingPost = null;
  }

  async render() {
    this.container.innerHTML = `
      <div class="min-h-screen flex flex-col">
        <!-- Admin Header -->
        <header class="bg-[#1a1a1f] border-b border-white/10 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold font-mono text-cyan-400">Admin.Log</h1>
            <span class="text-xs text-gray-500 px-2 py-1 border border-white/10 rounded">v1.0</span>
          </div>
          <div class="flex items-center gap-4">
            <span id="admin-email" class="text-sm text-gray-400 hidden md:block"></span>
            <button id="logout-btn" class="text-sm text-red-400 hover:text-red-300 transition-colors">Logout</button>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 p-8 max-w-7xl mx-auto w-full">
          <div id="dashboard-content">
            <!-- Dynamic Content -->
          </div>
        </main>
      </div>
    `;

    // Set User Email
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.container.querySelector('#admin-email').textContent = session.user.email;
    }

    // Bind Logout
    this.container.querySelector('#logout-btn').addEventListener('click', async () => {
      await supabase.auth.signOut();
    });

    this.renderList();
  }

  async renderList() {
    const content = this.container.querySelector('#dashboard-content');
    content.innerHTML = `
      <div class="flex justify-between items-center mb-8">
        <h2 class="text-2xl font-bold">All Posts</h2>
        <button id="new-post-btn" class="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
          <span>+ New Post</span>
        </button>
      </div>
      
      <div id="posts-table" class="space-y-4">
        <div class="text-center text-gray-500 py-12">Loading posts...</div>
      </div>
    `;

    content.querySelector('#new-post-btn').addEventListener('click', () => {
      this.renderEditor();
    });

    // Fetch Posts
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      content.querySelector('#posts-table').innerHTML = `<div class="text-red-400">Error: ${error.message}</div>`;
      return;
    }

    const table = content.querySelector('#posts-table');
    if (posts.length === 0) {
      table.innerHTML = `<div class="text-center text-gray-500 py-12 border border-white/10 rounded-xl bg-white/5">No posts yet. Write your first one!</div>`;
      return;
    }

    table.innerHTML = posts.map(post => `
      <div class="bg-[#1a1a1f] border border-white/10 rounded-xl p-6 flex justify-between items-center hover:border-cyan-500/30 transition-colors group">
        <div>
          <h3 class="text-lg font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">${post.title}</h3>
          <div class="flex gap-3 text-xs text-gray-500 font-mono">
            <span>${new Date(post.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>${post.claps || 0} Claps</span>
            <span>•</span>
            <div class="flex gap-1">
              ${post.tags.map(tag => `<span class="text-gray-400">#${tag}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="flex gap-3">
          <button class="edit-btn text-gray-400 hover:text-white transition-colors p-2" data-id="${post.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="delete-btn text-gray-400 hover:text-red-400 transition-colors p-2" data-id="${post.id}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    // Bind Actions
    table.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const post = posts.find(p => p.id == btn.dataset.id);
        this.renderEditor(post);
      });
    });

    table.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this post?')) {
          await supabase.from('posts').delete().eq('id', btn.dataset.id);
          this.renderList(); // Refresh
        }
      });
    });
  }

  renderEditor(post = null) {
    const isEdit = !!post;
    const content = this.container.querySelector('#dashboard-content');
    
    content.innerHTML = `
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-8">
          <button id="back-btn" class="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 class="text-2xl font-bold">${isEdit ? 'Edit Post' : 'New Post'}</h2>
        </div>

        <form id="post-form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-6">
              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required
                  value="${isEdit ? post.title : ''}"
                  class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-lg font-bold"
                  placeholder="Enter post title..."
                >
              </div>

              <!-- Content -->
              <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">Content (Markdown)</label>
                <textarea 
                  name="content" 
                  required
                  rows="15"
                  class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all font-mono text-sm leading-relaxed"
                  placeholder="# Hello World..."
                >${isEdit ? post.content : ''}</textarea>
              </div>
            </div>

            <div class="space-y-6">
              <!-- Meta Info -->
              <div class="bg-[#1a1a1f] border border-white/10 rounded-xl p-6 space-y-4">
                <h3 class="font-bold text-gray-300">Settings</h3>
                
                <!-- Tags -->
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-2">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    name="tags" 
                    value="${isEdit ? post.tags.join(', ') : ''}"
                    class="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400/50"
                    placeholder="react, javascript, design"
                  >
                </div>

                <!-- Image URL -->
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-2">Cover Image URL</label>
                  <input 
                    type="url" 
                    name="image" 
                    value="${isEdit ? post.image || '' : ''}"
                    class="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400/50"
                    placeholder="https://..."
                  >
                </div>
              </div>

              <!-- Actions -->
              <div class="flex flex-col gap-3">
                <button 
                  type="submit" 
                  class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-lg transition-colors"
                >
                  ${isEdit ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    `;

    content.querySelector('#back-btn').addEventListener('click', () => {
      this.renderList();
    });

    content.querySelector('#post-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const btn = form.querySelector('button[type="submit"]');
      
      const formData = {
        title: form.title.value,
        content: form.content.value,
        tags: form.tags.value.split(',').map(t => t.trim()).filter(t => t),
        image: form.image.value,
        updated_at: new Date().toISOString()
      };

      btn.disabled = true;
      btn.textContent = 'Saving...';

      try {
        if (isEdit) {
          const { error } = await supabase
            .from('posts')
            .update(formData)
            .eq('id', post.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('posts')
            .insert([{ ...formData, created_at: new Date().toISOString(), claps: 0 }]);
          if (error) throw error;
        }

        this.renderList();
      } catch (err) {
        alert('Error saving post: ' + err.message);
        btn.disabled = false;
        btn.textContent = isEdit ? 'Update Post' : 'Publish Post';
      }
    });
  }
}
