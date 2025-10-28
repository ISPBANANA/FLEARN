"use client";

import React, { useState } from "react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

const subjects = ["Mathematics", "Biology", "Physics", "Chemistry"];

const subtopicsBySubject: Record<string, string[]> = {
  Mathematics: [
    "Calculus L'Hopital",
    "Linear Algebra",
    "Differential Equations",
    "Statistics",
    "Probability Theory",
    "Trigonometry",
    "Geometry",
    "Number Theory",
    "Complex Analysis",
    "Discrete Mathematics",
    "Vector Calculus",
    "Matrix Theory",
    "Graph Theory",
    "Set Theory"
  ],
  Biology: [
    "Cell Biology",
    "Genetics",
    "Evolution",
    "Ecology",
    "Molecular Biology",
    "Anatomy",
    "Physiology",
    "Microbiology",
    "Immunology",
    "Botany",
    "Zoology",
    "Neuroscience",
    "Developmental Biology",
    "Marine Biology"
  ],
  Physics: [
    "Mechanics",
    "Thermodynamics",
    "Electromagnetism",
    "Quantum Physics",
    "Optics",
    "Relativity",
    "Nuclear Physics",
    "Waves",
    "Fluid Dynamics",
    "Solid State Physics",
    "Particle Physics",
    "Astrophysics",
    "Plasma Physics",
    "Acoustics"
  ],
  Chemistry: [
    "Organic",
    "Inorganic",
    "Physical Chemistry",
    "Analytical Chemistry",
    "Biochemistry",
    "Electrochemistry",
    "Thermochemistry",
    "Chemical Kinetics",
    "Polymer Chemistry",
    "Environmental Chemistry",
    "Medicinal Chemistry",
    "Coordination Chemistry",
    "Spectroscopy",
    "Catalysis"
  ],
};

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isContentAnimating, setIsContentAnimating] = useState<boolean>(false);

  const handleSubjectClick = (subject: string) => {
    if (subject === selectedSubject) {
      setSelectedSubject(null);
      setSelectedSubtopic(null);
    } else {
      if (selectedSubject) {
        // If there's already a selected subject, slide out first
        setIsAnimating(true);
        setIsContentAnimating(true);
        setSelectedSubject(null);
        setSelectedSubtopic(null);
        setTimeout(() => {
          setSelectedSubject(subject);
          setIsAnimating(false);
          setIsContentAnimating(false);
        }, 150);
      } else {
        // No subject selected, just slide in
        setSelectedSubject(subject);
        setSelectedSubtopic(null);
      }
    }
  };

  const handleSubtopicClick = (subtopic: string) => {
    if (subtopic === selectedSubtopic) {
      setSelectedSubtopic(null);
    } else {
      if (selectedSubtopic) {
        // If there's already a selected subtopic, slide out first
        setIsContentAnimating(true);
        setSelectedSubtopic(null);
        setTimeout(() => {
          setSelectedSubtopic(subtopic);
          setIsContentAnimating(false);
        }, 150);
      } else {
        // No subtopic selected, just slide in
        setSelectedSubtopic(subtopic);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Nav />

      <div className="px-4 py-2 flex min-h-[calc(100vh-80px)]">
        {/* Left column - Subjects */}
        <aside className="flex flex-col bg-white py-4 px-4 w-60 h-fit">
          <h3 className="text-base font-semibold text-gray-600 mb-4">Subjects</h3>

          <div className="space-y-3 flex-1">
            {subjects.map((s) => {
              const active = s === selectedSubject;
              return (
                <button
                  key={s}
                  onClick={() => handleSubjectClick(s)}
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

          {/* Return to Profile button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="w-full flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors px-3 py-2">
              <span className="text-lg">←</span>
              <span>Return to Profile</span>
            </button>
          </div>
        </aside>

        {/* Vertical divider line */}
        <div className="border-l-2 border-gray-200 shadow-sm"></div>

        {/* Middle column - Sub-Topics (slides in when subject is selected) */}
        <div
          className={`transition-all duration-150 ease-in-out overflow-hidden ${
            selectedSubject && !isAnimating ? "w-64 opacity-100" : "w-0 opacity-0"
          }`}
        >
          {selectedSubject && (
            <section className="flex flex-col px-4 py-4 w-64 bg-gray-200 h-[calc(100vh-96px)]">
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-600 mb-3">Sub-Topics</h4>
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className="w-full px-3 py-1 text-gray-400 text-sm rounded-md border border-gray-300 bg-white focus:outline-none focus:border-gray-300 focus:bg-white"
                    placeholder={isSearchFocused ? "" : "Placeholder"}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
                    🔍
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 pl-1 py-1">
                {(subtopicsBySubject[selectedSubject] || [])
                  .filter((st) => 
                    st.toLowerCase().includes(searchValue.toLowerCase())
                  )
                  .map((st) => {
                    const active = st === selectedSubtopic;
                    return (
                      <button
                        key={st}
                        onClick={() => handleSubtopicClick(st)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
                          active
                            ? "bg-purple-600 text-white hover:bg-purple-700"
                            : "bg-white text-gray-700 border border-gray-200 hover:border-purple-400 hover:shadow-md hover:scale-[1.02]"
                        }`}
                      >
                        <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                          active ? 'bg-white text-purple-600' : 'bg-purple-50 text-purple-600'
                        }`}>▶</span>
                        <span className="truncate">{st}</span>
                      </button>
                    );
                  })}
              </div>
            </section>
          )}
        </div>

        {/* Vertical divider line between Sub-Topics and main content */}
        {selectedSubject && (
          <div className="border-l-2 border-gray-200 shadow-sm transition-opacity duration-300"></div>
        )}

        {/* Main content area - shown when subtopic is selected */}
        <div
          className={`transition-all duration-150 ease-in-out overflow-hidden ${
            selectedSubtopic && !isContentAnimating ? "flex-1 opacity-100" : "w-0 opacity-0"
          }`}
        >
          {selectedSubtopic && (
            <div className="flex flex-col items-center pt-8 px-8 w-full h-[calc(100vh-92px)] overflow-y-auto">
              {/* Title */}
              <h1 className="text-5xl font-bold text-purple-600 mb-8">{selectedSubtopic}</h1>

              {/* Vertical timeline with numbered circles */}
              <div className="flex flex-col items-center pb-8">
                {/* First level - Yellow oval with number 1 */}
                <div className="flex flex-col items-center">
                  <button className="w-40 h-24 rounded-[50px] bg-yellow-400 text-white text-3xl font-bold flex items-center justify-center hover:bg-yellow-500 transition-colors shadow-lg">
                    1
                  </button>
                  <div className="w-1 h-16 bg-gray-300"></div>
                </div>

                {/* Remaining levels - Purple ovals */}
                {[2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="flex flex-col items-center">
                    <button className="w-32 h-20 rounded-[40px] bg-purple-600 text-white text-3xl font-bold flex items-center justify-center hover:bg-purple-700 transition-colors shadow-lg">
                      {num}
                    </button>
                    {num < 6 && (
                      <div className="w-1 h-16 bg-gray-300"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
