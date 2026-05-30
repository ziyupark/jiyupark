"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"

/* ── Config ─────────────────────────────────────── */
const CX = 200
const CY = 205
const CENTER_R = 13
const SEED_N = 22
const BASE_LEN = 74

/* ── Deterministic pseudo-random (no hydration mismatch) ── */
const p = (i: number, s: number) => Math.abs(Math.sin(i * (s * 1.618 + 0.77)))

/* ── Seeds ──────────────────────────────────────── */
const SEEDS = Array.from({ length: SEED_N }, (_, i) => {
  const angle  = (i / SEED_N) * Math.PI * 2 - Math.PI / 2
  const dA     = angle + (p(i,1) - 0.5) * 0.72
  const dDist  = 115 + p(i,2) * 190
  return {
    id:      i,
    angle,
    len:     BASE_LEN + Math.sin(i * 2.3) * 9,
    depth:   p(i,3),
    baseOp:  0.55 + p(i,4) * 0.45,
    driftX:  Math.cos(dA) * dDist,
    driftY:  Math.sin(dA) * dDist - 16,
    dur:     3.4 + p(i,5) * 2.6,
    delay:   i * 0.022 + p(i,6) * 0.46,
  }
})

const MAX_BLOW_MS =
  Math.max(...SEEDS.map(s => (s.dur + s.delay) * 1000)) + 700

/* ── One seed (achene stem + pappus) ────────────── */
function SeedShape({ angle, len, depth }: {
  angle: number; len: number; depth: number
}) {
  const cos = Math.cos(angle), sin = Math.sin(angle)
  const ax1 = cos * CENTER_R,  ay1 = sin * CENTER_R
  const ax2 = cos * len,       ay2 = sin * len
  const PN = 10, SPREAD = Math.PI * 0.52
  const PLEN = 11 + depth * 8
  const sw   = 0.52 + depth * 0.55
  const pw   = 0.36 + depth * 0.3

  return (
    <g opacity={0.55 + depth * 0.45}>
      {/* achene stem */}
      <line
        x1={ax1} y1={ay1} x2={ax2} y2={ay2}
        stroke="rgba(255,252,240,0.92)"
        strokeWidth={sw}
        strokeLinecap="round"
      />
      {/* seed body */}
      <ellipse
        cx={ax2} cy={ay2} rx={1.1} ry={1.75}
        fill="rgba(255,250,235,0.95)"
        transform={`rotate(${angle * 180 / Math.PI + 90},${ax2},${ay2})`}
      />
      {/* pappus fan */}
      {Array.from({ length: PN }, (_, k) => {
        const a = angle + (-SPREAD / 2 + (k / (PN - 1)) * SPREAD)
        const mid = 1 - Math.abs(k - (PN - 1) / 2) / ((PN - 1) / 2 + 0.01)
        return (
          <line
            key={k}
            x1={ax2} y1={ay2}
            x2={ax2 + Math.cos(a) * PLEN}
            y2={ay2 + Math.sin(a) * PLEN}
            stroke="rgba(255,252,242,0.88)"
            strokeWidth={pw}
            strokeLinecap="round"
            opacity={0.38 + mid * 0.58}
          />
        )
      })}
    </g>
  )
}

