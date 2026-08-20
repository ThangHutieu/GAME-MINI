import { useState, useRef } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { Settings, Plus, Trash2, PartyPopper } from "lucide-react";
import { playWheelSpin, playWinSound } from "../lib/audio";

const premiumColors = [
  "#E11D48", // Rose 600
  "#D97706", // Amber 600
  "#16A34A", // Green 600
  "#2563EB", // Blue 600
  "#9333EA", // Purple 600
  "#0891B2", // Cyan 600
  "#EA580C", // Orange 600
  "#4F46E5", // Indigo 600
];

function getCoordinatesForPercent(percent: number) {
  const x = Math.cos(2 * Math.PI * percent);
  const y = Math.sin(2 * Math.PI * percent);
  return [x, y];
}

interface Option {
  id: string;
  text: string;
}

export default function WheelGame() {
  const [options, setOptions] = useState<Option[]>([
    { id: "1", text: "100" },
    { id: "2", text: "200" },
    { id: "3", text: "500" },
    { id: "4", text: "Trượt" },
    { id: "5", text: "1000" },
    { id: "6", text: "Chia đôi" },
    { id: "7", text: "x2" },
    { id: "8", text: "Thêm lượt" },
  ]);
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<Option | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");

  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    if (isSpinning || options.length === 0) return;
    
    playWheelSpin(4500); // Trigger mechanical ticking sound for duration of spin
    
    setIsSpinning(true);
    setWinner(null);

    const winningIndex = Math.floor(Math.random() * options.length);
    const winningOption = options[winningIndex];

    const slicePercent = 1 / options.length;
    const startPercent = winningIndex * slicePercent;
    const textPercent = startPercent + slicePercent / 2;
    const textAngle = textPercent * 360;

    const randomOffset = (Math.random() - 0.5) * (360 / options.length) * 0.8;
    
    let targetR = 270 - textAngle + randomOffset;
    if (targetR < 0) targetR += 360;

    const currentMod = rotation % 360;
    let delta = targetR - currentMod;
    if (delta < 0) delta += 360;

    const nextRotation = rotation + delta + 360 * 6;

    setRotation(nextRotation);

    setTimeout(() => {
      playWinSound(); // Trigger happy win chime
      setWinner(winningOption);
      setIsSpinning(false);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#E11D48", "#2563EB", "#16A34A", "#FBBF24"]
      });
    }, 4500);
  };

  const handleClaimReward = () => {
    if (winner) {
      setOptions(prev => prev.filter(o => o.id !== winner.id));
      setWinner(null);
    }
  };

  const handleAddOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOptionText.trim()) return;
    setOptions(prev => [...prev, { id: Math.random().toString(), text: newOptionText.trim() }]);
    setNewOptionText("");
  };

  const handleRemoveOption = (id: string) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const renderWheel = () => {
    if (options.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center text-neutral-500 font-medium bg-neutral-800 rounded-full border-4 border-neutral-700">
          Trống
        </div>
      );
    }

    if (options.length === 1) {
      return (
        <svg viewBox="-100 -100 200 200" className="w-full h-full rounded-full shadow-2xl">
          <circle cx="0" cy="0" r="100" fill={premiumColors[0]} />
          <text 
            x="0" y="0" fill="white" fontSize="16" fontWeight="bold" textAnchor="middle" alignmentBaseline="middle"
          >
            {options[0].text}
          </text>
        </svg>
      );
    }

    return (
      <svg viewBox="-100 -100 200 200" className="w-full h-full rounded-full shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.5" />
          </filter>
        </defs>
        {options.map((opt, i) => {
          const slicePercent = 1 / options.length;
          const startPercent = i * slicePercent;
          const endPercent = (i + 1) * slicePercent;

          const [startX, startY] = getCoordinatesForPercent(startPercent);
          const [endX, endY] = getCoordinatesForPercent(endPercent);
          const largeArcFlag = slicePercent > 0.5 ? 1 : 0;

          const pathData = [
            `M 0 0`,
            `L ${startX * 100} ${startY * 100}`,
            `A 100 100 0 ${largeArcFlag} 1 ${endX * 100} ${endY * 100}`,
            `Z`
          ].join(' ');

          const textPercent = startPercent + slicePercent / 2;
          const textAngle = textPercent * 360;

          return (
            <g key={opt.id} className="transition-all duration-300">
              <path d={pathData} fill={premiumColors[i % premiumColors.length]} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
              <text 
                x="65" 
                y="0" 
                fill="white"
                fontSize={options.length > 12 ? "5" : "7"}
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
                transform={`rotate(${textAngle})`}
                className="drop-shadow-md"
              >
                {opt.text}
              </text>
            </g>
          );
        })}
        {/* Center pivot */}
        <circle cx="0" cy="0" r="14" fill="#171717" filter="url(#shadow)" />
        <circle cx="0" cy="0" r="10" fill="#262626" stroke="#404040" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="4" fill="#a3a3a3" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl mx-auto min-h-[550px]">
      
      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-neutral-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 relative overflow-hidden">
        
        {/* Settings Toggle */}
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="absolute top-6 right-6 p-3 bg-white/5 hover:bg-white/10 rounded-full text-neutral-300 transition-colors shadow-sm border border-white/10"
        >
          <Settings className="w-5 h-5" />
        </button>

        <div className="relative w-72 h-72 sm:w-96 sm:h-96 mb-10" ref={wheelRef}>
          {/* Pointer */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-180 text-rose-500">
              <path d="M12 2L2 22h20L12 2z" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
            </svg>
          </div>
          
          <motion.div 
            className="w-full h-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 4.5, ease: [0.2, 0.8, 0.2, 1] }} 
          >
            {renderWheel()}
          </motion.div>
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning || options.length === 0}
          className="relative group flex items-center justify-center space-x-2 text-white font-bold py-4 px-16 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl w-64 overflow-hidden hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10">{isSpinning ? "Đang quay..." : "Quay Ngay"}</span>
        </button>

        {/* Winner Modal */}
        {winner && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-500/20 to-transparent" />
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 border border-indigo-500/30">
                <PartyPopper className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-neutral-400 font-medium uppercase tracking-widest text-sm mb-2 relative z-10">Bạn Quay Trúng</h3>
              <p className="text-4xl font-black text-white mb-8 relative z-10">{winner.text}</p>
              
              <button 
                onClick={handleClaimReward}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-colors relative z-10"
              >
                Nhận & Loại Ô Này
              </button>
            </motion.div>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full md:w-80 bg-neutral-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-6 flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Cài đặt Vòng Quay</h3>
            <span className="text-sm font-medium text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
              {options.length} ô
            </span>
          </div>
          
          <form onSubmit={handleAddOption} className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newOptionText}
              onChange={(e) => setNewOptionText(e.target.value)}
              placeholder="Thêm lựa chọn mới..."
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white placeholder-neutral-500 text-sm"
            />
            <button 
              type="submit"
              disabled={!newOptionText.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {options.map((opt, i) => (
              <div 
                key={opt.id} 
                className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-white/20 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: premiumColors[i % premiumColors.length] }} />
                  <span className="text-sm font-medium text-neutral-200 truncate">{opt.text}</span>
                </div>
                <button 
                  onClick={() => handleRemoveOption(opt.id)}
                  className="text-neutral-500 hover:text-rose-400 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {options.length === 0 && (
              <p className="text-center text-neutral-500 text-sm py-8">Vòng quay đang trống.</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
