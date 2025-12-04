import { supabase } from '../lib/supabase.js';

export function renderLogin(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-4">
      <div class="w-full max-w-md bg-[#1a1a1f] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-white mb-2">Admin Access</h2>
          <p class="text-gray-400 text-sm">Please login to continue</p>
        </div>

        <form id="login-form" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Email</label>
            <input 
              type="email" 
              id="email" 
              required
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
              placeholder="admin@example.com"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Password</label>
            <input 
              type="password" 
              id="password" 
              required
              class="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all"
              placeholder="••••••••"
            >
          </div>

          <div id="login-error" class="text-red-400 text-sm text-center hidden"></div>

          <button 
            type="submit" 
            class="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 rounded-lg transition-colors relative overflow-hidden group"
          >
            <span class="relative z-10">Sign In with Email</span>
          </button>
          
          <div class="relative flex py-2 items-center">
            <div class="flex-grow border-t border-white/10"></div>
            <span class="flex-shrink-0 mx-4 text-gray-500 text-xs">OR</span>
            <div class="flex-grow border-t border-white/10"></div>
          </div>

          <button 
            type="button"
            id="github-login"
            class="w-full bg-[#24292e] hover:bg-[#2f363d] text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
            Sign in with GitHub
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <a href="#" class="text-sm text-gray-500 hover:text-white transition-colors">← Back to Blog</a>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector('#login-form');
  const errorMsg = container.querySelector('#login-error');
  const githubBtn = container.querySelector('#github-login');

  githubBtn.addEventListener('click', async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    const btn = form.querySelector('button[type="submit"]');
    
    // Loading State
    btn.disabled = true;
    btn.innerHTML = '<span class="relative z-10">Signing in...</span>';
    errorMsg.classList.add('hidden');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Success - Redirect handled by auth state change listener in main.js
      window.location.hash = '#admin';

    } catch (err) {
      errorMsg.textContent = err.message;
      errorMsg.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = '<span class="relative z-10">Sign In with Email</span>';
    }
  });
}
