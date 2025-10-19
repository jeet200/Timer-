"use client";

import { useState, useEffect } from "react";

type TimerMode = "focus" | "short-break" | "long-break";

type DailyTask = {
  id: string;
  name: string;
  targetMinutes: number;
  completedMinutes: number;
};

const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  focus: 25 * 60,
  "short-break": 5 * 60,
  "long-break": 15 * 60,
};

const DEFAULT_TASKS: DailyTask[] = [
  { id: "learning", name: "Learning", targetMinutes: 240, completedMinutes: 0 },
  {
    id: "coding",
    name: "Python Coding / DSA",
    targetMinutes: 180,
    completedMinutes: 0,
  },
  { id: "aptitude", name: "Aptitude", targetMinutes: 60, completedMinutes: 0 },
];

export default function PomodoroTimer() {
  const [durations, setDurations] =
    useState<Record<TimerMode, number>>(DEFAULT_DURATIONS);
  const [showSettings, setShowSettings] = useState(false);
  const [tempDurations, setTempDurations] =
    useState<Record<TimerMode, number>>(DEFAULT_DURATIONS);

  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(durations.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(DEFAULT_TASKS);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("learning");

  useEffect(() => {
    setTimeLeft(durations[mode]);
  }, [durations, mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            setDailyTasks((prevTasks) =>
              prevTasks.map((task) =>
                task.id === selectedTaskId
                  ? {
                      ...task,
                      completedMinutes:
                        task.completedMinutes +
                        Math.floor(durations[mode] / 60),
                    }
                  : task
              )
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, durations, mode, selectedTaskId]);

  const handleModeChange = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(durations[newMode]);
    setIsRunning(false);
    setIsComplete(false);
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsComplete(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setTimeLeft(durations[mode]);
    setIsRunning(false);
    setIsComplete(false);
  };

  const handleSaveDurations = () => {
    setDurations(tempDurations);
    setShowSettings(false);
    setTimeLeft(tempDurations[mode]);
    setIsRunning(false);
    setIsComplete(false);
  };

  const handleResetDurations = () => {
    setTempDurations(DEFAULT_DURATIONS);
  };

  const handleDurationChange = (m: TimerMode, value: string) => {
    const minutes = Number.parseInt(value) || 0;
    setTempDurations((prev) => ({
      ...prev,
      [m]: Math.max(1, minutes) * 60,
    }));
  };

  const handleResetDailyTasks = () => {
    setDailyTasks(DEFAULT_TASKS);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getModeLabel = (m: TimerMode) => {
    const labels: Record<TimerMode, string> = {
      focus: "Focus",
      "short-break": "Short Break",
      "long-break": "Long Break",
    };
    return labels[m];
  };

  const getModeColor = (m: TimerMode) => {
    const colors: Record<
      TimerMode,
      { bg: string; text: string; accent: string }
    > = {
      focus: {
        bg: "bg-gradient-to-br from-blue-600 to-blue-700",
        text: "text-blue-600",
        accent: "from-blue-400 to-blue-600",
      },
      "short-break": {
        bg: "bg-gradient-to-br from-emerald-600 to-emerald-700",
        text: "text-emerald-600",
        accent: "from-emerald-400 to-emerald-600",
      },
      "long-break": {
        bg: "bg-gradient-to-br from-purple-600 to-purple-700",
        text: "text-purple-600",
        accent: "from-purple-400 to-purple-600",
      },
    };
    return colors[m];
  };

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Time dilation
          </h1>
          <div className="h-1 w-24 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Timer Section */}
          <div className="lg:col-span-2">
            <div className="flex gap-4 mb-12 justify-center flex-wrap">
              {(["focus", "short-break", "long-break"] as TimerMode[]).map(
                (m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
                      mode === m
                        ? `${
                            getModeColor(m).bg
                          } text-white shadow-2xl scale-105`
                        : "bg-white/10 text-white/60 hover:text-white/80 hover:bg-white/20 backdrop-blur-sm border border-white/20"
                    }`}
                  >
                    {getModeLabel(m)}
                  </button>
                )
              )}
            </div>

            <div className="mb-12">
              {/* Progress indicator */}
              <div className="mb-8 flex justify-center">
                <div className="relative w-80 h-80 rounded-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
                  {/* Progress ring */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    <circle
                      cx="160"
                      cy="160"
                      r="150"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="160"
                      cy="160"
                      r="150"
                      fill="none"
                      stroke={
                        mode === "focus"
                          ? "#3b82f6"
                          : mode === "short-break"
                          ? "#10b981"
                          : "#a855f7"
                      }
                      strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 150}`}
                      strokeDashoffset={`${
                        2 * Math.PI * 150 * (1 - progress / 100)
                      }`}
                      strokeLinecap="round"
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                  </svg>

                  {/* Timer text */}
                  <div className="text-center z-10">
                    <div className="text-8xl font-black font-mono tracking-tighter mb-2 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                      {formatTime(timeLeft)}
                    </div>
                    <div
                      className={`text-lg font-bold uppercase tracking-widest ${
                        getModeColor(mode).text
                      }`}
                    >
                      {getModeLabel(mode)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isComplete && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 border border-emerald-500/50 backdrop-blur-sm">
                <p className="text-emerald-300 text-center font-bold text-lg">
                  Time's up! Great work!
                </p>
              </div>
            )}

            <div className="flex gap-4 mb-8 justify-center flex-wrap">
              <button
                onClick={handleStart}
                disabled={isRunning}
                className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-white/20 disabled:to-white/20 disabled:cursor-not-allowed transition-all duration-200 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Start
              </button>
              <button
                onClick={handlePause}
                disabled={!isRunning}
                className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 disabled:from-white/20 disabled:to-white/20 disabled:cursor-not-allowed transition-all duration-200 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                Pause
              </button>
              <button
                onClick={handleReset}
                className="px-8 py-4 rounded-full font-bold text-white bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 transition-all duration-200 text-sm uppercase tracking-wider shadow-lg hover:shadow-xl"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Daily Tasks Section */}
          <div className="lg:col-span-1">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl h-full">
              <h2 className="text-white font-bold mb-6 text-center text-lg uppercase tracking-wider">
                Daily Goals
              </h2>
              <div className="space-y-4 mb-6">
                {dailyTasks.map((task) => {
                  const progressPercent = Math.min(
                    (task.completedMinutes / task.targetMinutes) * 100,
                    100
                  );
                  const isSelected = selectedTaskId === task.id;

                  return (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTaskId(task.id)}
                      className={`w-full p-4 rounded-lg transition-all duration-200 text-left ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50"
                          : "bg-white/5 border border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-sm uppercase tracking-wider">
                          {task.name}
                        </span>
                        <span className="text-xs text-white/60">
                          {task.completedMinutes}/{task.targetMinutes}m
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-white/50 mt-2">
                        {formatMinutes(task.completedMinutes)} completed
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={handleResetDailyTasks}
                className="w-full px-4 py-2 rounded-lg font-semibold text-sm text-white/80 bg-white/10 hover:bg-white/20 transition-all duration-200 uppercase tracking-wider border border-white/20"
              >
                Reset Tasks
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setTempDurations(durations);
            }}
            className="px-6 py-2 rounded-full font-semibold text-sm text-white/70 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200 uppercase tracking-wider"
          >
            {showSettings ? "Hide" : "Settings"}
          </button>
        </div>

        {showSettings && (
          <div className="mb-8 p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-2xl">
            <h3 className="text-white font-bold mb-6 text-center text-lg uppercase tracking-wider">
              Customize Times
            </h3>
            <div className="space-y-4 mb-6">
              {(["focus", "short-break", "long-break"] as TimerMode[]).map(
                (m) => (
                  <div
                    key={m}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <label className="text-white/80 font-semibold uppercase tracking-wider text-sm">
                      {getModeLabel(m)}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={Math.floor(tempDurations[m] / 60)}
                        onChange={(e) =>
                          handleDurationChange(m, e.target.value)
                        }
                        className="w-20 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      <span className="text-white/60 font-semibold">min</span>
                    </div>
                  </div>
                )
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSaveDurations}
                className="flex-1 px-4 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 transition-all duration-200 uppercase tracking-wider text-sm"
              >
                Save
              </button>
              <button
                onClick={handleResetDurations}
                className="flex-1 px-4 py-3 rounded-lg font-bold text-white/80 bg-white/10 hover:bg-white/20 transition-all duration-200 uppercase tracking-wider text-sm border border-white/20"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-white/50 text-xs uppercase tracking-widest font-semibold">
          {isRunning ? "Session Active" : "Ready"}
        </div>
      </div>
    </div>
  );
}
