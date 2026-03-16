'use client';

export default function MinerarView({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-white pb-24">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors z-10"
      >
        <span className="material-icons-outlined text-2xl">arrow_back</span>
      </button>
      <p className="text-gray-300 text-sm font-semibold tracking-widest uppercase">Em breve</p>
    </div>
  );
}
