'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit, CheckCircle, XCircle, Upload } from 'lucide-react';

export default function AdminDashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = '/admin/login';
    } else {
      setUser(user);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const { data: postsData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    
    const { data: tipsData } = await supabase
      .from('tips')
      .select('*')
      .order('created_at', { ascending: false });

    if (postsData) setPosts(postsData);
    if (tipsData) setTips(tipsData);
    setLoading(false);
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('posts')
      .update({ is_published: !currentStatus })
      .eq('id', id);
    fetchData();
  };

  const deletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this news story?')) {
      await supabase.from('posts').delete().eq('id', id);
      fetchData();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      alert('Error uploading image: ' + uploadError.message);
    } else {
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      alert('Image uploaded successfully! URL: ' + data.publicUrl);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  if (!user) return <div className="min-h-screen bg-black text-white p-10 font-inter font-black">Loading Auth...</div>;

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      {/* Header */}
      <header className="bg-black text-white p-6 flex justify-between items-center">
        <h1 className="text-3xl font-inter font-black uppercase tracking-tighter">
          TruthWorld<span className="text-[#FFFF00]">Admin</span>
        </h1>
        <div className="flex items-center gap-4">
          <label className="bg-[#FFFF00] text-black font-bold px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-white transition-colors">
            <Upload size={18} />
            Upload Image
            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
          </label>
          <button onClick={handleLogout} className="text-red-500 font-bold hover:text-white uppercase text-sm">
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8 flex flex-col gap-8">
        {/* Posts Section */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
          <h2 className="text-2xl font-black uppercase mb-6 border-b-2 border-black pb-2">News Pipeline</h2>
          
          {loading ? (
            <p className="font-bold">Loading stories...</p>
          ) : posts.length === 0 ? (
            <p className="font-bold text-gray-500">No news in the database. Awaiting Python script.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-[#FFFF00] font-black uppercase text-sm">
                    <th className="p-3">Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Views</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-bold max-w-xs truncate">{post.title}</td>
                      <td className="p-3 font-bold text-gray-600">{post.category}</td>
                      <td className="p-3">
                        {post.is_published ? (
                          <span className="bg-green-100 text-green-800 text-xs font-black uppercase px-2 py-1 rounded border border-green-800">Published</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-black uppercase px-2 py-1 rounded border border-yellow-800">Draft</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">{post.view_count || 0}</td>
                      <td className="p-3 flex justify-end gap-2">
                        <button 
                          onClick={() => togglePublish(post.id, post.is_published)}
                          className={`p-2 rounded ${post.is_published ? 'text-orange-500 hover:bg-orange-100' : 'text-green-600 hover:bg-green-100'}`}
                          title={post.is_published ? "Unpublish" : "Publish"}
                        >
                          {post.is_published ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-100 rounded" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => deletePost(post.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded" title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
          <h2 className="text-2xl font-black uppercase mb-6 border-b-2 border-black pb-2">Community Tips (Citizen Journalists)</h2>
          
          {loading ? (
            <p className="font-bold">Loading tips...</p>
          ) : tips.length === 0 ? (
            <p className="font-bold text-gray-500">No anonymous tips yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-red-600 text-white font-black uppercase text-sm">
                    <th className="p-3">Headline</th>
                    <th className="p-3">Story</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {tips.map((tip) => (
                    <tr key={tip.id} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-bold max-w-xs">{tip.title}</td>
                      <td className="p-3 font-serif text-sm max-w-md truncate">{tip.story}</td>
                      <td className="p-3 font-mono text-xs">{new Date(tip.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
