"use client";

import { useState, useEffect, useCallback } from "react";
import { MinigameReward } from "@/types/game";

interface Transaction {
  id: number;
  amount: number;
  sender: string;
  isTrap: boolean;
  trapLevel: number;
}

interface MoneyRunMiniGameProps {
  difficulty?: number;
  onResult: (success: boolean, reward: MinigameReward) => void;
}

const TRAP_LEVEL_1 = ["系统", "公安", "银行", "冻结", "110", "反诈"];
const TRAP_LEVEL_2 = ["公 安", "银*行", "冻 结", "系統", "jǐng察"];
const TRAP_LEVEL_3 = ["客服", "抽奖", "返利", "刷单", "代付"];

const NORMAL_NAMES = [
  "王*明", "李*华", "张*强", "刘*伟", "陈*龙",
  "赵*飞", "周*杰", "吴*涛", "孙*磊", "马*军",
  "钱*峰", "林*辉", "郑*宇", "黄*鑫", "何*凯"
];

function generateTransaction(round: number, difficulty: number): Transaction {
  const trapChance = 0.2 + round * 0.03 + difficulty * 0.02;
  const isTrap = Math.random() < trapChance;
  const amount = Math.floor(Math.random() * 4500) + 500;

  let sender: string;
  let trapLevel = 0;

  if (isTrap) {
    const levelRoll = Math.random();
    if (round < 3 || levelRoll < 0.5) {
      trapLevel = 1;
      const indicator = TRAP_LEVEL_1[Math.floor(Math.random() * TRAP_LEVEL_1.length)];
      sender = `${indicator}${Math.floor(Math.random() * 1000)}`;
    } else if (levelRoll < 0.8) {
      trapLevel = 2;
      const indicator = TRAP_LEVEL_2[Math.floor(Math.random() * TRAP_LEVEL_2.length)];
      sender = `用户${indicator.charAt(0)}${Math.floor(Math.random() * 10000)}`;
    } else {
      trapLevel = 3;
      const indicator = TRAP_LEVEL_3[Math.floor(Math.random() * TRAP_LEVEL_3.length)];
      sender = `${NORMAL_NAMES[Math.floor(Math.random() * NORMAL_NAMES.length)].charAt(0)}*${indicator}`;
    }
  } else {
    sender = NORMAL_NAMES[Math.floor(Math.random() * NORMAL_NAMES.length)];
  }

  return { id: round, amount, sender, isTrap, trapLevel };
}

