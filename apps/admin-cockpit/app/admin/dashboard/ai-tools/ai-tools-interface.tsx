"use client";

import { useState } from "react";
import { Sparkles, Wand2, FileText } from "lucide-react";

export function AIToolsInterface() {
  const [activeTab, setActiveTab] = useState("description");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    // Simulate AI generation
    setTimeout(() => {
      setOutput(`Generated ${activeTab} for: "${input}"`);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-6 h-6 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">AI Content Generator</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("description")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "description"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText className="w-4 h-4" />
          Description
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === "tags"
              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          Tags
        </button>
      </div>

      {/* Input */}
      <div>
        <label className="text-slate-300 text-sm font-medium mb-2 block">
          Product Name or Details
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter product name or description..."
          className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-400 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!input || loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg transition-all duration-300"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate {activeTab === "description" ? "Description" : "Tags"}
          </>
        )}
      </button>

      {/* Output */}
      {output && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-4">
          <p className="text-slate-300 text-sm font-medium mb-2">Generated Content:</p>
          <p className="text-white">{output}</p>
        </div>
      )}
    </div>
  );
}
