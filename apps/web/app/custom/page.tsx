'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Sparkles } from 'lucide-react';

export default function CustomOrderPage() {
  const { isAuthenticated, accessToken } = useAuthStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    referenceImages: '',
    colorPreferences: '',
    specialInstructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setStatus({ type: 'error', message: 'You must be logged in to submit a custom order inquiry.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    const payload = {
      title: formData.title,
      description: formData.description,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      referenceImages: formData.referenceImages ? formData.referenceImages.split('\n').filter(line => line.trim()) : [],
      deadline: formData.deadline || undefined,
      colorPreferences: formData.colorPreferences || undefined,
      specialInstructions: formData.specialInstructions || undefined,
    };

    try {
      const response = await fetch('http://localhost:5000/api/v1/custom-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus({
          type: 'success',
          message: 'Your custom crochet request has been submitted successfully! Check your email for status notifications.',
        });
        setFormData({
          title: '',
          description: '',
          budget: '',
          deadline: '',
          referenceImages: '',
          colorPreferences: '',
          specialInstructions: '',
        });
      } else {
        setStatus({ type: 'error', message: data.message || 'Inquiry submission failed.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'Could not connect to custom order service.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Intro info */}
      <div className="space-y-6 lg:sticky lg:top-28">
        <div className="inline-flex items-center space-x-2 bg-orange-100/60 text-[#E07A5F] px-4 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Bespoke Crochet Tailoring</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#3D405B] leading-[1.15]">
          Bring Your Custom <br />
          <span className="text-gradient">Yarn Ideas to Life</span>
        </h1>
        <p className="text-gray-600 leading-relaxed">
          From replicas of your beloved pets to aesthetic home decor, our master weavers transform your concepts into tangible, premium organic yarn crafts.
        </p>

        {/* Workflow */}
        <div className="space-y-4 pt-4">
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-[#E07A5F] text-sm">1</div>
            <div>
              <h4 className="font-bold text-[#3D405B]">Submit Your Specifications</h4>
              <p className="text-xs text-gray-500 mt-0.5">Describe your concept, submit reference links, and outline your budget.</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-[#81B29A] text-sm">2</div>
            <div>
              <h4 className="font-bold text-[#3D405B]">Review & Quotation</h4>
              <p className="text-xs text-gray-500 mt-0.5">We will evaluate yarn availability, complexity, and email a quoted price within 24 hours.</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-[#F2CC8F] text-sm">3</div>
            <div>
              <h4 className="font-bold text-[#3D405B]">Handweaving & Delivery</h4>
              <p className="text-xs text-gray-500 mt-0.5">Upon quote approval, we handcraft your item with milestone updates sent directly to your inbox.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="bg-white p-8 rounded-2xl border border-orange-50/50 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-[#3D405B]">Custom Craft Form</h3>

        {status && (
          <div className={`p-4 rounded-xl text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#3D405B] uppercase mb-1">Concept Name / Idea Title</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Chubby Teddy Bear holding a Red Heart"
              className="w-full bg-orange-50/30 border-0 text-sm px-4 py-3 rounded-xl focus:ring-1 focus:ring-[#E07A5F] focus:outline-none"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D405B] uppercase mb-1">Detailed Description</label>
            <textarea
              name="description"
              rows={4}
              placeholder="Please describe size, details, facial expressions, or key components..."
              className="w-full bg-orange-50/30 border-0 text-sm px-4 py-3 rounded-xl focus:ring-1 focus:ring-[#E07A5F] focus:outline-none"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D405B] uppercase mb-1">Target Budget (Rs.)</label>
              <input
                type="number"
                name="budget"
                placeholder="e.g. 1500"
                className="w-full bg-orange-50/30 border-0 text-sm px-4 py-3 rounded-xl focus:ring-1 focus:ring-[#E07A5F] focus:outline-none"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#3D405B] uppercase mb-1">Desired Delivery Date</label>
              <input
                type="date"
                name="deadline"
                className="w-full bg-orange-50/30 border-0 text-sm px-4 py-3 rounded-xl focus:ring-1 focus:ring-[#E07A5F] focus:outline-none"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D405B] uppercase mb-1">Reference Image URLs (one per line)</label>
            <textarea
              name="referenceImages"
              rows={2}
              placeholder="Paste image links here..."
              className="w-full bg-orange-50/30 border-0 text-sm px-4 py-3 rounded-xl focus:ring-1 focus:ring-[#E07A5F] focus:outline-none"
              value={formData.referenceImages}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D405B] uppercase mb-1">Color Palette / Preferences</label>
            <input
              type="text"
              name="colorPreferences"
              placeholder="e.g. Pastel Pink body, Soft Mint bow tie"
              className="w-full bg-orange-50/30 border-0 text-sm px-4 py-3 rounded-xl focus:ring-1 focus:ring-[#E07A5F] focus:outline-none"
              value={formData.colorPreferences}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3D405B] uppercase mb-1">Special / Gift Instructions</label>
            <input
              type="text"
              name="specialInstructions"
              placeholder="e.g. Pack with a birthday gift message"
              className="w-full bg-orange-50/30 border-0 text-sm px-4 py-3 rounded-xl focus:ring-1 focus:ring-[#E07A5F] focus:outline-none"
              value={formData.specialInstructions}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-full text-base font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting inquiry...' : 'Submit Custom Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
