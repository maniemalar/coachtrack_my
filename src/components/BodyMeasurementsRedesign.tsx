import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Download, Dumbbell, Pencil } from 'lucide-react';
import { TraineeProfile } from '../types';

interface BodyLog {
  date: string;
  weight: number;
  height: number;
  bmi: number;
  bmr: number;
  bodyFat: number;
  waist: number;
  chest: number;
  hip: number;
  arm: number;
  thigh: number;
  notes: string;
}

interface BodyMeasurementsRedesignProps {
  selectedTrainee: TraineeProfile;
  bodyLogs: Record<string, BodyLog[]>;
  setBodyLogs: React.Dispatch<React.SetStateAction<Record<string, BodyLog[]>>>;
  handleDownloadBodyCSV: () => void;
  triggerToast: (msg: string, type: 'success' | 'error') => void;
  traineeAge: number;
  isTraineeMale: boolean;
}

/**
 * Professional fitness composition mannequin system.
 * Incorporates front-facing athletic male mannequin with clean volumetric shading, subtle muscle definition,
 * simple dark shorts, and dynamic scaling based on real body metrics.
 */
function BodyScannerMannequin({ latestLog, isMale, showCallouts }: { latestLog: any; isMale: boolean; showCallouts?: boolean }) {
  const chest = latestLog.chest || 104;
  const waist = latestLog.waist || 94;
  const hip = latestLog.hip || 108;
  const arm = latestLog.arm || 38;
  const thigh = latestLog.thigh || 62;

  // Proportional metrics offsets
  const chestOffset = Math.max(-8, Math.min(8, (chest - 104) * 0.28));
  const waistOffset = Math.max(-8, Math.min(8, (waist - 94) * 0.32));
  const hipOffset = Math.max(-8, Math.min(8, (hip - 108) * 0.28));
  const armOffset = Math.max(-5, Math.min(5, (arm - 38) * 0.38));
  const thighOffset = Math.max(-6, Math.min(6, (thigh - 62) * 0.3));

  // Node placements
  const leftShoulderX = 46 - chestOffset * 0.2;
  const rightShoulderX = 114 + chestOffset * 0.2;
  const leftArmpitX = 59 - chestOffset * 0.1;
  const rightArmpitX = 101 + chestOffset * 0.1;
  const leftWaistX = 63 - waistOffset * 0.4;
  const rightWaistX = 97 + waistOffset * 0.4;
  const leftHipX = 59 - hipOffset * 0.4;
  const rightHipX = 101 + hipOffset * 0.4;
  const leftArmX = 35 - armOffset;
  const rightArmX = 125 + armOffset;
  const leftThighOffset = thighOffset * 0.4;
  const rightThighOffset = thighOffset * 0.4;

  return (
    <div className={`relative border border-slate-100 rounded-[24px] bg-[#F8FAFC]/40 p-4 shadow-3xs flex flex-col items-center justify-center overflow-hidden w-full transition-all duration-300 ${showCallouts ? 'min-h-[290px]' : 'min-h-[200px]'}`}>
      {/* Centered medical grade grid stage */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06] select-none">
        <div className="absolute top-1/2 left-0 right-0 h-[0.5px] bg-slate-400" />
        <div className="absolute left-1/2 top-0 bottom-0 w-[0.5px] bg-slate-400" />
      </div>

      {/* Dynamic 3D Mannequin Svg Stage */}
      <svg viewBox="0 0 160 260" className={`w-full overflow-visible drop-shadow-[0_4px_12px_rgba(100,116,139,0.06)] relative z-10 transition-all duration-300 ${showCallouts ? 'h-72' : 'h-44'}`}>
        <defs>
          {/* Aesthetic Volumetric Grey shading representing professional assessment avatars */}
          <linearGradient id="mannequin3DGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="75%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="leftArmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          <linearGradient id="rightArmGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>

          {/* Slate compression garment / athletic shorts */}
          <linearGradient id="shortsGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* ----------------------------------------------------------------- */}
        {/* 1. HEAD & NECK */}
        {/* ----------------------------------------------------------------- */}
        <ellipse cx="80" cy="24" rx="9.5" ry="11" fill="url(#mannequin3DGrad)" stroke="#94A3B8" strokeWidth="0.5" />
        <path d="M 75,34 L 75,45 Q 80,47 85,45 L 85,34 Z" fill="url(#mannequin3DGrad)" stroke="#CBD5E1" strokeWidth="0.5" />

        {/* ----------------------------------------------------------------- */}
        {/* 2. CHEST, ABDOMEN & TORSO POSE */}
        {/* ----------------------------------------------------------------- */}
        <path 
          d={`
            M 74,45 
            C 65,45 52,48 ${leftShoulderX},48 
            C 42,55 45,72 ${leftArmpitX},74 
            C 60,90 61,105 ${leftWaistX},115 
            C 64,125 61,135 ${leftHipX},148 
            C 65,152 75,160 80,162 
            C 85,160 95,152 ${rightHipX},148 
            C 99,135 96,125 ${rightWaistX},115 
            C 99,105 100,90 ${rightArmpitX},74 
            C 115,72 118,55 ${rightShoulderX},48 
            C 108,48 95,45 86,45 
            Z
          `}
          fill="url(#mannequin3DGrad)"
          stroke="#94A3B8"
          strokeWidth="0.75"
          strokeLinejoin="round"
        />

        {/* ----------------------------------------------------------------- */}
        {/* 3. ARMS & HANDS */}
        {/* ----------------------------------------------------------------- */}
        {/* Left Arm */}
        <path 
          d={`
            M ${leftShoulderX}, 48 
            C ${leftArmX}, 55 ${leftArmX}, 75 ${leftArmX}, 95 
            C ${leftArmX}, 110 ${leftArmX + 1}, 125 ${leftArmX + 1}, 155 
            C ${leftArmX + 1}, 158 ${leftArmX + 5}, 158 ${leftArmX + 6}, 155 
            C ${leftArmX + 8}, 125 ${leftArmX + 10}, 110 ${leftArmX + 11}, 95 
            C ${leftArmX + 12}, 85 ${leftArmX + 17}, 76 ${leftArmpitX}, 74 
            C ${leftArmX + 9}, 60 ${leftArmX + 7}, 54 ${leftShoulderX}, 48 
            Z
          `}
          fill="url(#leftArmGrad)"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />
        {/* Left Hand */}
        <path 
          d={`
            M ${leftArmX + 1}, 155 
            C ${leftArmX}, 160 ${leftArmX + 2}, 166 ${leftArmX + 4}, 167 
            C ${leftArmX + 6}, 166 ${leftArmX + 7}, 160 ${leftArmX + 6}, 155 
            Z
          `} 
          fill="url(#leftArmGrad)" 
          stroke="#94A3B8" 
          strokeWidth="0.5" 
        />

        {/* Right Arm */}
        <path 
          d={`
            M ${rightShoulderX}, 48 
            C ${rightArmX}, 55 ${rightArmX}, 75 ${rightArmX}, 95 
            C ${rightArmX}, 110 ${rightArmX - 1}, 125 ${rightArmX - 1}, 155 
            C ${rightArmX - 1}, 158 ${rightArmX - 5}, 158 ${rightArmX - 6}, 155 
            C ${rightArmX - 8}, 125 ${rightArmX - 10}, 110 ${rightArmX - 11}, 95 
            C ${rightArmX - 12}, 85 ${rightArmX - 17}, 76 ${rightArmpitX}, 74 
            C ${rightArmX - 9}, 60 ${rightArmX - 7}, 54 ${rightShoulderX}, 48 
            Z
          `}
          fill="url(#rightArmGrad)"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />
        {/* Right Hand */}
        <path 
          d={`
            M ${rightArmX - 1}, 155 
            C ${rightArmX}, 160 ${rightArmX - 2}, 166 ${rightArmX - 4}, 167 
            C ${rightArmX - 6}, 166 ${rightArmX - 7}, 160 ${rightArmX - 6}, 155 
            Z
          `} 
          fill="url(#rightArmGrad)" 
          stroke="#94A3B8" 
          strokeWidth="0.5" 
        />

        {/* ----------------------------------------------------------------- */}
        {/* 4. LEGS, KNEES & CALVES */}
        {/* ----------------------------------------------------------------- */}
        {/* Left Leg */}
        <path 
          d={`
            M ${leftHipX}, 148 
            C ${54 - leftThighOffset}, 160 ${55 - leftThighOffset}, 185 63, 202 
            C 64, 215 60, 222 60, 228 
            C 60, 235 64, 245 66, 248 
            L 70, 248 
            C 71, 245 74, 235 74, 228 
            C 74, 222 71, 215 71, 202 
            C 73, 185 75, 172 80, 162 
            Z
          `}
          fill="url(#mannequin3DGrad)"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />
        {/* Left Foot */}
        <path d="M 66, 248 L 63, 255 L 71, 255 L 70, 248 Z" fill="url(#mannequin3DGrad)" stroke="#94A3B8" strokeWidth="0.5" />

        {/* Right Leg */}
        <path 
          d={`
            M ${rightHipX}, 148 
            C ${106 + rightThighOffset}, 160 ${105 + rightThighOffset}, 185 97, 202 
            C 96, 215 100, 222 100, 228 
            C 100, 235 96, 245 94, 248 
            L 90, 248 
            C 89, 245 86, 235 86, 228 
            C 86, 222 89, 215 89, 202 
            C 87, 185 85, 172 80, 162 
            Z
          `}
          fill="url(#mannequin3DGrad)"
          stroke="#94A3B8"
          strokeWidth="0.5"
        />
        {/* Right Foot */}
        <path d="M 94, 248 L 97, 255 L 89, 255 L 90, 248 Z" fill="url(#mannequin3DGrad)" stroke="#94A3B8" strokeWidth="0.5" />

        {/* ----------------------------------------------------------------- */}
        {/* 5. OVERLAID CLOTHING: SIMPLE DARK ATHLETIC SHORTS */}
        {/* ----------------------------------------------------------------- */}
        <path 
          d={`
            M ${leftWaistX + 1}, 122 
            L ${rightWaistX - 1}, 122 
            C ${rightWaistX + 2}, 135 ${rightHipX + 1}, 148 ${rightHipX + 1}, 150 
            L 99, 175 
            L 85, 175 
            L 80, 156 
            L 75, 175 
            L 61, 175 
            C 60, 150 ${leftHipX - 1}, 148 ${leftHipX - 1}, 150 
            C ${leftWaistX - 2}, 135 ${leftWaistX - 1}, 122 ${leftWaistX + 1}, 122 
            Z
          `}
          fill="url(#shortsGrad)"
          stroke="#1E293B"
          strokeWidth="0.5"
        />
        {/* Waistband highlight ring */}
        <line x1={leftWaistX + 1} y1="125" x2={rightWaistX - 1} y2="125" stroke="#475569" strokeWidth="1.2" strokeOpacity="0.8" />

        {/* ----------------------------------------------------------------- */}
        {/* 6. SUBTLE MUSCLE DEFINITION OVERLAYS */}
        {/* ----------------------------------------------------------------- */}
        <g stroke="#64748B" strokeWidth="0.5" strokeOpacity="0.32" fill="none">
          {/* Clavicles */}
          <path d="M 80,48 C 74,48 64,46 51,48" />
          <path d="M 80,48 C 86,48 96,46 109,48" />

          {/* Pectorals */}
          <path d={`M 80,68 C 76,68 64,66 ${leftArmpitX},68 C 52,77 59,82 80,82`} />
          <path d={`M 80,68 C 84,68 96,66 ${rightArmpitX},68 C 108,77 101,82 80,82`} />

          {/* Abdominals definition */}
          <line x1="80" y1="82" x2="80" y2="145" strokeDasharray="1,1" />
          <path d="M 68,93 C 74,94 77,94 80,93 C 83,94 86,94 92,93" />
          <path d="M 66,105 C 73,106 77,106 80,105 C 83,106 87,106 94,105" />
          <path d="M 65,117 C 72,118 77,118 80,117 C 83,118 88,118 95,117" />
          <circle cx="80" cy="120" r="1" fill="#475569" stroke="none" />

          {/* Obliques */}
          <path d="M 62,132 C 67,138 73,143 78,145" />
          <path d="M 98,132 C 93,138 87,143 82,145" />

          {/* Thigh teardrop curves (Vastus) */}
          <path d={`M ${61 - leftThighOffset * 0.2}, 176 Q 62, 188 66, 196`} />
          <path d="M 74, 176 Q 73, 188 68, 196" />
          <path d={`M ${99 + rightThighOffset * 0.2}, 176 Q 98, 188 94, 196`} />
          <path d="M 86, 176 Q 87, 188 92, 196" />

          {/* Kneecaps (Patellae) */}
          <path d="M 65, 199 L 69, 199 L 68, 204 L 66, 204 Z" />
          <path d="M 95, 199 L 91, 199 L 92, 204 L 94, 204 Z" />

          {/* Calf details */}
          <path d="M 63, 218 Q 65, 222 66, 244" />
          <path d="M 97, 218 Q 95, 222 94, 244" />
        </g>

        {/* ----------------------------------------------------------------- */}
        {/* 7. MEDICAL ASSESSMENT LABELS & LEADER LINES */}
        {/* ----------------------------------------------------------------- */}
        {showCallouts && (
          <g className="pointer-events-none select-none">
            {/* Chest Annotation (Left Side Margin) */}
            <line x1="6" y1="66" x2={leftArmpitX - 2} y2="66" stroke="#14B8A6" strokeWidth="0.75" />
            <circle cx={leftArmpitX - 2} cy="66" r="2" fill="#14B8A6" />
            <text x="6" y="56" textAnchor="start" className="text-[8px] font-extrabold fill-[#082567] font-sans tracking-wider uppercase opacity-85">
              Chest
            </text>
            <text x="6" y="78" textAnchor="start" className="text-[12px] font-black fill-[#14B8A6] font-mono leading-none">
              {chest} cm
            </text>

            {/* Arm Annotation (Right Side Margin) */}
            <line x1="154" y1="90" x2={rightArmX - 4} y2="90" stroke="#F97316" strokeWidth="0.75" />
            <circle cx={rightArmX - 4} cy="90" r="2" fill="#F97316" />
            <text x="154" y="80" textAnchor="end" className="text-[8px] font-extrabold fill-[#082567] font-sans tracking-wider uppercase opacity-85">
              Arm
            </text>
            <text x="154" y="102" textAnchor="end" className="text-[12px] font-black fill-[#F97316] font-mono leading-none">
              {arm} cm
            </text>

            {/* Waist Annotation (Left Side Margin) */}
            <line x1="6" y1="114" x2={leftWaistX - 1} y2="114" stroke="#3B82F6" strokeWidth="0.75" />
            <circle cx={leftWaistX - 1} cy="114" r="2" fill="#3B82F6" />
            <text x="6" y="104" textAnchor="start" className="text-[8px] font-extrabold fill-[#082567] font-sans tracking-wider uppercase opacity-85">
              Waist
            </text>
            <text x="6" y="126" textAnchor="start" className="text-[12px] font-black fill-[#3B82F6] font-mono leading-none">
              {waist} cm
            </text>

            {/* Hip Annotation (Right Side Margin) */}
            <line x1="154" y1="146" x2={rightHipX + 2} y2="146" stroke="#8B5CF6" strokeWidth="0.75" />
            <circle cx={rightHipX + 2} cy="146" r="2" fill="#8B5CF6" />
            <text x="154" y="136" textAnchor="end" className="text-[8px] font-extrabold fill-[#082567] font-sans tracking-wider uppercase opacity-85">
              Hip
            </text>
            <text x="154" y="158" textAnchor="end" className="text-[12px] font-black fill-[#8B5CF6] font-mono leading-none">
              {hip} cm
            </text>

            {/* Thigh Annotation (Left Side Margin) */}
            <line x1="6" y1="184" x2={63 - leftThighOffset} y2="184" stroke="#082567" strokeWidth="0.75" />
            <circle cx={63 - leftThighOffset} cy="184" r="2" fill="#082567" />
            <text x="6" y="174" textAnchor="start" className="text-[8px] font-extrabold fill-[#082567] font-sans tracking-wider uppercase opacity-85">
              Thigh
            </text>
            <text x="6" y="196" textAnchor="start" className="text-[12px] font-black fill-[#082567] font-mono leading-none">
              {thigh} cm
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default function BodyMeasurementsRedesign({
  selectedTrainee,
  bodyLogs,
  setBodyLogs,
  handleDownloadBodyCSV,
  triggerToast,
  traineeAge,
  isTraineeMale
}: BodyMeasurementsRedesignProps) {
  const [bodySubPage, setBodySubPage] = useState<'main' | 'weight' | 'girth'>('main');
  const [editingWeightLogDate, setEditingWeightLogDate] = useState<string | null>(null);
  const [editingGirthLogDate, setEditingGirthLogDate] = useState<string | null>(null);
  const [hoveredGirthIdx, setHoveredGirthIdx] = useState<number | null>(null);

  // Auto-reset subpage when active client changes
  useEffect(() => {
    setBodySubPage('main');
    setEditingWeightLogDate(null);
    setEditingGirthLogDate(null);
    setHoveredGirthIdx(null);
  }, [selectedTrainee.id]);

  const currentLogs = bodyLogs[selectedTrainee.id] || [];
  
  // Default latest values fallback
  const latestLog = currentLogs[currentLogs.length - 1] || {
    date: new Date().toISOString().substring(0, 10),
    weight: selectedTrainee.weight || 84,
    height: selectedTrainee.height || 176,
    waist: 94,
    chest: 104,
    hip: 108,
    arm: 38,
    thigh: 62,
    bmi: 27.1,
    bmr: 1805,
    bodyFat: 21.8,
    notes: "No logs logged yet."
  };

  const prevLog = currentLogs.length > 1 ? currentLogs[currentLogs.length - 2] : null;

  // Weight Trend Differences
  const weightDiffRawMain = prevLog ? (latestLog.weight - prevLog.weight) : -2.5;

  const handleSaveWeightOnly = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const wt = parseFloat(fd.get('weight') as string);
    const dtStr = fd.get('date') as string || new Date().toISOString().substring(0, 10);
    
    if (isNaN(wt)) return;

    const list = [...currentLogs];
    const existingIdx = list.findIndex(l => l.date === dtStr);

    const ht = selectedTrainee.height || 176;
    const age = selectedTrainee.age || 28;
    const male = isTraineeMale;

    const calculatedBMI = wt / ((ht / 100) * (ht / 100));
    const calculatedBMR = 10 * wt + 6.25 * ht - 5 * age + (male ? 5 : -161);

    if (existingIdx > -1) {
      // Update existing record
      const ext = list[existingIdx];
      let calculatedFat = 0;
      if (male) {
        calculatedFat = (ext.waist * 0.574) + (ext.thigh * 0.2) + (ext.chest * 0.1) - (ht * 0.1) - 10;
      } else {
        calculatedFat = (ext.waist * 0.52) + (ext.hip * 0.25) - (ht * 0.08) - 5;
      }
      calculatedFat = Math.max(5, Math.min(45, calculatedFat));

      list[existingIdx] = {
        ...ext,
        weight: wt,
        bmi: Math.round(calculatedBMI * 10) / 10,
        bmr: Math.round(calculatedBMR),
        bodyFat: Math.round(calculatedFat * 10) / 10,
      };
    } else {
      // Create new record
      const base = list[list.length - 1] || { waist: 94, chest: 104, hip: 108, arm: 38, thigh: 62 };
      let calculatedFat = 0;
      if (male) {
        calculatedFat = (base.waist * 0.574) + (base.thigh * 0.2) + (base.chest * 0.1) - (ht * 0.1) - 10;
      } else {
        calculatedFat = (base.waist * 0.52) + (base.hip * 0.25) - (ht * 0.08) - 5;
      }
      calculatedFat = Math.max(5, Math.min(45, calculatedFat));

      list.push({
        date: dtStr,
        weight: wt,
        height: ht,
        bmi: Math.round(calculatedBMI * 10) / 10,
        bmr: Math.round(calculatedBMR),
        bodyFat: Math.round(calculatedFat * 10) / 10,
        waist: base.waist,
        chest: base.chest,
        hip: base.hip,
        arm: base.arm,
        thigh: base.thigh,
        notes: "Weight logged."
      });
    }

    list.sort((a, b) => a.date.localeCompare(b.date));

    setBodyLogs(prev => ({
      ...prev,
      [selectedTrainee.id]: list
    }));

    setEditingWeightLogDate(null);
    form.reset();
    triggerToast(`Weight saved successfully! ✓`, "success");
  };

  const handleSaveGirthOnly = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const dtStr = fd.get('date') as string || new Date().toISOString().substring(0, 10);
    const wst = parseFloat(fd.get('waist') as string);
    const chst = parseFloat(fd.get('chest') as string);
    const hp = parseFloat(fd.get('hip') as string);
    const am = parseFloat(fd.get('arm') as string);
    const th = parseFloat(fd.get('thigh') as string);

    if (isNaN(wst) || isNaN(chst) || isNaN(hp) || isNaN(am) || isNaN(th)) {
      triggerToast("Please fill all measurement fields.", "error");
      return;
    }

    const list = [...currentLogs];
    const existingIdx = list.findIndex(l => l.date === dtStr);

    const ht = selectedTrainee.height || 176;
    const age = selectedTrainee.age || 28;
    const male = isTraineeMale;

    let calculatedFat = 0;
    if (male) {
      calculatedFat = (wst * 0.574) + (th * 0.2) + (chst * 0.1) - (ht * 0.1) - 10;
    } else {
      calculatedFat = (wst * 0.52) + (hp * 0.25) - (ht * 0.08) - 5;
    }
    calculatedFat = Math.max(5, Math.min(45, calculatedFat));

    if (existingIdx > -1) {
      const ext = list[existingIdx];
      const wt = ext.weight;
      const calculatedBMI = wt / ((ht / 100) * (ht / 100));
      const calculatedBMR = 10 * wt + 6.25 * ht - 5 * age + (male ? 5 : -161);

      list[existingIdx] = {
        ...ext,
        waist: wst,
        chest: chst,
        hip: hp,
        arm: am,
        thigh: th,
        bodyFat: Math.round(calculatedFat * 10) / 10,
        bmi: Math.round(calculatedBMI * 10) / 10,
        bmr: Math.round(calculatedBMR)
      };
    } else {
      const base = list[list.length - 1] || { weight: selectedTrainee.weight || 84 };
      const wt = base.weight;
      const calculatedBMI = wt / ((ht / 100) * (ht / 100));
      const calculatedBMR = 10 * wt + 6.25 * ht - 5 * age + (male ? 5 : -161);

      list.push({
        date: dtStr,
        weight: wt,
        height: ht,
        bmi: Math.round(calculatedBMI * 10) / 10,
        bmr: Math.round(calculatedBMR),
        bodyFat: Math.round(calculatedFat * 10) / 10,
        waist: wst,
        chest: chst,
        hip: hp,
        arm: am,
        thigh: th,
        notes: "Girth measurements logged."
      });
    }

    list.sort((a, b) => a.date.localeCompare(b.date));

    setBodyLogs(prev => ({
      ...prev,
      [selectedTrainee.id]: list
    }));

    setEditingGirthLogDate(null);
    form.reset();
    triggerToast(`Girth measurements saved successfully! ✓`, "success");
  };

  return (
    <div className="space-y-6">
      {bodySubPage === 'main' && (() => {
        const lastUpdatedStr = latestLog.date ? new Date(latestLog.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '22 Jun 2026';
        
        return (
          <div className="space-y-6">
            {/* BODY COMPOSITION OVERVIEW */}
            <div className="bg-white border border-slate-200/85 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <h3 className="text-[20px] font-bold text-[#082567] mb-4 select-none">
                Body Composition Overview
              </h3>
              
              <div className="grid grid-cols-2 gap-4 select-none">
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-left">
                  <span className="text-[13px] text-slate-500 font-medium block">Weight</span>
                  <span className="text-[28px] font-bold text-slate-900 block mt-1">
                    {latestLog.weight} <span className="text-xs font-medium text-slate-500 font-sans">kg</span>
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1.5 font-medium">Updated: {lastUpdatedStr}</span>
                </div>
                
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-left">
                  <span className="text-[13px] text-slate-500 font-medium block">Height</span>
                  <span className="text-[28px] font-bold text-slate-900 block mt-1">
                    {selectedTrainee.height || 176} <span className="text-xs font-medium text-slate-500 font-sans">cm</span>
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1.5 font-medium">Updated: {lastUpdatedStr}</span>
                </div>
                
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-left">
                  <span className="text-[13px] text-slate-500 font-medium block">BMI</span>
                  <span className="text-[28px] font-bold text-[#082567] block mt-1">
                    {latestLog.bmi ? latestLog.bmi.toFixed(1) : (latestLog.weight / (((selectedTrainee.height || 176)/100)*((selectedTrainee.height || 176)/100))).toFixed(1)}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1.5 font-medium">Updated: {lastUpdatedStr}</span>
                </div>
                
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 text-left font-sans">
                  <span className="text-[13px] text-slate-500 font-medium block">BMR</span>
                  <span className="text-[28px] font-bold text-teal-600 block mt-1">
                    {latestLog.bmr ? latestLog.bmr : Math.round(10 * latestLog.weight + 6.25 * (selectedTrainee.height || 176) - 5 * traineeAge + (isTraineeMale ? 5 : -161))}
                    <span className="text-3xs text-slate-400 font-semibold block font-sans">kcal / day</span>
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-1.5 font-medium">Updated: {lastUpdatedStr}</span>
                </div>
              </div>
            </div>

            {/* BODY TRACKING CENTER */}
            <div className="space-y-4">
              <h3 className="text-[20px] font-bold text-[#082567] mb-2 select-none">
                Body Tracking Center
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* CARD 1: WEIGHT TRACKING */}
                <div 
                  onClick={() => setBodySubPage('weight')}
                  className="bg-white border border-slate-200/85 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:border-[#18D2C3]/30 hover:shadow-xs transition-all duration-200 cursor-pointer text-left select-none"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[15px] font-bold text-[#082567] block font-sans tracking-wide">WEIGHT TRACKING</span>
                      <span className="text-[13px] text-slate-500 font-medium block mt-1">
                        Current Weight: <span className="font-bold text-slate-900 text-base">{latestLog.weight} kg</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#082567]/5 text-[#082567] font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-sans whitespace-nowrap">
                        UPDATED {latestLog.date ? new Date(latestLog.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : '21 JUN 2026'}
                      </span>
                      <span className="bg-teal-50 text-teal-600 font-bold text-[10px] px-2.5 py-1 rounded-full border border-teal-100 uppercase tracking-wider font-sans whitespace-nowrap">
                        ON TRACK
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-2">
                    <span className="text-[13px] font-semibold text-[#18D2C3] shrink-0 bg-[#18D2C3]/5 px-2.5 py-1.5 rounded-xl border border-teal-500/5">
                      {weightDiffRawMain < 0 
                        ? `↓ ${Math.abs(weightDiffRawMain).toFixed(1)}kg since last check-in` 
                        : weightDiffRawMain > 0 
                          ? `↑ ${weightDiffRawMain.toFixed(1)}kg since last check-in` 
                          : "Steady weight trend"
                      }
                    </span>
                    
                    <div className="w-24 h-10 shrink-0 overflow-visible relative">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path 
                          d={weightDiffRawMain >= 0 ? "M 0,25 L 25,20 L 50,22 L 75,10 L 100,5" : "M 0,5 L 25,12 L 50,15 L 75,22 L 100,25"} 
                          fill="none" 
                          stroke="#18D2C3" 
                          strokeWidth="2.5" 
                          strokeLinecap="round" 
                        />
                        <circle cx="100" cy={weightDiffRawMain >= 0 ? "5" : "25"} r="3" fill="#18D2C3" stroke="#FFF" strokeWidth="1" />
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-[13px] font-medium text-indigo-600 mt-4 flex items-center gap-1 font-sans">
                    <span>Tap to view detailed weight analytics.</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </div>

                {/* CARD 2: GIRTH MEASUREMENTS */}
                <div 
                  onClick={() => setBodySubPage('girth')}
                  className="bg-white border border-slate-200/85 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:border-[#18D2C3]/30 hover:shadow-xs transition-all duration-200 cursor-pointer text-left select-none"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[15px] font-bold text-[#082567] block font-sans tracking-wide">GIRTH MEASUREMENTS</span>
                      <span className="text-[13px] text-slate-500 font-semibold block mt-1">
                        5 Areas Tracked
                      </span>
                    </div>
                    <span className="bg-[#082567]/5 text-[#082567] font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-sans">
                      UPDATED {latestLog.date ? new Date(latestLog.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() : '21 JUN 2026'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-2">
                    <div className="space-y-1 font-sans text-[13px] text-slate-600 font-medium">
                      <p>Chest: <span className="font-bold text-slate-800">{latestLog.chest}cm</span></p>
                      <p>Waist: <span className="font-bold text-slate-800">{latestLog.waist}cm</span></p>
                    </div>
                    
                    <div className="w-10 h-10 shrink-0 text-[#18D2C3] border border-teal-500/10 rounded-xl bg-[#18D2C3]/5 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-teal-600" />
                    </div>
                  </div>

                  <p className="text-[13px] font-medium text-indigo-600 mt-4 flex items-center gap-1 font-sans">
                    <span>Tap to view circumference analytics.</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* WEIGHT TRACKING DETAIL PAGE */}
      {bodySubPage === 'weight' && (() => {
        const weightDiffTextDetail = weightDiffRawMain < 0 
          ? `↓ ${Math.abs(weightDiffRawMain).toFixed(1)}kg from previous week` 
          : weightDiffRawMain > 0 
            ? `↑ ${weightDiffRawMain.toFixed(1)}kg from previous week` 
            : "Stable from previous week";
        
        const goalW = 75;
        const chartWeights = currentLogs.map(l => l.weight);
        const minChartW = Math.min(...chartWeights, goalW) - 3;
        const maxChartW = Math.max(...chartWeights, 85) + 3;
        const rangeW = maxChartW - minChartW || 10;

        const svgWidth = 320;
        const svgHeight = 155;
        const padLeft = 40;
        const padRight = 10;
        const padTop = 15;
        const padBottom = 25;

        const getSvgX = (index: number, total: number) => {
          if (total <= 1) return padLeft + (svgWidth - padLeft - padRight) / 2;
          return padLeft + index * (svgWidth - padLeft - padRight) / (total - 1);
        };

        const getSvgY = (val: number) => {
          return svgHeight - padBottom - ((val - minChartW) / rangeW) * (svgHeight - padTop - padBottom);
        };

        let pathD = "";
        let areaD = "";
        if (currentLogs.length > 0) {
          pathD = currentLogs.map((l, idx) => {
            const x = getSvgX(idx, currentLogs.length);
            const y = getSvgY(l.weight);
            return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
          }).join(" ");

          if (currentLogs.length > 1) {
            const startX = getSvgX(0, currentLogs.length);
            const endX = getSvgX(currentLogs.length - 1, currentLogs.length);
            const bottomY = svgHeight - padBottom;
            areaD = `${pathD} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
          }
        }

        const goalY = getSvgY(goalW);

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setBodySubPage('main')}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-800" />
              </button>
              <div className="text-left">
                <h2 className="text-[20px] font-bold text-[#082567]">Weight Tracking</h2>
                <span className="text-[13px] font-medium text-slate-500">Client: {selectedTrainee.name}</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200/85 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex items-center justify-between text-left">
              <div>
                <span className="text-[13px] font-medium text-slate-500 block">Current Weight</span>
                <strong className="text-[28px] font-bold text-slate-900 block mt-0.5">
                  {latestLog.weight} <span className="text-sm font-medium text-slate-500">kg</span>
                </strong>
                <span className="text-[13px] font-medium text-[#18D2C3] mt-1 block">
                  {weightDiffTextDetail}
                </span>
              </div>
              <span className="bg-teal-50 text-teal-600 font-bold text-[11px] px-3 py-1 rounded-full border border-teal-100 tracking-wider font-sans">
                ON TRACK
              </span>
            </div>

            <div className="bg-white border border-slate-200/85 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-left select-none">
              <h4 className="text-[15px] font-semibold text-slate-900 mb-1">Weekly Weight Trend</h4>
              <p className="text-[13px] text-slate-400 font-medium mb-4">Thermodynamic response & fat logs</p>

              <div className="w-full h-40 relative">
                <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                  <line x1={padLeft} y1={getSvgY(maxChartW)} x2={svgWidth - padRight} y2={getSvgY(maxChartW)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />
                  <line x1={padLeft} y1={getSvgY(minChartW)} x2={svgWidth - padRight} y2={getSvgY(minChartW)} stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3,3" />

                  <line x1={padLeft} y1={goalY} x2={svgWidth - padRight} y2={goalY} stroke="#F97316" strokeWidth="1.5" strokeDasharray="4,4" />
                  <text x={svgWidth - padRight - 5} y={goalY - 4} textAnchor="end" fill="#F97316" className="text-[9px] font-bold uppercase tracking-wider">
                    Goal: {goalW}kg
                  </text>

                  {areaD && (
                    <path d={areaD} fill="url(#weightGrad)" opacity="0.15" />
                  )}

                  {pathD && (
                    <path d={pathD} fill="none" stroke="#18D2C3" strokeWidth="3" strokeLinecap="round" />
                  )}

                  {currentLogs.map((l, idx) => {
                    const x = getSvgX(idx, currentLogs.length);
                    const y = getSvgY(l.weight);
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={y} r="5" fill="#18D2C3" stroke="#FFF" strokeWidth="1.5" />
                        <text x={x} y={y - 8} textAnchor="middle" fill="#082567" className="text-[9px] font-bold font-sans">
                          {l.weight}kg
                        </text>
                      </g>
                    );
                  })}

                  {currentLogs.map((l, idx) => {
                    const x = getSvgX(idx, currentLogs.length);
                    const dtLabel = new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    return (
                      <text key={idx} x={x} y={svgHeight - 6} textAnchor="middle" fill="#94A3B8" className="text-[9px] font-medium font-sans">
                        {dtLabel}
                      </text>
                    );
                  })}

                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#18D2C3" />
                      <stop offset="100%" stopColor="#18D2C3" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* CURRENT WEIGHT OVERVIEW */}
            <div className="bg-white border border-slate-200/85 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] select-none">
              <h4 className="text-[15px] font-bold text-[#082567] mb-4 text-left uppercase tracking-wider font-sans">Current Weight Overview</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                {/* 3D Model on Left */}
                <div className="flex flex-col items-center justify-center bg-[#F8FAFC]/50 border border-slate-100 rounded-2xl p-3">
                  <BodyScannerMannequin latestLog={latestLog} isMale={isTraineeMale} showCallouts={false} />
                  <div className="mt-2 text-center">
                    <span className="text-[13px] font-bold text-[#082567] block font-sans">{latestLog.weight} kg Profile</span>
                  </div>
                </div>

                {/* Insights grid on Right */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between min-h-[90px]">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">BMI</span>
                    <strong className="text-[24px] font-extrabold text-[#082567] block mt-1 leading-none">
                      {latestLog.bmi ? latestLog.bmi.toFixed(1) : "27.1"}
                    </strong>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between min-h-[90px]">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-sans">Trend</span>
                    <strong className="text-[13px] font-black text-[#18D2C3] block mt-2 uppercase tracking-wide truncate leading-tight font-sans">
                      Losing Weight
                    </strong>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between min-h-[90px] font-sans">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">BMR</span>
                    <strong className="text-[18px] font-extrabold text-[#082567] block mt-1 leading-none font-mono">
                      {latestLog.bmr || 1805}
                      <span className="text-[9px] font-medium text-slate-400 block mt-1 normal-case font-sans">kcal / day</span>
                    </strong>
                  </div>

                  <div className="bg-[#F8FAFC] border border-slate-100 rounded-xl p-3.5 flex flex-col justify-between min-h-[90px] font-sans">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Target</span>
                    <strong className="text-[20px] font-extrabold text-[#18D2C3] block mt-1 leading-none">
                      {goalW} <span className="text-xs font-semibold text-slate-400">kg</span>
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* RECORD NEW WEIGHT */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-[24px] p-5 text-left">
              <h4 className="text-[15px] font-semibold text-slate-900 mb-4">Record New Weight</h4>
              
              <form 
                key={selectedTrainee.id + "_" + (editingWeightLogDate || 'new')}
                onSubmit={handleSaveWeightOnly} 
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Weight (kg)</label>
                    <input 
                      type="number" 
                      name="weight" 
                      step="0.1" 
                      required 
                      defaultValue={editingWeightLogDate ? (currentLogs.find(l => l.date === editingWeightLogDate)?.weight || latestLog.weight) : latestLog.weight} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-800 shadow-3xs focus:outline-[#082567] font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Date</label>
                    <input 
                      type="date" 
                      name="date" 
                      required 
                      defaultValue={editingWeightLogDate || new Date().toISOString().substring(0, 10)} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-800 shadow-3xs focus:outline-[#082567] font-sans"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#082567] hover:bg-slate-900 text-white font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider transition-all duration-150 cursor-pointer text-center select-none font-sans"
                >
                  {editingWeightLogDate ? "Update Weight" : "Save Weight"}
                </button>
              </form>
            </div>

            {/* WEIGHT HISTORY */}
            <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-left">
              <h4 className="text-[15px] font-semibold text-slate-900 mb-4 font-sans">Weight History Logs</h4>
              
              <div className="divide-y divide-slate-100">
                {currentLogs.slice().reverse().map((log, idx) => {
                  const logIdx = currentLogs.indexOf(log);
                  const pLogComp = logIdx > 0 ? currentLogs[logIdx - 1] : null;
                  const logChange = pLogComp ? (log.weight - pLogComp.weight) : 0;
                  
                  return (
                    <div key={idx} className="flex justify-between items-center py-3">
                      <div className="text-left">
                        <span className="text-[13px] font-semibold text-slate-900 block font-sans">
                          {new Date(log.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5 font-medium">Check-in Assessment</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right font-sans">
                          <strong className="text-slate-800 font-bold block text-[13px]">{log.weight} kg</strong>
                          <span className={`text-[11px] font-medium block mt-0.5 ${logChange < 0 ? 'text-[#18D2C3] font-bold' : logChange > 0 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                            {logChange < 0 ? `-${Math.abs(logChange).toFixed(1)}kg` : logChange > 0 ? `+${logChange.toFixed(1)}kg` : "0.0kg"}
                          </span>
                        </div>
                        <button 
                          onClick={() => setEditingWeightLogDate(log.date)}
                          className="p-1.5 border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 rounded-lg cursor-pointer transition text-slate-600"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button 
              onClick={handleDownloadBodyCSV}
              className="w-full flex items-center justify-center gap-2 bg-[#18D2C3]/10 hover:bg-[#18D2C3]/20 text-[#082567] border border-[#18D2C3]/30 font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider transition-all cursor-pointer font-sans select-none"
            >
              <Download className="w-4 h-4 text-[#18D2C3]" />
              <span>DOWNLOAD WEIGHT HISTORY CSV</span>
            </button>
          </div>
        );
      })()}

      {/* GIRTH MEASUREMENTS DETAIL PAGE */}
      {bodySubPage === 'girth' && (() => {
        const lastUpdatedStr = latestLog.date ? new Date(latestLog.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '22 Jun 2026';
        
        const chestDiff = prevLog ? (latestLog.chest - prevLog.chest) : 1;
        const waistDiff = prevLog ? (latestLog.waist - prevLog.waist) : -2;
        const hipDiff = prevLog ? (latestLog.hip - prevLog.hip) : 0;
        const armDiff = prevLog ? (latestLog.arm - prevLog.arm) : 1;
        const thighDiff = prevLog ? (latestLog.thigh - prevLog.thigh) : 0;

        const formatGirthDiffText = (diff: number, isReductionImprovement: boolean) => {
          if (diff === 0) return { text: "0 cm", color: "text-slate-400" };
          const sign = diff > 0 ? "+" : "";
          const isImproved = isReductionImprovement ? diff < 0 : diff > 0;
          return {
            text: `${sign}${diff} cm`,
            color: isImproved ? "text-emerald-600 font-bold" : "text-slate-400 font-medium"
          };
        };

        const chestDiffObj = formatGirthDiffText(chestDiff, false);
        const waistDiffObj = formatGirthDiffText(waistDiff, true);
        const hipDiffObj = formatGirthDiffText(hipDiff, true);
        const armDiffObj = formatGirthDiffText(armDiff, false);
        const thighDiffObj = formatGirthDiffText(thighDiff, false);

        // Compute Y-Axis Range metrics
        const allGirthVals: number[] = [];
        currentLogs.forEach(l => {
          allGirthVals.push(l.chest, l.waist, l.hip, l.arm, l.thigh);
        });
        const minG = allGirthVals.length > 0 ? Math.max(15, Math.min(...allGirthVals) - 8) : 20;
        const maxG = allGirthVals.length > 0 ? Math.min(135, Math.max(...allGirthVals) + 8) : 120;
        const rangeG = maxG - minG || 100;

        // Visual Layout parameters for premium Fitness Dashboard Area
        const svgWidth = 385;
        const svgHeight = 185;
        const padLeft = 45;
        const padRight = 85; // Extra padding on right to lay out latest value beside curve
        const padTop = 15;
        const padBottom = 25;

        const getSvgX = (index: number, total: number) => {
          if (total <= 1) return padLeft + (svgWidth - padLeft - padRight) / 2;
          return padLeft + index * (svgWidth - padLeft - padRight) / (total - 1);
        };

        const getGirthY = (val: number) => {
          return svgHeight - padBottom - ((val - minG) / rangeG) * (svgHeight - padTop - padBottom);
        };

        // Smooth Cubic Bezier Curves for professional progression styling
        const getGirthBezierPath = (field: 'chest' | 'waist' | 'hip' | 'arm' | 'thigh') => {
          if (currentLogs.length === 0) return "";
          const p = currentLogs.map((l, idx) => {
            const x = getSvgX(idx, currentLogs.length);
            const y = getGirthY(l[field]);
            return [x, y] as [number, number];
          });
          
          if (p.length === 1) return `M ${p[0][0]} ${p[0][1]} L ${p[0][0] + 0.1} ${p[0][1]}`;
          
          let path = `M ${p[0][0]} ${p[0][1]}`;
          for (let i = 0; i < p.length - 1; i++) {
            const [x0, y0] = p[i];
            const [x1, y1] = p[i + 1];
            // Compute elegant control points to smooth out the transition curve
            const cpX1 = x0 + (x1 - x0) * 0.45;
            const cpY1 = y0;
            const cpX2 = x0 + (x1 - x0) * 0.55;
            const cpY2 = y1;
            path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${x1} ${y1}`;
          }
          return path;
        };

        const chestPath = getGirthBezierPath('chest');
        const waistPath = getGirthBezierPath('waist');
        const hipPath = getGirthBezierPath('hip');
        const armPath = getGirthBezierPath('arm');
        const thighPath = getGirthBezierPath('thigh');

        // Dynamic tick scale values calculation
        const tickCount = 4;
        const scaleTicks: number[] = [];
        for (let i = 0; i < tickCount; i++) {
          const rawVal = minG + (rangeG * i) / (tickCount - 1);
          scaleTicks.push(Math.round(rawVal));
        }

        // Mouse hover interactions helper
        const handleGirthMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
          if (currentLogs.length === 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          // Scale raw cursor coordinates to SVG viewport coordination
          const svgMouseX = (mouseX / rect.width) * svgWidth;

          let closestIdx = 0;
          let minDiff = Infinity;
          currentLogs.forEach((l, idx) => {
            const x = getSvgX(idx, currentLogs.length);
            const d = Math.abs(x - svgMouseX);
            if (d < minDiff) {
              minDiff = d;
              closestIdx = idx;
            }
          });

          if (svgMouseX >= padLeft - 10 && svgMouseX <= svgWidth - padRight + 12) {
            setHoveredGirthIdx(closestIdx);
          } else {
            setHoveredGirthIdx(null);
          }
        };

        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setBodySubPage('main')}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-800" />
              </button>
              <div className="text-left">
                <h2 className="text-[20px] font-bold text-[#082567] font-sans">Girth Measurements</h2>
                <span className="text-[13px] font-medium text-slate-500">Client: {selectedTrainee.name}</span>
              </div>
            </div>

            {/* MANNEQUIN DIAGRAM PANEL */}
            <div className="bg-white border border-slate-200/85 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-center select-none">
              <h4 className="text-[15px] font-bold text-[#082567] mb-4 text-left uppercase tracking-wider font-sans">Body Circumference Overview</h4>
              
              <div className="relative py-2 w-full max-w-[320px] mx-auto">
                <BodyScannerMannequin latestLog={latestLog} isMale={isTraineeMale} showCallouts={true} />
              </div>
            </div>

            {/* PREVIOUS WEEK STATS GRID */}
            <div className="bg-white border border-slate-200/85 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-left">
              <h4 className="text-[15px] font-semibold text-slate-900 mb-4 font-sans">Current vs Previous Week</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 select-none">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 font-sans">
                  <span className="text-[13px] text-slate-400 font-medium block">Chest</span>
                  <strong className="text-[18px] font-bold text-slate-800 block mt-0.5">{latestLog.chest} cm</strong>
                  <span className={`text-[11px] block mt-1 ${chestDiffObj.color}`}>{chestDiffObj.text}</span>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 font-sans">
                  <span className="text-[13px] text-slate-400 font-medium block">Waist</span>
                  <strong className="text-[18px] font-bold text-slate-800 block mt-0.5">{latestLog.waist} cm</strong>
                  <span className={`text-[11px] block mt-1 ${waistDiffObj.color}`}>{waistDiffObj.text}</span>
                </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 font-sans">
                  <span className="text-[13px] text-slate-400 font-medium block">Hip</span>
                  <strong className="text-[18px] font-bold text-slate-800 block mt-0.5">{latestLog.hip} cm</strong>
                  <span className={`text-[11px] block mt-1 ${hipDiffObj.color}`}>{hipDiffObj.text}</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 font-sans">
                  <span className="text-[13px] text-slate-400 font-medium block">Arm</span>
                  <strong className="text-[18px] font-bold text-slate-800 block mt-0.5">{latestLog.arm} cm</strong>
                  <span className={`text-[11px] block mt-1 ${armDiffObj.color}`}>{armDiffObj.text}</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 col-span-2 md:col-span-1 font-sans">
                  <span className="text-[13px] text-slate-400 font-medium block">Thigh</span>
                  <strong className="text-[18px] font-bold text-slate-800 block mt-0.5">{latestLog.thigh} cm</strong>
                  <span className={`text-[11px] block mt-1 ${thighDiffObj.color}`}>{thighDiffObj.text}</span>
                </div>
              </div>
            </div>

            {/* ENHANCED PREMIUM GIRTH ANLYTICS CHART */}
            <div className="bg-white border border-slate-200/85 rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] text-left select-none relative">
              <h4 className="text-[15px] font-semibold text-slate-900 mb-1 font-sans">Girth Trend Over Time</h4>
              <p className="text-[13px] text-slate-400 font-medium mb-3">Body measurement progression over time</p>

              {/* Legend design at Top */}
              <div className="flex flex-wrap gap-x-3 gap-y-1.5 mb-4 text-[10px] font-bold uppercase transition select-none tracking-wider">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#18D2C3]" /> Chest</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" /> Waist</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" /> Hip</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" /> Arm</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#082567]" /> Thigh</span>
              </div>

              {/* Interactive Vector Stage */}
              <div 
                className="w-full h-44 relative"
                onMouseLeave={() => setHoveredGirthIdx(null)}
              >
                {/* Custom Floating Info Tooltip */}
                {hoveredGirthIdx !== null && currentLogs[hoveredGirthIdx] && (() => {
                  const logObj = currentLogs[hoveredGirthIdx];
                  const formattedDVal = new Date(logObj.date).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
                  const hoverPositionX = getSvgX(hoveredGirthIdx, currentLogs.length);
                  const isLeftPart = hoverPositionX < svgWidth / 2;
                  
                  return (
                    <div 
                      style={{
                        position: 'absolute',
                        top: '10px',
                        [isLeftPart ? 'right' : 'left']: '16px',
                        zIndex: 40
                      }}
                      className="bg-[#082567]/95 border border-[#18D2C3]/30 text-white rounded-xl p-3 shadow-xl backdrop-blur-md text-3xs font-sans min-w-[135px] text-left leading-normal space-y-1 select-none pointer-events-none"
                    >
                      <p className="text-[9.5px] uppercase tracking-wider font-extrabold text-[#18D2C3] border-b border-white/10 pb-1 mb-1 font-mono">
                        {formattedDVal}
                      </p>
                      <div className="flex justify-between gap-3 text-[10.5px]">
                        <span className="text-white/70">Chest:</span>
                        <strong className="text-[#18D2C3]">{logObj.chest} cm</strong>
                      </div>
                      <div className="flex justify-between gap-3 text-[10.5px]">
                        <span className="text-white/70">Waist:</span>
                        <strong className="text-[#3B82F6]">{logObj.waist} cm</strong>
                      </div>
                      <div className="flex justify-between gap-3 text-[10.5px]">
                        <span className="text-white/70">Hip:</span>
                        <strong className="text-[#8B5CF6]">{logObj.hip} cm</strong>
                      </div>
                      <div className="flex justify-between gap-3 text-[10.5px]">
                        <span className="text-white/70">Arm:</span>
                        <strong className="text-[#F97316]">{logObj.arm} cm</strong>
                      </div>
                      <div className="flex justify-between gap-3 text-[10.5px]">
                        <span className="text-white/70">Thigh:</span>
                        <strong className="text-white">{logObj.thigh} cm</strong>
                      </div>
                    </div>
                  );
                })()}

                <svg 
                  className="w-full h-full overflow-visible" 
                  viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
                  preserveAspectRatio="none"
                  onMouseMove={handleGirthMouseMove}
                >
                  {/* Y-Axis Horizontal Scale Gridlines and Labels */}
                  {scaleTicks.map((tickVal, tIdx) => {
                    const yCoord = getGirthY(tickVal);
                    return (
                      <g key={tIdx} className="opacity-90">
                        {/* Light grey background grids */}
                        <line 
                          x1={padLeft} 
                          y1={yCoord} 
                          x2={svgWidth - padRight} 
                          y2={yCoord} 
                          stroke="#F1F5F9" 
                          strokeWidth="1.2" 
                          strokeDasharray={tIdx === 0 || tIdx === scaleTicks.length - 1 ? "" : "3,3"}
                        />
                        {/* Centimeter labels on left */}
                        <text 
                          x={padLeft - 8} 
                          y={yCoord + 3} 
                          textAnchor="end" 
                          fill="#64748B" 
                          className="text-[9px] font-semibold font-mono"
                        >
                          {tickVal} cm
                        </text>
                      </g>
                    );
                  })}

                  {/* 1. Curve Paths (Smooth curved lines) */}
                  {chestPath && <path d={chestPath} fill="none" stroke="#18D2C3" strokeWidth="2.5" strokeLinecap="round" />}
                  {waistPath && <path d={waistPath} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />}
                  {hipPath && <path d={hipPath} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />}
                  {armPath && <path d={armPath} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />}
                  {thighPath && <path d={thighPath} fill="none" stroke="#082567" strokeWidth="2.5" strokeLinecap="round" />}

                  {/* 2. Interactive Guide Lines and Dots highlight */}
                  {hoveredGirthIdx !== null && (
                    <g className="pointer-events-none">
                      {/* Vertical line indicator */}
                      <line 
                        x1={getSvgX(hoveredGirthIdx, currentLogs.length)}
                        y1={padTop}
                        x2={getSvgX(hoveredGirthIdx, currentLogs.length)}
                        y2={svgHeight - padBottom}
                        stroke="#94A3B8"
                        strokeWidth="1.2"
                        strokeDasharray="2,2"
                      />
                      {/* Pulse rings around hovered metric nodes */}
                      {['chest', 'waist', 'hip', 'arm', 'thigh'].map((f) => {
                        const cl = currentLogs[hoveredGirthIdx];
                        const x = getSvgX(hoveredGirthIdx, currentLogs.length);
                        const y = getGirthY(cl[f as any]);
                        const colMap: any = { chest: '#18D2C3', waist: '#3B82F6', hip: '#8B5CF6', arm: '#F97316', thigh: '#082567' };
                        return (
                          <g key={f}>
                            <circle cx={x} cy={y} r="7" fill={colMap[f]} opacity="0.22" />
                            <circle cx={x} cy={y} r="3.5" fill={colMap[f]} stroke="#FFF" strokeWidth="1" />
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* 3. Static Circle Data Points for all dates */}
                  {hoveredGirthIdx === null && currentLogs.map((l, idx) => {
                    const x = getSvgX(idx, currentLogs.length);
                    return (
                      <g key={idx}>
                        <circle cx={x} cy={getGirthY(l.chest)} r="3.5" fill="#18D2C3" stroke="#FFF" strokeWidth="1" />
                        <circle cx={x} cy={getGirthY(l.waist)} r="3.5" fill="#3B82F6" stroke="#FFF" strokeWidth="1" />
                        <circle cx={x} cy={getGirthY(l.hip)} r="3.5" fill="#8B5CF6" stroke="#FFF" strokeWidth="1" />
                        <circle cx={x} cy={getGirthY(l.arm)} r="3.5" fill="#F97316" stroke="#FFF" strokeWidth="1" />
                        <circle cx={x} cy={getGirthY(l.thigh)} r="3.5" fill="#082567" stroke="#FFF" strokeWidth="1" />
                      </g>
                    );
                  })}

                  {/* X-axis Date Labels */}
                  {currentLogs.map((l, idx) => {
                    const x = getSvgX(idx, currentLogs.length);
                    const dtLabel = new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
                    return (
                      <text key={idx} x={x} y={svgHeight - 6} textAnchor="middle" fill="#94A3B8" className="text-[9.2px] font-bold font-sans">
                        {dtLabel}
                      </text>
                    );
                  })}

                  {/* 4. Display the latest measurement value beside the newest data point for each metric */}
                  <g className="font-sans font-black select-none">
                    {/* Chest Label */}
                    <text 
                      x={svgWidth - padRight + 12} 
                      y={getGirthY(latestLog.chest) + 3} 
                      textAnchor="start" 
                      fill="#18D2C3" 
                      className="text-[10px] font-extrabold focus:outline-none"
                    >
                      Chest {latestLog.chest}cm
                    </text>
                    <line x1={svgWidth - padRight} y1={getGirthY(latestLog.chest)} x2={svgWidth - padRight + 8} y2={getGirthY(latestLog.chest)} stroke="#18D2C3" strokeWidth="0.8" strokeDasharray="1,1" />

                    {/* Waist Label */}
                    <text 
                      x={svgWidth - padRight + 12} 
                      y={getGirthY(latestLog.waist) + 3} 
                      textAnchor="start" 
                      fill="#3B82F6" 
                      className="text-[10px] font-extrabold focus:outline-none"
                    >
                      Waist {latestLog.waist}cm
                    </text>
                    <line x1={svgWidth - padRight} y1={getGirthY(latestLog.waist)} x2={svgWidth - padRight + 8} y2={getGirthY(latestLog.waist)} stroke="#3B82F6" strokeWidth="0.8" strokeDasharray="1,1" />

                    {/* Hip Label */}
                    <text 
                      x={svgWidth - padRight + 12} 
                      y={getGirthY(latestLog.hip) + 3} 
                      textAnchor="start" 
                      fill="#8B5CF6" 
                      className="text-[10px] font-extrabold focus:outline-none"
                    >
                      Hip {latestLog.hip}cm
                    </text>
                    <line x1={svgWidth - padRight} y1={getGirthY(latestLog.hip)} x2={svgWidth - padRight + 8} y2={getGirthY(latestLog.hip)} stroke="#8B5CF6" strokeWidth="0.8" strokeDasharray="1,1" />

                    {/* Arm Label */}
                    <text 
                      x={svgWidth - padRight + 12} 
                      y={getGirthY(latestLog.arm) + 3} 
                      textAnchor="start" 
                      fill="#F97316" 
                      className="text-[10px] font-extrabold focus:outline-none"
                    >
                      Arm {latestLog.arm}cm
                    </text>
                    <line x1={svgWidth - padRight} y1={getGirthY(latestLog.arm)} x2={svgWidth - padRight + 8} y2={getGirthY(latestLog.arm)} stroke="#F97316" strokeWidth="0.8" strokeDasharray="1,1" />

                    {/* Thigh Label */}
                    <text 
                      x={svgWidth - padRight + 12} 
                      y={getGirthY(latestLog.thigh) + 3} 
                      textAnchor="start" 
                      fill="#082567" 
                      className="text-[10px] font-extrabold focus:outline-none"
                    >
                      Thigh {latestLog.thigh}cm
                    </text>
                    <line x1={svgWidth - padRight} y1={getGirthY(latestLog.thigh)} x2={svgWidth - padRight + 8} y2={getGirthY(latestLog.thigh)} stroke="#082567" strokeWidth="0.8" strokeDasharray="1,1" />
                  </g>
                </svg>
              </div>
            </div>

            {/* RECORD NEW GIRTH MEASUREMENT */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-[24px] p-5 text-left">
              <h4 className="text-[15px] font-semibold text-slate-900 mb-4 font-sans">RECORD NEW GIRTH MEASUREMENT</h4>
              
              <form 
                key={selectedTrainee.id + "_" + (editingGirthLogDate || 'new')}
                onSubmit={handleSaveGirthOnly} 
                className="space-y-4"
              >
                <div>
                  <label className="block text-[13px] font-medium text-slate-500 mb-1.5">Measurement Date</label>
                  <input 
                    type="date" 
                    name="date" 
                    required 
                    defaultValue={editingGirthLogDate || new Date().toISOString().substring(0, 10)} 
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-800 shadow-3xs focus:outline-[#082567] font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[13px] font-medium text-slate-500 mb-1">Chest (cm)</label>
                    <input 
                      type="number" 
                      name="chest" 
                      required 
                      defaultValue={editingGirthLogDate ? (currentLogs.find(l => l.date === editingGirthLogDate)?.chest || latestLog.chest) : latestLog.chest} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-800 shadow-3xs focus:outline-[#082567] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-slate-500 mb-1">Waist (cm)</label>
                    <input 
                      type="number" 
                      name="waist" 
                      required 
                      defaultValue={editingGirthLogDate ? (currentLogs.find(l => l.date === editingGirthLogDate)?.waist || latestLog.waist) : latestLog.waist} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-800 shadow-3xs focus:outline-[#082567] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-slate-500 mb-1">Hip (cm)</label>
                    <input 
                      type="number" 
                      name="hip" 
                      required 
                      defaultValue={editingGirthLogDate ? (currentLogs.find(l => l.date === editingGirthLogDate)?.hip || latestLog.hip) : latestLog.hip} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-800 shadow-3xs focus:outline-[#082567] font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-slate-500 mb-1">Arm (cm)</label>
                    <input 
                      type="number" 
                      name="arm" 
                      required 
                      defaultValue={editingGirthLogDate ? (currentLogs.find(l => l.date === editingGirthLogDate)?.arm || latestLog.arm) : latestLog.arm} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-800 shadow-3xs focus:outline-[#082567] font-sans"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <label className="block text-[13px] font-medium text-slate-500 mb-1">Thigh (cm)</label>
                    <input 
                      type="number" 
                      name="thigh" 
                      required 
                      defaultValue={editingGirthLogDate ? (currentLogs.find(l => l.date === editingGirthLogDate)?.thigh || latestLog.thigh) : latestLog.thigh} 
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-slate-800 shadow-3xs focus:outline-[#082567] font-sans"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center bg-white px-3.5 py-2.5 border border-slate-200 rounded-xl select-none text-[12px]">
                  <span className="text-slate-500 font-medium">Quick Selection:</span>
                  <div className="flex gap-2">
                    {currentLogs.slice(-3).reverse().map((gLog, idx) => {
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => setEditingGirthLogDate(gLog.date)}
                          className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer focus:outline-none"
                        >
                          {new Date(gLog.date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[#082567] hover:bg-slate-900 text-white font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider transition-all duration-150 cursor-pointer text-center select-none font-sans"
                >
                  {editingGirthLogDate ? "Update Measurements" : "Save Measurements"}
                </button>
              </form>
            </div>

            <button 
              onClick={handleDownloadBodyCSV}
              className="w-full flex items-center justify-center gap-2 bg-[#18D2C3]/10 hover:bg-[#18D2C3]/20 text-[#082567] border border-[#18D2C3]/30 font-bold text-xs py-3 px-4 rounded-xl uppercase tracking-wider transition-all cursor-pointer font-sans select-none"
            >
              <Download className="w-4 h-4 text-[#18D2C3]" />
              <span>DOWNLOAD BODY MEASUREMENT CSV</span>
            </button>
          </div>
        );
      })()}
    </div>
  );
}
