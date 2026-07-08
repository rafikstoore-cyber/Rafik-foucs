import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  ListTree,
  Timer,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Trophy,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Clock3,
  Sparkles,
  X,
} from "lucide-react";

const STORAGE_KEY = "rafik-focus-state-v1";

const PRIORITY = {
  high: { label: "عالية", weight: 3, xp: 15, color: "#E5484D" },
  medium: { label: "متوسطة", weight: 2, xp: 10, color: "#D4AF37" },
  low: { label: "منخفضة", weight: 1, xp: 5, color: "#5B82F0" },
};

const QUOTES = [
  "الخطوة الصغيرة اليوم هي المسافة الكبيرة بكرا.",
  "التاجر الناجح كيبدا بخطة، وكيكمل بالانضباط.",
  "ماشي لازم تكون كامل، لازم تكون مستمر.",
  "كل مهمة كتديها اليوم كتقربك من متجرك الحقيقي.",
  "الثقة، الجودة، السرعة… وأنت لي غادي تبنيها خطوة بخطوة.",
  "النسر ما كيطيرش عالي دفعة وحدة، كيبدا بجناح واحد.",
  "التسويق كيبدا بمحتوى واحد صادق، ماشي بألف فكرة.",
  "اليوم لي كتخدم فيه هو اليوم لي غادي تشكر راسك عليه من بعد.",
];const defaultState = {
  phases: initialPhases,
  xp: 65,
  history: [],
  lastActiveDate: null,
  streak: 1,
  focusMinutesToday: 0,
  todayDate: null,
  quoteIndex: 0,
};

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function loadState() {
  return new Promise((resolve) => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        resolve({ ...defaultState, ...JSON.parse(raw) });
      } else {
        resolve(defaultState);
      }
    } catch (e) {
      resolve(defaultState);
    }
  });
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* ignore */
  }
}

