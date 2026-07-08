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
];
