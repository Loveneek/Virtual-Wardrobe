'use client';

interface TryOnResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
    loading: boolean;
    error: string | null;
}

export default function TryOnResultModal({
    isOpen,
    onClose,
    imageUrl,
    loading,
    error,
}: TryOnResultModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold transition-colors"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-black mb-6 text-center">Your Try-On Result</h2>

                <div className="min-h-[400px] bg-slate-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center overflow-hidden relative">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="font-bold text-lg">Generating your look...</p>
                            <p className="text-sm text-gray-500 mt-2">This processing magic might take up to a minute.</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center text-red-500">
                            <p className="font-bold text-lg mb-2">Oops!</p>
                            <p>{error}</p>
                        </div>
                    ) : imageUrl ? (
                        <img
                            src={imageUrl}
                            alt="Try-on Result"
                            className="w-full h-full object-cover"
                        />
                    ) : null}
                </div>

                <div className="mt-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className={`px-8 py-3 rounded-xl font-bold transition-all ${loading
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-black text-white hover:shadow-lg active:scale-95'
                            }`}
                        disabled={loading}
                    >
                        {loading ? 'Please wait...' : 'Done'}
                    </button>
                </div>
            </div>
        </div>
    );
}
