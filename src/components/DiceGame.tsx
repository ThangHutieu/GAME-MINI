import { useState } from "react";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { Dices } from "lucide-react";
import { playDiceRoll, playWinSound } from "../lib/audio";

const targetRotations: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  2: { x: 0, y: -90 },
  5: { x: 0, y: 90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
};

const Dot = ({ color, size = "w-[26px] h-[26px]" }: { color: "red" | "black", size?: string }) => (
  <div 
    className={`${size} rounded-full ${
      color === 'red' ? 'bg-red-600' : 'bg-slate-900'
    }`}
    style={{
      boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.8), 0 1px 2px rgba(255,255,255,1)'
    }}
  />
);

const FaceContainer = ({ transform, children }: { transform: string, children: React.ReactNode }) => (
  <div 
    className="absolute inset-0 rounded-[18px] overflow-hidden"
    style={{
      transform,
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 40%, #e5e7eb 100%)',
      border: '1px solid rgba(0,0,0,0.1)',
      boxShadow: 'inset 0 0 15px rgba(0,0,0,0.05), inset 0 0 5px rgba(0,0,0,0.1)',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden',
    }}
  >
    {children}
  </div>
);

const InnerCore = () => (
  <div className="absolute top-[2px] left-[2px] w-[124px] h-[124px]" style={{ transformStyle: 'preserve-3d' }}>
    {/* The core has no border radius and fills the gaps of the outer rounded corners */}
    {['rotateY(0deg)', 'rotateY(180deg)', 'rotateY(90deg)', 'rotateY(-90deg)', 'rotateX(90deg)', 'rotateX(-90deg)'].map((transform, i) => (
      <div key={i} className="absolute inset-0 bg-[#d1d5db]" style={{ transform: `${transform} translateZ(62px)` }} />
    ))}
  </div>
);

