"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MinigameReward } from "@/types/game";

interface Comment {
  id: number;
  text: string;
  correctAnswer: string;
  options: string[];
  difficulty: number;
}

interface CampNouGuardianProps {
  difficulty?: number;
  onResult: (success: boolean, reward: MinigameReward) => void;
}

const HATE_COMMENTS: { text: string; correctAnswer: string; wrongAnswers: string[]; difficulty: number }[] = [
  { text: "Pessi 又隐身了", correctAnswer: "8座金球奖了解一下", wrongAnswers: ["C罗才是真GOAT", "你懂个锤子"], difficulty: 1 },
  { text: "体系球员而已", correctAnswer: "单核带阿根廷夺世界杯", wrongAnswers: ["闭嘴黑子", "有哈维才能踢"], difficulty: 1 },
  { text: "欧冠淘汰赛软脚虾", correctAnswer: "4座欧冠+历史射手榜前五", wrongAnswers: ["键盘侠滚开", "无语"], difficulty: 2 },
  { text: "矮子能踢什么球", correctAnswer: "马拉多纳也170cm", wrongAnswers: ["人身攻击举报了", "喷子"], difficulty: 1 },
  { text: "离开巴萨就不行", correctAnswer: "世界杯冠军+美洲杯双冠", wrongAnswers: ["你不懂足球", "黑子退散"], difficulty: 2 },
  { text: "任意球都踢不进", correctAnswer: "生涯65+任意球进球", wrongAnswers: ["假球迷", "滚"], difficulty: 2 },
  { text: "就会点球", correctAnswer: "非点进球700+,点球率90%", wrongAnswers: ["喷子闭嘴", "举报"], difficulty: 3 },
  { text: "国家队数据刷子", correctAnswer: "世界杯金球+美洲杯MVP", wrongAnswers: ["无脑黑", "走开"], difficulty: 2 },
  { text: "没有速度了", correctAnswer: "38岁仍是大联盟MVP", wrongAnswers: ["老了就是老了", "退役吧"], difficulty: 3 },
  { text: "控球数据刷子", correctAnswer: "场均创造3.2次机会", wrongAnswers: ["只会控球", "无效触球"], difficulty: 3 },
];

function generateComment(id: number, usedIds: Set<number>, targetDifficulty: number): Comment {
  const available = HATE_COMMENTS.filter((_, idx) => !usedIds.has(idx))
    .map((c, idx) => ({ ...c, originalIdx: idx }));

  if (available.length === 0) {
    usedIds.clear();
    return generateComment(id, usedIds, targetDifficulty);
  }

  const sorted = available.sort((a, b) => {
    const aDiff = Math.abs(a.difficulty - targetDifficulty);
    const bDiff = Math.abs(b.difficulty - targetDifficulty);
    return aDiff - bDiff;
  });

  const selected = sorted[0];
  usedIds.add(selected.originalIdx);

  const options = [selected.correctAnswer, ...selected.wrongAnswers].sort(() => Math.random() - 0.5);

  return {
    id,
    text: selected.text,
    correctAnswer: selected.correctAnswer,
    options,
    difficulty: selected.difficulty,
  };
}