export default function MoneyRunMiniGame({ difficulty = 1, onResult }: MoneyRunMiniGameProps) {
  const [phase, setPhase] = useState<"ready" | "playing" | "frozen" | "escaped">("ready");
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
  const [heatLevel, setHeatLevel] = useState(0);
  const [balance, setBalance] = useState(0);
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(100);
  const [correctDecisions, setCorrectDecisions] = useState(0);
  const [glitch, setGlitch] = useState(false);

  const maxRounds = 8 + difficulty * 2;
  const baseTimeDecay = 1.5 + difficulty * 0.3;

  const handleDecision = useCallback((accepted: boolean) => {
    if (!currentTx || phase !== "playing") return;

    let isCorrect = false;

    if (accepted) {
      if (currentTx.isTrap) {
        const heatIncrease = 25 + currentTx.trapLevel * 5;
        const newHeat = heatLevel + heatIncrease;
        setHeatLevel(newHeat);
        setGlitch(true);
        setTimeout(() => setGlitch(false), 300);

        if (newHeat >= 100) {
          setPhase("frozen");
          return;
        }
      } else {
        setBalance((prev) => prev + currentTx.amount);
        isCorrect = true;
      }
    } else {
      if (currentTx.isTrap) {
        isCorrect = true;
        setHeatLevel((prev) => Math.max(0, prev - 3));
      }
    }

    if (isCorrect) {
      setCorrectDecisions((prev) => prev + 1);
    }

    const nextRound = round + 1;
    if (nextRound >= maxRounds) {
      setPhase("escaped");
    } else {
      setRound(nextRound);
      setCurrentTx(generateTransaction(nextRound, difficulty));
      const newTimeLimit = Math.max(60, 100 - heatLevel * 0.3);
      setTimeLeft(newTimeLimit);
    }
  }, [currentTx, phase, heatLevel, round, maxRounds, difficulty]);

  useEffect(() => {
    if (phase === "playing" && timeLeft > 0) {
      const decayRate = baseTimeDecay + (heatLevel > 50 ? 0.5 : 0);
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - decayRate));
      }, 100);
      return () => clearInterval(timer);
    } else if (phase === "playing" && timeLeft === 0) {
      handleDecision(false);
    }
  }, [phase, timeLeft, handleDecision, baseTimeDecay, heatLevel]);

  const startGame = () => {
    setPhase("playing");
    setCurrentTx(generateTransaction(0, difficulty));
    setRound(0);
    setBalance(0);
    setHeatLevel(0);
    setTimeLeft(100);
    setCorrectDecisions(0);
  };

  const calculateReward = (): MinigameReward => {
    const balanceBonus = Math.floor(balance / 500);
    const accuracyBonus = correctDecisions >= maxRounds * 0.7 ? 5 : 0;
    return {
      wealth: 10 + balanceBonus + accuracyBonus,
      digitalSafety: -5,
      sanity: -3
    };
  };

  const handleFinish = () => {
    if (phase === "frozen") {
      onResult(false, { wealth: -15, digitalSafety: -25, sanity: -15 });
    } else {
      onResult(true, calculateReward());
    }
  };

  const getHeatColor = () => {
    if (heatLevel < 30) return "success";
    if (heatLevel < 60) return "warning";
    return "danger";
  };

  return (
    <div className={`minigame-container p-6 relative z-10 ${glitch ? "animate-glitch" : ""} ${phase === "frozen" ? "grayscale" : ""}`}>
      <h3 className="minigame-title text-3xl text-center mb-4">
        💰 绝命跑分
      </h3>

      {phase === "ready" && (
        <div className="text-center">
          <p className="text-sm text-foreground/60 mb-2">
            接收灰色资金并快速转账，但要识别出可疑账户！
          </p>
          <p className="text-xs text-foreground/40 mb-4">
            提示：注意发送者名称中的异常字符
          </p>
          <button onClick={startGame} className="btn-barca w-full py-4 text-white font-bold text-lg">
            开始跑分
          </button>
        </div>
      )}

      {phase === "playing" && currentTx && (
        <>
          <div className="flex justify-between text-xs text-foreground/60 mb-1">
            <span className="flex items-center gap-1">
              🔥 热度
              {heatLevel >= 70 && <span className="text-red-400 animate-pulse">危险!</span>}
            </span>
            <span className={heatLevel >= 60 ? "text-red-400" : ""}>{Math.round(heatLevel)}%</span>
          </div>
          <div className="meter-bar mb-4">
            <div className={`meter-fill ${getHeatColor()}`} style={{ width: `${heatLevel}%` }} />
          </div>

          <div className="flex justify-between text-xs text-foreground/60 mb-1">
            <span>⏱️ 时间</span>
            <span>第 {round + 1}/{maxRounds} 笔</span>
          </div>
          <div className="meter-bar mb-4">
            <div
              className={`meter-fill ${timeLeft < 30 ? "danger" : "success"}`}
              style={{ width: `${timeLeft}%` }}
            />
          </div>

          <div className="transaction-card mb-4">
            <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
              <span className="text-xs uppercase tracking-widest text-foreground/50">转入请求</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="text-4xl font-mono text-green-400 neon-text text-center font-bold mb-2">
              +¥{currentTx.amount.toLocaleString()}
            </div>
            <div className="text-sm text-center text-foreground/70">
              发送方: <span className="font-mono text-blue-300">{currentTx.sender}</span>
            </div>
          </div>

          <div className="text-center text-sm text-foreground/50 mb-4">
            已收款: <span className="text-green-400 font-mono">¥{balance.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDecision(false)}
              className="py-4 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-bold border border-red-500/50 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              ❌ 拒绝
            </button>
            <button
              onClick={() => handleDecision(true)}
              className="py-4 rounded-xl bg-green-600/80 hover:bg-green-600 text-white font-bold border border-green-500/50 backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
            >
              ✓ 收款
            </button>
          </div>
        </>
      )}

      {phase === "frozen" && (
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🚔</div>
          <p className="text-xl text-red-400 font-semibold mb-2">账户已冻结！</p>
          <p className="text-sm text-foreground/60 mb-4">
            反诈中心检测到异常交易，所有资金被冻结。
          </p>
          <div className="text-xs text-foreground/40 mb-4">
            最终热度: {Math.round(heatLevel)}% | 收款: ¥{balance.toLocaleString()}
          </div>
          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg"
          >
            接受现实
          </button>
        </div>
      )}

      {phase === "escaped" && (
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <p className="text-xl text-green-400 font-semibold mb-2">成功跑路！</p>
          <p className="text-sm text-foreground/60 mb-2">
            你成功转移了 <span className="text-green-400 font-mono">¥{balance.toLocaleString()}</span>
          </p>
          <div className="text-xs text-foreground/40 mb-4">
            正确决策: {correctDecisions}/{round + 1} | 最终热度: {Math.round(heatLevel)}%
          </div>
          <button
            onClick={handleFinish}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-lg shadow-lg shadow-green-500/20"
          >
            收取 ¥{Math.floor(balance * 0.3).toLocaleString()} 佣金
          </button>
        </div>
      )}
    </div>
  );
}
