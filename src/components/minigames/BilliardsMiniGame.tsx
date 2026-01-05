"use client";

import { useState, useEffect, useCallback } from "react";
import { MinigameReward } from "@/types/game";

type Phase = "ready" | "aiming" | "powering" | "shooting" | "result";
type ResultGrade = "perfect" | "good" | "miss";

interface BilliardsMiniGameProps {
  difficulty?: number;
  onResult: (success: boolean, reward: MinigameReward) => void;
}

export default function BilliardsMiniGame({ difficulty = 1, onResult }: BilliardsMiniGameProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [angle, setAngle] = useState(0);
  const [power, setPower] = useState(0);
  const [direction, setDirection] = useState(1);
  const [powerDirection, setPowerDirection] = useState(1);
  const [lockedAngle, setLockedAngle] = useState(0);
  const [lockedPower, setLockedPower] = useState(0);
  const [resultGrade, setResultGrade] = useState<ResultGrade>("miss");
  const [shake, setShake] = useState(false);

  const sweetSpotSize = Math.max(12, 28 - difficulty * 4);
  const goodZoneSize = sweetSpotSize * 2;
  const sweetSpotCenter = 50;
  const baseSpeed = 2.5 + difficulty * 0.5;

  useEffect(() => {
    if (phase === "aiming") {
      const interval = setInterval(() => {
        setAngle((prev) => {
          let newVal = prev + baseSpeed * direction;
          if (newVal >= 100) {
            setDirection(-1);
            newVal = 100;
          } else if (newVal <= 0) {
            setDirection(1);
            newVal = 0;
          }
          return newVal;
        });
      }, 16);
      return () => clearInterval(interval);
    }
  }, [phase, direction, baseSpeed]);

  useEffect(() => {
    if (phase === "powering") {
      const powerSpeed = baseSpeed * 1.2;
      const interval = setInterval(() => {
        setPower((prev) => {
          let newVal = prev + powerSpeed * powerDirection;
          if (newVal >= 100) {
            setPowerDirection(-1);
            newVal = 100;
          } else if (newVal <= 0) {
            setPowerDirection(1);
            newVal = 0;
          }
          return newVal;
        });
      }, 16);
      return () => clearInterval(interval);
    }
  }, [phase, powerDirection, baseSpeed]);

  const calculateGrade = useCallback((angleVal: number, powerVal: number): ResultGrade => {
    const angleDiff = Math.abs(angleVal - sweetSpotCenter);
    const powerDiff = Math.abs(powerVal - sweetSpotCenter);

    const angleInPerfect = angleDiff <= sweetSpotSize / 2;
    const powerInPerfect = powerDiff <= sweetSpotSize / 2;
    const angleInGood = angleDiff <= goodZoneSize / 2;
    const powerInGood = powerDiff <= goodZoneSize / 2;

    if (angleInPerfect && powerInPerfect) return "perfect";
    if (angleInGood && powerInGood) return "good";
    return "miss";
  }, [sweetSpotCenter, sweetSpotSize, goodZoneSize]);

  const handleClick = useCallback(() => {
    if (phase === "ready") {
      setPhase("aiming");
      setDirection(1);
    } else if (phase === "aiming") {
      setLockedAngle(angle);
      setPhase("powering");
      setPowerDirection(1);
    } else if (phase === "powering") {
      setLockedPower(power);
      setPhase("shooting");

      const grade = calculateGrade(angle, power);
      setResultGrade(grade);

      if (grade === "miss") {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }

      setTimeout(() => setPhase("result"), 800);
    }
  }, [phase, angle, power, calculateGrade]);

  const handleFinish = () => {
    switch (resultGrade) {
      case "perfect":
        onResult(true, { wealth: 20, sanity: 10, billiardsSkill: 8 });
        break;
      case "good":
        onResult(true, { wealth: 10, sanity: 5, billiardsSkill: 3 });
        break;
      default:
        onResult(false, { wealth: -10, sanity: -8 });
    }
  };

  const getZoneStyle = (size: number) => ({
    left: `${sweetSpotCenter - size / 2}%`,
    width: `${size}%`,
  });

  const getMeterClass = (value: number, isLocked: boolean) => {
    if (!isLocked && phase === "ready") return "danger";
    const diff = Math.abs(value - sweetSpotCenter);
    if (diff <= sweetSpotSize / 2) return "success";
    if (diff <= goodZoneSize / 2) return "warning";
    return "danger";
  };

  const getAngleDeviation = () => {
    const diff = lockedAngle - sweetSpotCenter;
    if (Math.abs(diff) <= sweetSpotSize / 2) return null;
    return diff > 0 ? "偏右" : "偏左";
  };

  const getPowerDeviation = () => {
    const diff = lockedPower - sweetSpotCenter;
    if (Math.abs(diff) <= sweetSpotSize / 2) return null;
    return diff > 0 ? "力度过大" : "力度不足";
  };

  return (
    <div className={`minigame-container p-6 relative z-10 ${shake ? "animate-shake" : ""}`}>
      <h3 className="minigame-title text-3xl text-center mb-6 tracking-widest">
        🎱 一杆清台
      </h3>
      <p className="text-center text-sm text-foreground/60 mb-4">
        {phase === "ready" && "点击开始瞄准黑8"}
        {phase === "aiming" && "点击锁定角度！"}
        {phase === "powering" && "点击锁定力度！"}
        {phase === "shooting" && "出杆中..."}
        {phase === "result" && (
          resultGrade === "perfect" ? "🎯 完美！黑8入袋！" :
          resultGrade === "good" ? "👍 不错！擦边入袋！" :
          "😔 可惜，球没进..."
        )}
      </p>

      <div className="pool-table relative h-56 mb-6">
        <div className="pool-pocket top-1 left-1" />
        <div className="pool-pocket top-1 right-1" />
        <div className="pool-pocket top-1 left-1/2 -translate-x-1/2" />
        <div className="pool-pocket bottom-1 left-1" />
        <div className="pool-pocket bottom-1 right-1" />
        <div className="pool-pocket bottom-1 left-1/2 -translate-x-1/2" />

        <div className={`absolute top-6 right-8 w-7 h-7 rounded-full bg-black border-2 border-white shadow-lg transition-all duration-500 ${
          phase === "result" && resultGrade !== "miss" ? "scale-0 opacity-0" : ""
        }`}>
          <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">8</span>
        </div>

        <div className="absolute bottom-1/2 left-1/4 w-6 h-6 rounded-full bg-gradient-to-br from-white to-gray-200 shadow-lg" />

        {phase !== "result" && phase !== "ready" && (
          <div
            className="absolute bottom-1/2 left-1/4 h-1 bg-gradient-to-r from-yellow-400 to-yellow-200 origin-left shadow-md"
            style={{
              width: phase === "powering" || phase === "shooting" ? `${20 + (phase === "shooting" ? lockedPower : power) * 0.8}px` : "80px",
              transform: `rotate(${-45 + (phase === "aiming" ? angle : lockedAngle) * 0.9}deg)`,
              opacity: phase === "powering" ? 0.7 : 1,
            }}
          />
        )}

        {phase === "result" && resultGrade !== "miss" && (
          <div className="absolute top-6 right-8 text-2xl animate-bounce">✨</div>
        )}
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-xs text-foreground/60 mb-1">
            <span>角度</span>
            <span className="flex items-center gap-2">
              {phase !== "aiming" && phase !== "ready" && getAngleDeviation() && (
                <span className="text-red-400 text-xs">{getAngleDeviation()}</span>
              )}
              {phase === "aiming" ? "移动中..." : `${Math.round(lockedAngle)}°`}
            </span>
          </div>
          <div className="meter-bar relative">
            <div className="absolute h-full bg-green-500/20 rounded-full" style={getZoneStyle(goodZoneSize)} />
            <div className="absolute h-full bg-green-500/40 rounded-full animate-pulse" style={getZoneStyle(sweetSpotSize)} />
            <div
              className={`meter-fill ${getMeterClass(phase === "aiming" ? angle : lockedAngle, phase !== "aiming")}`}
              style={{ width: `${phase === "aiming" ? angle : lockedAngle}%` }}
            />
            {phase === "aiming" && (
              <div
                className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg transition-none"
                style={{ left: `${angle}%`, transform: "translateX(-50%)" }}
              />
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-foreground/60 mb-1">
            <span>力度</span>
            <span className="flex items-center gap-2">
              {phase === "result" && getPowerDeviation() && (
                <span className="text-red-400 text-xs">{getPowerDeviation()}</span>
              )}
              {phase === "powering" ? "移动中..." : phase === "aiming" || phase === "ready" ? "待锁定" : `${Math.round(lockedPower)}%`}
            </span>
          </div>
          <div className="meter-bar relative">
            <div className="absolute h-full bg-green-500/20 rounded-full" style={getZoneStyle(goodZoneSize)} />
            <div className="absolute h-full bg-green-500/40 rounded-full animate-pulse" style={getZoneStyle(sweetSpotSize)} />
            <div
              className={`meter-fill ${phase !== "ready" && phase !== "aiming" ? getMeterClass(lockedPower, true) : "danger"}`}
              style={{ width: `${phase === "powering" ? power : phase === "shooting" || phase === "result" ? lockedPower : 0}%` }}
            />
            {phase === "powering" && (
              <div
                className="absolute top-0 h-full w-1 bg-white rounded-full shadow-lg transition-none"
                style={{ left: `${power}%`, transform: "translateX(-50%)" }}
              />
            )}
          </div>
        </div>
      </div>

      {phase !== "result" ? (
        <button
          onClick={handleClick}
          disabled={phase === "shooting"}
          className="btn-barca w-full py-4 text-white font-bold text-lg tracking-wide disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
        >
          {phase === "ready" && "开始挑战"}
          {phase === "aiming" && "锁定角度"}
          {phase === "powering" && "击球！"}
          {phase === "shooting" && "..."}
        </button>
      ) : (
        <button
          onClick={handleFinish}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
            resultGrade === "perfect"
              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg shadow-yellow-500/30"
              : resultGrade === "good"
              ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
          } text-white`}
        >
          {resultGrade === "perfect" && "🏆 收取 ¥600 奖金"}
          {resultGrade === "good" && "收取 ¥300 奖金"}
          {resultGrade === "miss" && "认栽 -¥300"}
        </button>
      )}
    </div>
  );
}
