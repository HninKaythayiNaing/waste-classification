import { CheckCircle2, Recycle, Trash2, Leaf, Lightbulb, AlertCircle, Clock } from 'lucide-react';

export default function ClassificationResultCard({ result, category, responseTime }) {
  if (!result) return null;

  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const color = category?.color || '#16a34a';
  const seconds = responseTime ? (responseTime / 1000).toFixed(1) : null;

  return (
    <div className="space-y-5">
      {/* Category banner */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }}
      >
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-8 -translate-y-8">
          <Recycle className="w-40 h-40" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-medium uppercase tracking-wider opacity-90">Classified as</span>
          </div>
          <h2 className="text-3xl font-heading font-bold mb-1">{result.predicted_category}</h2>
          {result.item_description && (
            <p className="text-sm opacity-90 max-w-md">{result.item_description}</p>
          )}
          <div className="mt-4 flex items-center gap-2">
            <div className="flex-1 max-w-32 h-2 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-sm font-semibold">{confidencePercent}% confident</span>
          </div>
          {seconds && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1 text-xs font-medium">
              <Clock className="w-3.5 h-3.5" />
              Analyzed in {seconds}s
            </div>
          )}
        </div>
      </div>

      {/* Recycling instructions */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <Recycle className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
          </div>
          <h3 className="font-semibold text-stone-800">How to Recycle</h3>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">
          {result.recycling_instructions || category?.disposal_instructions}
        </p>
      </div>

      {/* Disposal tips */}
      {result.disposal_tips && result.disposal_tips.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Lightbulb className="w-4.5 h-4.5 text-amber-600" style={{ width: 18, height: 18 }} />
            </div>
            <h3 className="font-semibold text-stone-800">Quick Tips</h3>
          </div>
          <ul className="space-y-2">
            {result.disposal_tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-stone-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Environmental impact */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-emerald-100 p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
          </div>
          <h3 className="font-semibold text-stone-800">Environmental Impact</h3>
        </div>
        <p className="text-sm text-stone-600 leading-relaxed">
          {result.environmental_impact || category?.environmental_impact}
        </p>
      </div>

      {/* Common examples */}
      {category?.common_examples && category.common_examples.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center">
              <Trash2 className="w-4.5 h-4.5 text-stone-500" style={{ width: 18, height: 18 }} />
            </div>
            <h3 className="font-semibold text-stone-800">Common Items</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {category.common_examples.map((item, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full bg-stone-100 text-xs text-stone-600 font-medium">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}