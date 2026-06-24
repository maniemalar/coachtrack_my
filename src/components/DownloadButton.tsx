import React from 'react';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
  id: string;
  onClick: () => void;
  label: string;
}

export default function DownloadButton({ id, onClick, label }: DownloadButtonProps) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 bg-[#14B8A6]/10 hover:bg-[#14B8A6]/20 text-[#061A4D] border border-[#14B8A6]/30 font-extrabold text-xs py-3 px-4 rounded-xl uppercase tracking-wider transition-all cursor-pointer font-sans select-none flex"
    >
      <Download className="w-4 h-4 text-[#14B8A6]" />
      <span>{label}</span>
    </button>
  );
}
