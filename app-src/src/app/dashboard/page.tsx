"use client";

import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <div className="dashboard">
      <motion.div
        className="dashboard-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="dashboard-header">
          <h1 className="dashboard-title">LinkPlanet</h1>
          <p className="dashboard-subtitle">Welcome back. Your links are waiting.</p>
        </div>

        <div className="dashboard-placeholder">
          <div className="placeholder-icon">🔗</div>
          <p className="placeholder-text">Dashboard coming soon</p>
          <p className="placeholder-subtext">
            Auth is working — you made it through the curtain.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