function EagleMark({ size = 22, color = "#D4AF37" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path
        d="M24 6 C24 6 20 14 8 18 C14 20 19 20 22 19 C20 24 14 27 6 30 C16 32 24 29 24 29 C24 29 32 32 42 30 C34 27 28 24 26 19 C29 20 34 20 40 18 C28 14 24 6 24 6 Z"
        fill={color}
      />
      <path d="M24 29 L24 42" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function EaglePath({ phases }) {
  const completedCount = phases.filter((p) => p.tasks.every((t) => t.done)).length;
  return (
    <div className="eagle-path">
      {phases.map((p, i) => {
        const isDone = p.tasks.every((t) => t.done);
        const isCurrent = !isDone && i === completedCount;
        return (
          <div className="eagle-node-wrap" key={p.id}>
            <div className={`eagle-node ${isDone ? "done" : ""} ${isCurrent ? "current" : ""}`}>
              {isDone ? <Check size={14} strokeWidth={3} /> : isCurrent ? <EagleMark size={16} color="#0B1220" /> : <span>{i + 1}</span>}
            </div>
            <div className="eagle-node-label">{p.name}</div>
            {i < phases.length - 1 && <div className={`eagle-connector ${isDone ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
    }export default function App() {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [toast, setToast] = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    loadState().then((s) => {
      const today = todayStr();
      let next = { ...s };
      if (s.todayDate !== today) {
        const wasYesterday = (() => {
          if (!s.todayDate) return false;
          const prev = new Date(s.todayDate);
          const diffDays = Math.round((new Date(today) - prev) / 86400000);
          return diffDays === 1;
        })();
        next.streak = wasYesterday ? (s.streak || 1) + 1 : 1;
        next.todayDate = today;
        next.focusMinutesToday = 0;
        next.quoteIndex = Math.floor(Math.random() * QUOTES.length);
      }
      setState(next);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveState(state), 400);
    return () => clearTimeout(saveTimer.current);
  }, [state, loaded]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const level = Math.floor(state.xp / 100) + 1;
  const xpIntoLevel = state.xp % 100;
  const levelLabel = level <= 2 ? "مبتدئ" : level <= 5 ? "متقدم" : "محترف";

  const allTasks = useMemo(() => state.phases.flatMap((p) => p.tasks.map((t) => ({ ...t, phaseId: p.id, phaseName: p.name }))), [state.phases]);
  const totalTasks = allTasks.length;
  const doneTasks = allTasks.filter((t) => t.done).length;
  const overallProgress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const todaysTasks = useMemo(() => {
    const incomplete = allTasks.filter((t) => !t.done);
    return incomplete.sort((a, b) => PRIORITY[b.priority].weight - PRIORITY[a.priority].weight).slice(0, 4);
  }, [allTasks]);

  function toggleTask(phaseId, taskId) {
    setState((prev) => {
      const phases = prev.phases.map((p) => {
        if (p.id !== phaseId) return p;
        return {
          ...p,
          tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)),
        };
      });
      const task = prev.phases.find((p) => p.id === phaseId).tasks.find((t) => t.id === taskId);
      const willBeDone = !task.done;
      const xpDelta = willBeDone ? PRIORITY[task.priority].xp : -PRIORITY[task.priority].xp;
      const today = todayStr();
      const history = [...prev.history];
      const idx = history.findIndex((h) => h.date === today);
      const tasksCompletedDelta = willBeDone ? 1 : -1;
      if (idx >= 0) {
        history[idx] = { ...history[idx], tasksCompleted: Math.max(0, history[idx].tasksCompleted + tasksCompletedDelta) };
      } else if (willBeDone) {
        history.push({ date: today, tasksCompleted: 1, focusMinutes: 0 });
      }
      if (willBeDone) showToast(`+${PRIORITY[task.priority].xp} XP · مهمة أنجزت 🎉`);
      return { ...prev, phases, xp: Math.max(0, prev.xp + xpDelta), history };
    });
      }return (
    <div className="app-root" dir="rtl">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@500;700;800;900&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

        :root {
          --bg: #0B1220;
          --surface: #131B2E;
          --surface-2: #1B2540;
          --border: #26314D;
          --blue: #2F5FDB;
          --blue-light: #5B82F0;
          --gold: #D4AF37;
          --gold-soft: #E8C766;
          --text: #F2F4F8;
          --muted: #8A93A6;
          --success: #34C77B;
          --danger: #E5484D;
        }
        * { box-sizing: border-box; }
        .app-root {
          background: radial-gradient(1200px 600px at 50% -10%, #16213B 0%, var(--bg) 55%);
          min-height: 100vh;
          color: var(--text);
          font-family: 'IBM Plex Sans Arabic', 'Tajawal', sans-serif;
          padding-bottom: 84px;
          position: relative;
        }
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .display { font-family: 'Tajawal', sans-serif; font-weight: 800; }

        .header {
          padding: 22px 18px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .brand { display: flex; align-items: center; gap: 10px; }
        .brand-title { font-size: 19px; letter-spacing: 0.2px; }
        .brand-sub { font-size: 11px; color: var(--muted); margin-top: 1px; }
        .streak-pill {
          display: flex; align-items: center; gap: 5px;
          background: linear-gradient(135deg, rgba(212,175,55,0.18), rgba(212,175,55,0.06));
          border: 1px solid rgba(212,175,55,0.35);
          padding: 6px 11px; border-radius: 999px; font-size: 13px; font-weight: 700;
          color: var(--gold-soft);
        }

        .container { padding: 0 16px; max-width: 720px; margin: 0 auto; }

        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 18px;
          margin-b.quote-banner {
          background: linear-gradient(120deg, rgba(47,95,219,0.22), rgba(212,175,55,0.12));
          border: 1px solid rgba(91,130,240,0.35);
          border-radius: 16px; padding: 14px 16px; margin-bottom: 16px;
          font-size: 14px; font-weight: 600; display: flex; gap: 10px; align-items: flex-start;
        }

        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
        .stat-box {
          background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
          padding: 12px 8px; text-align: center;
        }
        .stat-value { font-size: 20px; font-weight: 700; }
        .stat-label { font-size: 11px; color: var(--muted); margin-top: 2px; }

        .level-row { d.phase-header {
          display: flex; align-items: center; justify-content: space-between; cursor: pointer;
          padding: 4px 0;
        }
        .phase-title-row { display: flex; align-items: center; gap: 10px; }
        .phase-progress-mini { font-size: 11px; color: var(--muted); }
        .phase-bar { height: 5px; background: var(--surface-2); border-radius: 999px; margin-top: 8px; overflow: hidden; }
        .phase-bar-fill { height: 100%; background: var(--blue); border-radius: 999px; }

        .bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0; background: rgba(19,27,46,0.92);
          backdrop-filter: blur(10px); border-top: 1px solid var(--border);
          display: flex; justify-content: space-around; padding: 8px 6px 10px; z-index: 20;
        }
        .nav-item {
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          color: var(--muted); font-size: 10.5px; font-weight: 600; background: none; border: none;
          padding: 6px 14px; border-radius: 12px; cursor: pointer; transition: all 0.15s ease;
        }
        .nav-item.active { color: var(--gold-soft); background: rgba(212,175,55,0.1); }

        .timer-circle {
          width: 220px; height: 220px; border-radius: 50%; margin: 8px auto 18px;
          display: flex; align-items: center; justify-content: center; position: relative;
          background: conic-gradient(var(--blue) calc(var(--pct) * 1%), var(--surface-2) 0);
        }
        .timer-inner {
          width: 188px; height: 188px; border-radius: 50%; background: var(--surface);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .timer-digits { font-size: 40px; font-weight: 700; }
        .timer-mode { font-size: 12px; color: var(--muted); margin-top: 4px; }
        .timer-controls { display: flex; gap: 12px; justify-content: center; }
        .btn-circle {
          width: 52px; height: 52px; border-radius: 50%; border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-primary { background: var(--blue); color: #fff; }
        .btn-ghost { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }

        .toast {
          position: fixed; top: 18px; left: 50%; transform: translateX(-50%);
          background: var(--surface-2); border: 1px solid var(--gold); color: var(--text);
          padding: 10px 18px; border-radius: 999px; font-size: 13px; font-weight: 700;
          z-index: 50; box-shadow: 0 8px 24px rgba(0,0,0,0.35);
        }

        .empty-note { color: var(--muted); font-size: 13px; text-align: center; padding: 18px 0; }
      `}</style>

      <div className="header">
        <div className="brand">
          <EagleMark size={30} />
          <div>
            <div className="brand-title display">RAFIK FOCUS</div>
            <div className="brand-sub">تنظيم الوقت لـ RAFIK STOORE</div>
          </div>
        </div>
        <div className="streak-pill">
          <Flame size={14} />
          {state.streak} يوم متتالي
        </div>
      </div><div className="container">
        {tab === "dashboard" && (
          <Dashboard
            state={state}
            level={level}
            xpIntoLevel={xpIntoLevel}
            levelLabel={levelLabel}
            overallProgress={overallProgress}
            doneTasks={doneTasks}
            totalTasks={totalTasks}
            todaysTasks={todaysTasks}
            toggleTask={toggleTask}
          />
        )}

        {tab === "plan" && (
          <PlanView
            phases={state.phases}
            expandedPhase={expandedPhase}
            setExpandedPhase={setExpandedPhase}
            toggleTask={toggleTask}
          />
        )}

        {tab === "focus" && (
          <FocusView
            onSessionComplete={(minutes) => {
              setState((prev) => {
                const today = todayStr();
                const history = [...prev.history];
                const idx = history.findIndex((h) => h.date === today);
                if (idx >= 0) history[idx] = { ...history[idx], focusMinutes: history[idx].focusMinutes + minutes };
                else history.push({ date: today, tasksCompleted: 0, focusMinutes: minutes });
                showToast(`أحسنت! ${minutes} دقيقة تركيز مسجلة`);
                return { ...prev, focusMinutesToday: prev.focusMinutesToday + minutes, history };
              });
            }}
            focusMinutesToday={state.focusMinutesToday}
          />
        )}

        {tab === "reports" && <ReportsView history={state.history} />}
      </div>

      {toast && <div className="toast">{toast}</div>}

      <div className="bottom-nav">
        <button className={`nav-item ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>
          <LayoutDashboard size={20} />
          لوحة التحكم
        </button>
        <button className={`nav-item ${tab === "plan" ? "active" : ""}`} onClick={() => setTab("plan")}>
          <ListTree size={20} />
          خطة العمل
        </button>
        <button className={`nav-item ${tab === "focus" ? "active" : ""}`} onClick={() => setTab("focus")}>
          <Timer size={20} />
          التركيز
        </button>
        <button className={`nav-item ${tab === "reports" ? "active" : ""}`} onClick={() => setTab("reports")}>
          <BarChart3 size={20} />
          التقارير
        </button>
      </div>
    </div>
  );
                                   }