const Dice3D = ({ rotation }: { rotation: { x: number; y: number; z: number } }) => {
  return (
    <div className="relative w-32 h-32">
      {/* Ground shadow */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-28 h-8 bg-black/40 blur-[12px] rounded-[100%]" />
      
      <motion.div 
        className="relative w-full h-full"
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
          rotateZ: rotation.z
        }}
        transition={{
          duration: 2.2,
          ease: [0.17, 0.67, 0.13, 1.04] // Bouncy realistic ease
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <InnerCore />
        
        {/* Face 1 */}
        <FaceContainer transform="rotateY(0deg) translateZ(64px)">
          <div className="flex items-center justify-center w-full h-full">
            <Dot color="red" size="w-14 h-14" />
          </div>
        </FaceContainer>

        {/* Face 6 */}
        <FaceContainer transform="rotateY(180deg) translateZ(64px)">
          <div className="flex flex-col justify-between w-full h-full p-[18px]">
            <div className="flex justify-between"><Dot color="black" /><Dot color="black" /></div>
            <div className="flex justify-between"><Dot color="black" /><Dot color="black" /></div>
            <div className="flex justify-between"><Dot color="black" /><Dot color="black" /></div>
          </div>
        </FaceContainer>

        {/* Face 2 */}
        <FaceContainer transform="rotateY(90deg) translateZ(64px)">
          <div className="flex justify-between w-full h-full p-[20px]">
            <div className="self-start"><Dot color="black" /></div>
            <div className="self-end"><Dot color="black" /></div>
          </div>
        </FaceContainer>

        {/* Face 5 */}
        <FaceContainer transform="rotateY(-90deg) translateZ(64px)">
          <div className="flex flex-col justify-between w-full h-full p-[20px] relative">
            <div className="flex justify-between"><Dot color="black" /><Dot color="black" /></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"><Dot color="black" /></div>
            <div className="flex justify-between"><Dot color="black" /><Dot color="black" /></div>
          </div>
        </FaceContainer>

        {/* Face 3 */}
        <FaceContainer transform="rotateX(90deg) translateZ(64px)">
          <div className="flex justify-between w-full h-full p-[18px]">
            <div className="self-start"><Dot color="black" /></div>
            <div className="self-center"><Dot color="black" /></div>
            <div className="self-end"><Dot color="black" /></div>
          </div>
        </FaceContainer>

        {/* Face 4 */}
        <FaceContainer transform="rotateX(-90deg) translateZ(64px)">
          <div className="flex flex-col justify-between w-full h-full p-[20px]">
            <div className="flex justify-between"><Dot color="red" /><Dot color="red" /></div>
            <div className="flex justify-between"><Dot color="red" /><Dot color="red" /></div>
          </div>
        </FaceContainer>

      </motion.div>
    </div>
  );
};

export default function DiceGame() {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);

  const [rot1, setRot1] = useState({ x: -15, y: -25, z: 0 });
  const [rot2, setRot2] = useState({ x: 25, y: 15, z: 0 });

  const rollDice = () => {
    if (isRolling) return;
    
    playDiceRoll(); // Trigger realistic dice rolling sound
    
    setIsRolling(true);
    setResult(null);

    const v1 = Math.floor(Math.random() * 6) + 1;
    const v2 = Math.floor(Math.random() * 6) + 1;

    const base1 = targetRotations[v1];
    const base2 = targetRotations[v2];

    const spinsX1 = (Math.floor(Math.random() * 4) + 4) * 360; 
    const spinsY1 = (Math.floor(Math.random() * 4) + 4) * 360;
    const spinsZ1 = (Math.floor(Math.random() * 2) + 2) * 360;
    
    const dirX1 = Math.random() > 0.5 ? 1 : -1;
    const dirY1 = Math.random() > 0.5 ? 1 : -1;
    const dirZ1 = Math.random() > 0.5 ? 1 : -1;

    const nextX1 = rot1.x - (rot1.x % 360) + base1.x + (spinsX1 * dirX1);
    const nextY1 = rot1.y - (rot1.y % 360) + base1.y + (spinsY1 * dirY1);
    const nextZ1 = rot1.z - (rot1.z % 360) + (spinsZ1 * dirZ1);

    const spinsX2 = (Math.floor(Math.random() * 4) + 4) * 360; 
    const spinsY2 = (Math.floor(Math.random() * 4) + 4) * 360;
    const spinsZ2 = (Math.floor(Math.random() * 2) + 2) * 360;

    const nextX2 = rot2.x - (rot2.x % 360) + base2.x + (spinsX2 * (dirX1 * -1)); 
    const nextY2 = rot2.y - (rot2.y % 360) + base2.y + (spinsY2 * (dirY1 * -1));
    const nextZ2 = rot2.z - (rot2.z % 360) + (spinsZ2 * (dirZ1 * -1));

    setRot1({ x: nextX1, y: nextY1, z: nextZ1 });
    setRot2({ x: nextX2, y: nextY2, z: nextZ2 });

    setTimeout(() => {
      playWinSound(); // Trigger happy win chime
      setResult(v1 + v2);
      setIsRolling(false);
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#e11d48", "#ffffff", "#4f46e5"]
      });
    }, 2200); 
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-3xl mx-auto min-h-[500px] bg-neutral-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
      <div className="mb-20 flex space-x-12 sm:space-x-20 mt-8" style={{ perspective: '1200px' }}>
        <Dice3D rotation={rot1} />
        <Dice3D rotation={rot2} />
      </div>

      <div className="h-24 flex items-center justify-center flex-col w-full">
        {result !== null && !isRolling && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="text-center bg-white/5 px-12 py-4 rounded-2xl border border-white/10"
          >
            <p className="text-neutral-400 font-medium mb-1 uppercase tracking-widest text-sm">Kết Quả</p>
            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 drop-shadow-sm">
              {result} Điểm
            </h2>
          </motion.div>
        )}
      </div>

      <button
        onClick={rollDice}
        disabled={isRolling}
        className="mt-8 relative group flex items-center justify-center space-x-3 text-white font-bold py-5 px-14 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl w-72 overflow-hidden hover:scale-105 active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
        <span className="relative z-10 flex items-center space-x-2">
          <Dices className={`w-6 h-6 ${isRolling ? "animate-spin" : ""}`} />
          <span>{isRolling ? "Đang đổ..." : "Đổ Xí Ngầu"}</span>
        </span>
      </button>
    </div>
  );
}
