"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockDb, MockMemory, MockMemoryComment } from "@/lib/mockDb";
import { 
  Heart, 
  MessageSquare, 
  Plus, 
  X, 
  Camera, 
  Send,
  Loader2,
  Calendar,
  Image as ImageIcon
} from "lucide-react";
import * as AspectRatio from "@radix-ui/react-aspect-ratio";

export default function MemoryWall() {
  const { user } = useAuth();
  const [memories, setMemories] = useState<MockMemory[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [activeMemory, setActiveMemory] = useState<MockMemory | null>(null);

  // New Post Form State
  const [newTitle, setNewTitle] = useState("");
  const [newStory, setNewStory] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  // Comment Form State
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = () => {
    setMemories(mockDb.getMemories());
    setLoading(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newTitle || !newStory) {
      setPostError("Please provide a title and story.");
      return;
    }

    setIsSubmittingPost(true);
    setPostError(null);

    try {
      let finalImageUrl = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=600";

      // If they uploaded a custom image, convert it to base64 for mockup or load it
      if (newImagePreview) {
        finalImageUrl = newImagePreview;
      }

      mockDb.createMemory({
        title: newTitle,
        story: newStory,
        imageUrl: finalImageUrl,
        userId: user.uid,
        userName: user.name
      });

      // Reset
      setNewTitle("");
      setNewStory("");
      setNewImage(null);
      setNewImagePreview(null);
      setCreateOpen(false);
      
      // Reload Feed
      loadMemories();
    } catch (err: any) {
      console.error(err);
      setPostError("Failed to publish post.");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLike = (id: string) => {
    mockDb.likeMemory(id);
    loadMemories();
  };

  const openComments = (memory: MockMemory) => {
    setActiveMemory(memory);
    setCommentsOpen(true);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeMemory || !newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      mockDb.addCommentToMemory(activeMemory.id, {
        userId: user.uid,
        userName: user.name,
        text: newCommentText.trim()
      });

      setNewCommentText("");
      // Sync UI state
      const freshMemory = mockDb.getMemories().find(m => m.id === activeMemory.id);
      if (freshMemory) {
        setActiveMemory(freshMemory);
      }
      loadMemories();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-outfit text-white leading-tight">
            Memory Wall
          </h1>
          <p className="text-zinc-400 text-sm font-light mt-1">
            Browse snapshots and stories shared by fellow alumni, or post your own campus memories.
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-violet-700 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all shadow-lg hover:shadow-violet-500/10 w-fit shrink-0"
        >
          <Plus className="h-4 w-4" />
          Share a Memory
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex items-center justify-center gap-2 text-zinc-400 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Loading Memory Feed...
        </div>
      ) : memories.length > 0 ? (
        /* Memory Grid Feed */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memories.map((memory) => (
            <div key={memory.id} className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between hover:border-zinc-800 transition-all border border-zinc-900/60 shadow-lg">
              <div>
                {/* Image using AspectRatio Radix wrapper */}
                <div className="w-full bg-zinc-900 overflow-hidden relative">
                  <AspectRatio.Root ratio={16 / 10}>
                    <img
                      src={memory.imageUrl}
                      alt={memory.title}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio.Root>
                </div>

                {/* Details */}
                <div className="p-5 text-left">
                  <span className="text-[9px] text-zinc-500 font-medium block">
                    Posted by {memory.userName} • {new Date(memory.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                  <h3 className="font-bold text-white text-base font-outfit mt-2 leading-snug truncate">
                    {memory.title}
                  </h3>
                  <p className="text-zinc-400 text-xs font-light mt-2 line-clamp-3 leading-relaxed">
                    {memory.story}
                  </p>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="flex items-center gap-4 px-5 py-3.5 border-t border-zinc-900/60 bg-zinc-900/10">
                <button
                  onClick={() => handleLike(memory.id)}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-rose-400 transition-colors"
                >
                  <Heart className="h-4.5 w-4.5 text-zinc-500 fill-zinc-500 hover:fill-rose-400 hover:text-rose-400 transition-all active:scale-125" />
                  <span>{memory.likes} Likes</span>
                </button>
                <button
                  onClick={() => openComments(memory)}
                  className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-400 transition-colors"
                >
                  <MessageSquare className="h-4.5 w-4.5 text-zinc-500" />
                  <span>{memory.comments.length} Comments</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card rounded-2xl p-12 text-center flex flex-col items-center justify-center text-zinc-500">
          <ImageIcon className="h-10 w-10 text-zinc-700 mb-2" />
          <p className="font-outfit font-semibold text-zinc-400">Memory Wall is Empty</p>
          <p className="text-xs font-light mt-1">Be the first to post a photo and share nostalgia!</p>
        </div>
      )}

      {/* CREATE POST MODAL DIALOG */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div onClick={() => setCreateOpen(false)} className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" />
          <div className="glass-card rounded-2xl p-6 md:p-8 max-w-md w-full z-10 border border-zinc-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xl font-bold font-outfit text-white mb-4">Share a Campus Memory</h2>
            
            {postError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg text-xs mb-4">
                {postError}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Memory Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Reunion Mixer 2024, DSP Exam Panic"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Describe the Story
                </label>
                <textarea
                  value={newStory}
                  onChange={(e) => setNewStory(e.target.value)}
                  placeholder="Write a brief story or anecdote details..."
                  rows={4}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm text-white font-light resize-none"
                  required
                />
              </div>

              {/* File Upload aspect */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Photo Attachment
                </label>
                <div className="relative border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex flex-col items-center justify-center bg-zinc-950/20 cursor-pointer">
                  {newImagePreview ? (
                    <div className="w-full relative">
                      <img
                        src={newImagePreview}
                        alt="Preview"
                        className="h-32 w-full object-cover rounded-lg border border-zinc-800"
                      />
                      <button
                        type="button"
                        onClick={() => { setNewImage(null); setNewImagePreview(null); }}
                        className="absolute top-2 right-2 bg-zinc-950/80 p-1 rounded-full text-zinc-300 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="h-8 w-8 text-zinc-600 mb-2" />
                      <span className="text-xs text-zinc-400 font-light">Drag & drop or Click to choose file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPost}
                className="w-full bg-primary hover:bg-violet-700 text-white font-semibold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {isSubmittingPost ? (
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
                ) : (
                  <span>Publish Memory</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* COMMENTS DIALOG OVERLAY */}
      {commentsOpen && activeMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div onClick={() => setCommentsOpen(false)} className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" />
          <div className="glass-card rounded-2xl p-6 max-w-lg w-full z-10 border border-zinc-800 shadow-2xl relative flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Header close button */}
            <button
              onClick={() => setCommentsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Post details */}
            <div className="pb-4 mb-4 border-b border-zinc-900 text-left">
              <span className="text-[10px] text-zinc-500 font-light block">
                Memory comments thread
              </span>
              <h3 className="font-bold text-white text-lg font-outfit mt-1.5">
                {activeMemory.title}
              </h3>
            </div>

            {/* Scrollable comments list */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-left min-h-[150px] max-h-[350px] no-scrollbar">
              {activeMemory.comments && activeMemory.comments.length > 0 ? (
                activeMemory.comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-zinc-900/40 border border-zinc-900/60 rounded-xl">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-zinc-300">
                        {comment.userName}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-light">
                        {new Date(comment.createdAt).toLocaleDateString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p className="text-zinc-400 text-xs mt-1.5 font-light leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-zinc-600 text-xs italic font-light">
                  No comments yet. Start the conversation below!
                </div>
              )}
            </div>

            {/* Comment Form Input */}
            <form onSubmit={handleAddComment} className="pt-4 border-t border-zinc-900 mt-4 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                disabled={isSubmittingComment}
                className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-white font-light"
                required
              />
              <button
                type="submit"
                disabled={isSubmittingComment || !newCommentText.trim()}
                className="bg-primary hover:bg-violet-700 text-white p-2.5 rounded-xl shrink-0 transition-colors flex items-center justify-center disabled:bg-zinc-800"
              >
                {isSubmittingComment ? (
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                ) : (
                  <Send className="h-4.5 w-4.5" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
