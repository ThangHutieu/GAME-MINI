import { useState } from "react";
import DiceGame from "./components/DiceGame";
import WheelGame from "./components/WheelGame";
import { Dices, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"dice" | "wheel">("dice");

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-rose-600/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="text-center mb-10 relative z-10">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">
          Trò Chơi May Mắn
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto text-lg">
          Thử vận may với Xí Ngầu 3D hoặc Vòng Quay.
        </p>
      </div>

      <div className="bg-neutral-900/60 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/10 flex items-center mb-10 w-full max-w-md mx-auto relative z-10">
        <button
          onClick={() => setActiveTab("dice")}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-colors relative ${
            activeTab === "dice" ? "text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "dice" && (
            <motion.div layoutId="tab-indicator" className="absolute inset-0 bg-white/10 border border-white/5 rounded-xl shadow-sm" />
          )}
          <span className="relative z-10 flex items-center space-x-2">
            <Dices className="w-5 h-5" />
            <span>Đổ Xí Ngầu</span>
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab("wheel")}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-medium transition-colors relative ${
            activeTab === "wheel" ? "text-white" : "text-neutral-400 hover:text-white"
          }`}
        >
          {activeTab === "wheel" && (
            <motion.div layoutId="tab-indicator" className="absolute inset-0 bg-white/10 border border-white/5 rounded-xl shadow-sm" />
          )}
          <span className="relative z-10 flex items-center space-x-2">
            <RefreshCw className="w-5 h-5" />
            <span>Vòng Quay</span>
          </span>
        </button>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === "dice" && (
            <motion.div
              key="dice"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <DiceGame />
            </motion.div>
          )}
          {activeTab === "wheel" && (
            <motion.div
              key="wheel"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <WheelGame />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
