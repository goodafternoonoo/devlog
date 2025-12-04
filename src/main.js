import './style.css'
// import { posts } from './data/posts.js'; // Deprecated
import { supabase } from './lib/supabase.js';
import { initCursor } from './effects/cursor.js';
import { initCanvas } from './effects/canvas.js';
import { initTypewriter } from './effects/typewriter.js';
import { renderPostList, setSearchQuery } from './components/PostList.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Effects
  initCursor();
  initCanvas();
  initTypewriter();
  
  // Search Functionality
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      setSearchQuery(e.target.value);
    });
  }

  // Fetch Posts from Supabase
  const grid = document.getElementById('posts-grid');
  
  // Show Loading State
  grid.innerHTML = '<div class="col-span-full text-center text-gray-500 font-mono animate-pulse">Loading data from Supabase...</div>';

  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (posts && posts.length > 0) {
      // Format date for display (YYYY. MM. DD)
      const formattedPosts = posts.map(post => ({
        ...post,
        date: new Date(post.created_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      }));
      
      renderPostList(formattedPosts, 'posts-grid');
    } else {
      grid.innerHTML = '<div class="col-span-full text-center text-gray-500 font-mono">No posts found.</div>';
    }

  } catch (err) {
    console.error('Error fetching posts:', err);
    grid.innerHTML = `<div class="col-span-full text-center text-red-400 font-mono">Failed to load posts.<br/><span class="text-xs text-gray-600">${err.message}</span></div>`;
  }
});
