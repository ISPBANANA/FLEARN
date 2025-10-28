"use client";

import React, { useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const subjects = ["Mathematics", "Biology", "Physics", "Chemistry"];

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState<string>(subjects[0]);

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="mt-8 mb-12 px-4 flex">
        {/* Left column - Subjects */}
        <aside className="flex flex-col bg-white border rounded-lg p-4 w-60">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Subjects</h3>

          <div className="space-y-3 flex-1">
            {subjects.map((s) => {
              const active = s === selectedSubject;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors focus:outline-none ${
                    active
                      ? "bg-purple-600 text-white shadow"
                      : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                      active ? 'bg-white text-purple-600' : 'bg-purple-50 text-purple-600'
                    }`}>▶</span>
                    <span className="truncate">{s}</span>
                  </div>
                  <span className="text-xs opacity-60">|&gt;</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <button className="w-full px-6 py-2 border rounded-md text-gray-700">Profile</button>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
}