export default function CampNouGuardian({ difficulty = 1, onResult }: CampNouGuardianProps) {
  const [phase, setPhase] = useState<"ready" | "playing" | "vpn_down" | "result">("ready");
  const [currentComment, setCurrentComment] = useState<Comment | null>(null);
  const [score, setScore] = useState(0);
  const [points, setPoints] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(35);
  const [vpnProgress, setVpnProgress] = useState(0);
  const [vpnTriggered, setVpnTriggered] = useState(false);
  const [showStreakAnim, setShowStreakAnim] = useState(false);
  const usedCommentsRef = useRef<Set<number>>(new Set());
  const holdStartRef = useRef<number | null>(null);

  const maxComments = 6 + difficulty * 2;
  const totalTime = 35 + difficulty * 5;

  useEffect(() => {
    if (phase === "playing" && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (phase === "playing" && timeLeft === 0) {
      setPhase("result");
    }
  }, [phase, timeLeft]);

  useEffect(() => {
    if (phase === "playing" && !vpnTriggered && total >= 3 && Math.random() < 0.12) {
      setPhase("vpn_down");
      setVpnProgress(0);
      setVpnTriggered(true);
      setTimeLeft((prev) => Math.max(5, prev - 3));
    }
  }, [total, phase, vpnTriggered]);

  const startGame = () => {
    usedCommentsRef.current.clear();
    setPhase("playing");
    setCurrentComment(generateComment(0, usedCommentsRef.current, 1));
    setScore(0);
    setPoints(0);
    setTotal(0);
    setStreak(0);
    setMaxStreak(0);
    setTimeLeft(totalTime);
    setVpnTriggered(false);
  };

  const handleAnswer = useCallback((answer: string) => {
    if (!currentComment || phase !== "playing") return;

    const isCorrect = answer === currentComment.correctAnswer;
    const nextTotal = total + 1;

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak((prev) => Math.max(prev, newStreak));
      setScore((prev) => prev + 1);

      const basePoints = 10 * currentComment.difficulty;
      const streakBonus = Math.floor(newStreak / 3) * 5;
      setPoints((prev) => prev + basePoints + streakBonus);

      if (newStreak % 3 === 0 && newStreak > 0) {
        setShowStreakAnim(true);
        setTimeout(() => setShowStreakAnim(false), 500);
      }
    } else {
      setStreak(0);
    }

    setTotal(nextTotal);

    if (nextTotal >= maxComments) {
      setPhase("result");
    } else {
      const targetDiff = Math.min(3, 1 + Math.floor(nextTotal / 3));
      setCurrentComment(generateComment(nextTotal, usedCommentsRef.current, targetDiff));
    }
  }, [currentComment, phase, total, maxComments, streak]);

  const handleVpnHoldStart = () => {
    holdStartRef.current = Date.now();
    const interval = setInterval(() => {
      if (holdStartRef.current) {
        const elapsed = Date.now() - holdStartRef.current;
        const progress = Math.min(100, (elapsed / 1200) * 100);
        setVpnProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setPhase("playing");
          holdStartRef.current = null;
        }
      } else {
        clearInterval(interval);
      }
    }, 50);
  };

  const handleVpnHoldEnd = () => {
    holdStartRef.current = null;
    setVpnProgress(0);
  };

  const getGrade = (): string => {
    const accuracy = total > 0 ? score / total : 0;
    if (accuracy >= 0.9 && maxStreak >= 5) return "S";
    if (accuracy >= 0.8) return "A";
    if (accuracy >= 0.7) return "B";
    return "C";
  };

  const handleFinish = () => {
    const accuracy = total > 0 ? score / total : 0;
    const grade = getGrade();

    if (grade === "S") {
      onResult(true, { sanity: 15, academicStanding: -3 });
    } else if (accuracy >= 0.7) {
      onResult(true, { sanity: 8, academicStanding: -5 });
    } else {
      onResult(false, { sanity: -12, academicStanding: -5, digitalSafety: -5 });
    }
  };

  return (
    <div className={`minigame-container p-6 relative z-10 ${phase === "vpn_down" ? "grayscale contrast-125" : ""}`}>
      <h3 className="minigame-title text-3xl text-center mb-4">
        ⚽ 诺坎普守护者
      </h3>

      {phase === "ready" && (
        <div className="text-center">
          <p className="text-sm text-foreground/60 mb-2">
            凌晨3点，梅西输球了。黑粉涌入评论区，用事实反驳他们！
          </p>
          <p className="text-xs text-foreground/40 mb-4">
            选择有数据支撑的回复，连击可获得额外分数
          </p>
          <button onClick={startGame} className="btn-barca w-full py-4 text-white font-bold text-lg">
            开始护驾
          </button>
        </div>
      )}

      {phase === "vpn_down" && (
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">📡</div>
          <p className="text-xl text-red-400 font-semibold mb-2">VPN 连接中断！</p>
          <p className="text-sm text-foreground/60 mb-4">
            长按重连按钮恢复连接
          </p>
          <div className="meter-bar mb-4">
            <div className="meter-fill success" style={{ width: `${vpnProgress}%` }} />
          </div>
          <button
            onMouseDown={handleVpnHoldStart}
            onMouseUp={handleVpnHoldEnd}
            onMouseLeave={handleVpnHoldEnd}
            onTouchStart={handleVpnHoldStart}
            onTouchEnd={handleVpnHoldEnd}
            className="w-full py-6 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xl active:scale-95 transition-transform select-none"
          >
            🔄 按住重连
          </button>
        </div>
      )}

      {phase === "playing" && currentComment && (
        <>
          <div className="flex justify-between text-xs text-foreground/60 mb-2">
            <span className="flex items-center gap-2">
              ⏱️ {timeLeft}s
              {streak >= 3 && (
                <span className={`text-yellow-400 font-bold ${showStreakAnim ? "animate-streak" : ""}`}>
                  🔥 {streak}连击
                </span>
              )}
            </span>
            <span>得分: {points}pts ({score}/{total})</span>
          </div>
          <div className="meter-bar mb-4">
            <div
              className={`meter-fill ${timeLeft < 10 ? "danger" : "success"}`}
              style={{ width: `${(timeLeft / totalTime) * 100}%` }}
            />
          </div>

          <div className="social-comment-card mb-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex-shrink-0 shadow-lg flex items-center justify-center text-white text-lg">
                👤
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">Hater_{Math.floor(Math.random() * 9999)}</span>
                  <span className="text-xs text-foreground/40">刚刚</span>
                </div>
                <div className="font-medium text-lg leading-snug">{currentComment.text}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {currentComment.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(option)}
                className="social-comment-btn text-sm group"
              >
                <span className="text-barca-accent mr-2 opacity-50 group-hover:opacity-100 transition-opacity">➤</span>
                {option}
              </button>
            ))}
          </div>
        </>
      )}

      {phase === "result" && (
        <div className="text-center">
          <div className="text-6xl mb-2">
            {getGrade() === "S" ? "🏆" : getGrade() === "A" ? "⭐" : getGrade() === "B" ? "👍" : "😔"}
          </div>
          <div className={`text-4xl font-bold mb-2 ${
            getGrade() === "S" ? "text-yellow-400" :
            getGrade() === "A" ? "text-green-400" :
            getGrade() === "B" ? "text-blue-400" : "text-red-400"
          }`}>
            {getGrade()}级
          </div>
          <p className={`text-xl font-semibold mb-2 ${
            (total > 0 ? score / total : 0) >= 0.7 ? "text-green-400" : "text-red-400"
          }`}>
            {(total > 0 ? score / total : 0) >= 0.7 ? "护驾成功！" : "被喷惨了..."}
          </p>
          <div className="text-sm text-foreground/60 mb-2">
            得分: {points}pts | 正确率: {total > 0 ? Math.round((score / total) * 100) : 0}%
          </div>
          <div className="text-xs text-foreground/40 mb-4">
            最高连击: {maxStreak} | 答对: {score}/{total}
          </div>
          <button
            onClick={handleFinish}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              getGrade() === "S"
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30"
                : (total > 0 ? score / total : 0) >= 0.7
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : "bg-gradient-to-r from-red-500 to-red-600"
            } text-white`}
          >
            {(total > 0 ? score / total : 0) >= 0.7 ? "心满意足入睡" : "气得睡不着"}
          </button>
        </div>
      )}
    </div>
  );
}
