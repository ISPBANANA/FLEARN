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

      {/* Return to Profile - outside the bordered sections */}
      <div className="px-8 pt-4 pb-2">
        <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
          <span className="text-lg">←</span>
          <span>Return to Profile</span>
        </button>
      </div>

      <div className="px-4 flex min-h-[calc(100vh-160px)]">
        {/* Left column - Subjects */}
        <aside className="flex flex-col bg-white p-4 w-60 h-fit">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Subjects</h3>

          <div className="space-y-3 flex-1">
            {subjects.map((s) => {
              const active = s === selectedSubject;
              return (
                <button
                  key={s}
                  onClick={() => {
                    if (active) {
                      setSelectedSubject(null);
                      setSelectedSubtopic(null);
                    } else {
                      setSelectedSubject(s);
                      setSelectedSubtopic(null);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 focus:outline-none ${
                    active
                      ? "bg-purple-600 text-white shadow hover:bg-purple-700"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:shadow-md hover:scale-105"
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
        </aside>

        {/* Vertical divider line */}
        <div className="border-l-2 border-gray-300 mx-4"></div>

        {/* Middle column - Sub-Topics (slides in when subject is selected) */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            selectedSubject ? "w-64 opacity-100" : "w-0 opacity-0"
          }`}
        >
          {selectedSubject && (
            <section className="flex flex-col bg-gray-50 p-4 h-fit w-64 rounded-lg border border-gray-200">
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
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                        active
                          ? "bg-purple-600 text-white hover:bg-purple-700"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:shadow-md hover:scale-105"
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

        {/* Vertical divider line between Sub-Topics and main content */}
        <div className="border-l-2 border-gray-300 mx-4"></div>
      </div>

      <Footer />
    </div>
  );
}
