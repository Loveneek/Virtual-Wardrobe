'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Category {
  id: number;
  name: string;
}

export default function UploadModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState('Shirts');
  const [bodyPart, setBodyPart] = useState('upper_body');
  const [garmentName, setGarmentName] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen && token) {
      fetch('http://localhost:8080/api/categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setCategories(data);
          if (data.length > 0 && category === 'Shirts') {
            // Default to the first category if 'Shirts' isn't available
            const hasShirts = data.find((c: Category) => c.name === 'Shirts');
            if (!hasShirts) setCategory(data[0].name);
          }
        })
        .catch(err => console.error('Failed to fetch categories', err));
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));

    // Auto-fill name (remove extension)
    const cleanName = selected.name.replace(/\.[^/.]+$/, '');
    setGarmentName(cleanName);

    // Auto detect category
    setDetecting(true);
    try {
      const formData = new FormData();
      formData.append('image', selected);

      const res = await fetch(
        'http://localhost:8080/api/clothing/detect-category',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (res.ok) {
        const data = await res.json();
        setCategory(data.category);
        if (data.bodyPart) {
          setBodyPart(data.bodyPart);
        }
      }
    } catch (err) {
      console.error('Category detection failed:', err);
    } finally {
      setDetecting(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setUploading(true);

    const selectedCategory = categories.find((c) => c.name === category);
    const categoryId = selectedCategory ? selectedCategory.id : (categories[0]?.id || 1);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('name', garmentName.trim() || file.name);
    formData.append('categoryId', String(categoryId));
    formData.append('bodyPart', bodyPart);

    try {
      const res = await fetch(
        'http://localhost:8080/api/clothing',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      if (res.ok) {
        // Reset state after successful upload
        setFile(null);
        setPreview(null);
        setGarmentName('');
        setCategory('Shirts');
        setBodyPart('upper_body');
        onClose();
      } else {
        const errorText = await res.text();
        console.error('Backend rejected request:', errorText);
      }
    } catch (err) {
      console.error('Network/Connection Error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black tracking-tighter">
            Add New Garment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <div
            className="border-2 border-dashed border-gray-200 rounded-3xl h-64 flex flex-col items-center justify-center bg-gray-50 overflow-hidden relative cursor-pointer"
            onClick={() =>
              document.getElementById('fileInput')?.click()
            }
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6">
                <p className="font-bold text-gray-400">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            )}
            <input
              id="fileInput"
              type="file"
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>

          {/* Garment Name */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Garment Name
            </label>
            <input
              type="text"
              value={garmentName}
              onChange={(e) =>
                setGarmentName(e.target.value)
              }
              placeholder="Enter garment name"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-gray-700">
                Category
              </label>
              {detecting && (
                <span className="text-xs text-blue-500 font-medium animate-pulse">
                  🤖 AI detecting...
                </span>
              )}
              {!detecting && file && (
                <span className="text-xs text-green-500 font-medium">
                  ✓ AI suggested
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${category === cat.name
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Body Part Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Body Part
            </label>
            <select
              value={bodyPart}
              onChange={(e) => setBodyPart(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="upper_body">Upper Body</option>
              <option value="lower_body">Lower Body</option>
              <option value="footwear">Footwear</option>
              <option value="full_body">Full Body</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Upload Button */}
          <button
            type="button"
            onClick={handleUpload}
            disabled={
              !file ||
              uploading ||
              detecting ||
              !garmentName.trim()
            }
            className={`w-full py-4 rounded-2xl font-bold transition-all ${!file ||
              uploading ||
              detecting ||
              !garmentName.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:shadow-2xl active:scale-95'
              }`}
          >
            {uploading
              ? 'Uploading...'
              : detecting
                ? 'Detecting category...'
                : 'Save to Wardrobe'}
          </button>
        </div>
      </div>
    </div>
  );
}