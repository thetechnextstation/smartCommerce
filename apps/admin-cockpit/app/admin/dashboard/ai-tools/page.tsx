import { AdminCheck } from "../admin-check";
import { AIToolsInterface } from "./ai-tools-interface";
import { Sparkles, Image as ImageIcon, FileText, Tags } from "lucide-react";

export default async function AIToolsPage() {
  await AdminCheck();

  const tools = [
    {
      id: "image-gen",
      title: "AI Image Generation",
      description: "Generate product images from text descriptions or reference images",
      icon: ImageIcon,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "description",
      title: "Product Description",
      description: "Generate compelling product descriptions using AI",
      icon: FileText,
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "tags",
      title: "Smart Tags",
      description: "Auto-generate relevant tags and keywords for products",
      icon: Tags,
      color: "from-green-500 to-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">AI Tools</h1>
        </div>
        <p className="text-slate-400">
          Leverage artificial intelligence to enhance your product catalog
        </p>
      </div>

      {/* Tool Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="group relative rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-white/20 p-6 transition-all duration-300 cursor-pointer"
          >
            {/* Background gradient */}
            <div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
            ></div>

            <div className="relative">
              {/* Icon */}
              <div
                className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${tool.color} shadow-lg mb-4`}
              >
                <tool.icon className="w-8 h-8 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
              <p className="text-slate-400 text-sm">{tool.description}</p>

              {/* Coming soon badge */}
              <div className="mt-4 inline-flex px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium">
                Coming Soon
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Tools Interface */}
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-white/10 p-6">
        <AIToolsInterface />
      </div>

      {/* Info Section */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-3">About AI Tools</h3>
        <div className="space-y-2 text-slate-300 text-sm">
          <p>
            Our AI-powered tools use advanced machine learning models including:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>Gemini 1.5 Flash</strong> - For image analysis and generation
            </li>
            <li>
              <strong>Claude 3.5 Sonnet</strong> - For natural language processing and
              content generation
            </li>
            <li>
              <strong>Pinecone Vector DB</strong> - For semantic search and recommendations
            </li>
          </ul>
          <p className="mt-4">
            These tools are designed to save you time and improve the quality of your
            product catalog through intelligent automation.
          </p>
        </div>
      </div>
    </div>
  );
}
