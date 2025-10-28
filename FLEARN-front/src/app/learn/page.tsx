"use client";

import React, { useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const subjects = ["Mathematics", "Biology", "Physics", "Chemistry"];

const subtopicsBySubject: Record<string, string[]> = {
  Mathematics: ["Calculus L'Hopital", "Linear Algebra"],
  Biology: ["Cell Biology", "Genetics"],
  Physics: ["Mechanics", "Thermodynamics"],
  Chemistry: ["Organic", "Inorganic"],
};

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);

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
                  onClick={() => setSelectedSubject(active ? null : s)}
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

        {/* Middle column - Sub-Topics (slides in when subject is selected) */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            selectedSubject ? "w-64 opacity-100" : "w-0 opacity-0"
          }`}
        >
          {selectedSubject && (
            <section className="flex flex-col bg-white border rounded-lg p-4 ml-4 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-600">Sub-Topics</h4>
                <div className="relative w-32">
                  <input
                    className="w-full px-3 py-1 text-sm rounded-md border border-gray-200"
                    placeholder="Placeholder"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    🔍
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {(subtopicsBySubject[selectedSubject] || []).map((st) => {
                  const active = st === selectedSubtopic;
                  return (
                    <button
                      key={st}
                      onClick={() => setSelectedSubtopic(st)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        active
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-sm flex-shrink-0 ${
                        active ? 'bg-white' : 'bg-purple-400'
                      }`} />
                      <span className="truncate">{st}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
