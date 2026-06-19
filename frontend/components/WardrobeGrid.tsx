'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function WardrobeGrid({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<
    { id: number; name: string; imageUrl: string; category?: { id: number; name: string } }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Folder state
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  // Edit states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const { token } = useAuth();

  useEffect(() => {
    const fetchWardrobe = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8080/api/clothing', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setItems(data);
        }
      } catch (err) {
        console.error('Failed to fetch wardrobe:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchWardrobe();
  }, [token, refreshKey]);

  // 🔥 Delete Item
  const handleDelete = async (id: number) => {
    if (!confirm('Remove this item from your wardrobe?')) return;

    setDeletingId(id);

    try {
      const res = await fetch(`http://localhost:8080/api/clothing/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setDeletingId(null);
    }
  };

  // 🔥 Update Name
  const handleUpdateName = async (id: number) => {
    if (!editName.trim()) return;

    try {
      const res = await fetch(`http://localhost:8080/api/clothing/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: editName }),
      });

      if (!res.ok) throw new Error('Failed to update name');

      const updatedItem = await res.json();

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, name: updatedItem.name } : item
        )
      );

      setEditingId(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-400 font-medium">
        Loading your style...
      </div>
    );

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('shirt') || name.includes('top')) return '👕';
    if (name.includes('pant') || name.includes('jeans') || name.includes('short')) return '👖';
    if (name.includes('shoe') || name.includes('sneaker') || name.includes('boot')) return '👟';
    if (name.includes('jacket') || name.includes('coat') || name.includes('hoodie')) return '🧥';
    if (name.includes('dress')) return '👗';
    if (name.includes('hat') || name.includes('cap')) return '🧢';
    if (name.includes('glasses')) return '🕶️';
    if (name.includes('watch')) return '⌚';
    return '📁'; // Default fallback
  };

  // Derive unique categories/folders from the loaded items
  const folders = Array.from(
    new Map(
      items
        .filter((item) => item.category)
        .map((item) => [item.category!.id, item.category!])
    ).values()
  );

  // Filter items by selected folder (if any)
  const displayedItems = selectedFolderId
    ? items.filter((item) => item.category?.id === selectedFolderId)
    : items;

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {selectedFolderId && (
            <button
              onClick={() => setSelectedFolderId(null)}
              className="text-gray-500 hover:text-black font-bold text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Back to Folders
            </button>
          )}
          <h3 className="font-black text-lg">
            {selectedFolderId
              ? `${folders.find(f => f.id === selectedFolderId)?.name || 'Folder'} (${displayedItems.length})`
              : `${items.length} item${items.length !== 1 ? 's' : ''} in your wardrobe`
            }
          </h3>
        </div>
      </div>

      {selectedFolderId === null ? (
        // --- FOLDER VIEW ---
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {folders.length > 0 ? (
            folders.map((folder) => {
              const itemCount = items.filter(i => i.category?.id === folder.id).length;
              return (
                <div
                  key={folder.id}
                  onClick={() => setSelectedFolderId(folder.id)}
                  className="bg-white border text-center border-gray-100 rounded-[2rem] p-8 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all group"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {getCategoryIcon(folder.name)}
                  </div>
                  <h4 className="font-black text-lg text-black">{folder.name}</h4>
                  <p className="text-sm text-gray-400 font-medium">{itemCount} items</p>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400 font-medium">
                No items found. Upload your first garment!
              </p>
            </div>
          )}
        </div>
      ) : (
        // --- ITEMS IN FOLDER VIEW ---
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {displayedItems.length > 0 ? (
            displayedItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                  className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                >
                  {deletingId === item.id ? '...' : '✕'}
                </button>

                <img
                  src={item.imageUrl}
                  className="w-full h-64 object-cover grayscale-[20%] group-hover:grayscale-0 transition-all"
                  alt={item.name}
                />

                <div className="p-4">
                  {editingId === item.id ? (
                    <div className="flex gap-2">
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border px-2 py-1 rounded text-sm w-full"
                      />
                      <button
                        onClick={() => handleUpdateName(item.id)}
                        className="text-green-600 text-sm font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-black truncate">
                        {item.name}
                      </p>
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditName(item.name);
                        }}
                        className="text-xs text-gray-400 hover:text-black"
                      >
                        ✏️
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-1">
                    {item.category?.name}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-gray-400 font-medium">
                No items in this folder.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}