/* ── Main component ─────────────────────────────── */
export default function DandelionScene() {
  const [blown,   setBlown]   = useState(false)
  const [tapKey,  setTapKey]  = useState(0)   // remount seeds on regenerate
  const [touched, setTouched] = useState(false)

  const handleTap = useCallback(() => {
    if (blown) return
    setBlown(true)
    setTouched(true)
    setTimeout(() => {
      setTapKey(k => k + 1)
      setBlown(false)
    }, MAX_BLOW_MS)
  }, [blown])

  return (
    <div
      onClick={handleTap}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "88vh",
        background:
          "linear-gradient(160deg, #FFFEF8 0%, #FAF3DF 55%, #F4E8CB 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        WebkitTapHighlightColor: "transparent",
        overflow: "hidden",
      }}
    >
      {/* ── Dandelion SVG ── */}
      <motion.svg
        viewBox="0 0 400 460"
        width="100%"
        style={{ maxWidth: "460px", overflow: "visible" }}
        aria-hidden
        animate={{ rotate: blown ? 0 : [0, 0.7, 0, -0.7, 0] }}
        transition={{
          duration: 7,
          repeat: blown ? 0 : Infinity,
          ease: "easeInOut",
        }}
      >
        <defs>
          <filter id="df-seed" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="df-center" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Stem */}
        <motion.path
          d={`M${CX},${CY + 14}
              C${CX - 14},${CY + 88}
               ${CX + 12},${CY + 168}
               ${CX -  6},${CY + 214}
              S${CX +  9},${CY + 308}
               ${CX},448`}
          stroke="#B8A88C"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: blown ? 0.32 : 0.82 }}
          transition={{ duration: 1.8 }}
        />
        {/* Small leaf */}
        <path
          d={`M${CX - 4},${CY + 170}
              Q${CX - 44},${CY + 142}
               ${CX - 60},${CY + 118}`}
          stroke="#B8A88C"
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          opacity={0.52}
        />

        {/* Seeds — remounted (key=tapKey) for regeneration */}
        <g key={tapKey}>
          {SEEDS.map(seed => (
            <motion.g
              key={seed.id}
              filter="url(#df-seed)"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={
                blown
                  ? {
                      x: seed.driftX,
                      y: seed.driftY,
                      opacity: 0,
                      scale: 0.55,
                    }
                  : {
                      x: [0, Math.cos(seed.angle) * 1.6, 0],
                      y: [0, Math.sin(seed.angle) * 1.3, 0],
                      opacity: [
                        seed.baseOp,
                        seed.baseOp * 0.8,
                        seed.baseOp,
                      ],
                      scale: 1,
                    }
              }
              transition={
                blown
                  ? {
                      duration: seed.dur,
                      delay: seed.delay,
                      ease: [0.22, 1, 0.36, 1],
                    }
                  : {
                      duration: 4 + (seed.id % 4),
                      delay: seed.id * 0.09,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatType: "mirror",
                    }
              }
            >
              <SeedShape
                angle={seed.angle}
                len={seed.len}
                depth={seed.depth}
              />
            </motion.g>
          ))}
        </g>

        {/* Center sphere */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={CENTER_R}
          fill="rgba(178,165,145,0.68)"
          filter="url(#df-center)"
          animate={{ r: blown ? 8 : CENTER_R, opacity: blown ? 0.28 : 1 }}
          transition={{ duration: 1.3, ease: "easeInOut" }}
        />
        <circle cx={CX} cy={CY} r={5.5} fill="rgba(210,200,182,0.88)" />
        <circle cx={CX - 2} cy={CY - 2} r={2.2} fill="rgba(238,232,220,0.78)" />
      </motion.svg>

      {/* Ambient floating particles (background atmosphere) */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: 3 + i % 3,
            height: 3 + i % 3,
            borderRadius: "50%",
            background: "rgba(220,205,175,0.35)",
            left: `${15 + i * 13}%`,
            top: `${20 + (i % 3) * 22}%`,
            pointerEvents: "none",
          }}
          animate={{
            y: [-6, 6, -6],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{
            duration: 4 + i * 0.7,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Hint text */}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{
          opacity: touched ? 0 : [0, 0.52, 0],
        }}
        transition={
          touched
            ? { duration: 0.4 }
            : {
                duration: 3.8,
                delay: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        style={{
          position: "absolute",
          bottom: "7%",
          fontFamily: "'Manrope', sans-serif",
          fontSize: "11px",
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: "#B0A080",
          pointerEvents: "none",
        }}
      >
        touch · release
      </motion.span>
    </div>
  )
}
