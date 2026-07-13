import { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Layout from '@/components/Layout';

export default function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ClassificationRecord.list('-created_date', 50)
      .then(data => setRecords(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    await base44.entities.ClassificationRecord.delete(id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const slugColors = {
    plastic: '#2563eb', paper: '#d97706', glass: '#0d9488',
    metal: '#64748b', organic: '#65a30d', electronic: '#7c3aed'
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
            <HistoryIcon className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-stone-800">Classification History</h1>
            <p className="text-sm text-stone-400">Your past waste classifications and recommendations</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-stone-200 border-t-emerald-600 rounded-full animate-spin" />
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-8 h-8 text-stone-300" />
            </div>
            <h3 className="font-semibold text-stone-700 mb-1">No classifications yet</h3>
            <p className="text-sm text-stone-400">Start classifying waste to build your history.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map(record => {
              const color = slugColors[record.category_slug] || '#16a34a';
              return (
                <div key={record.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden group hover:shadow-sm transition-shadow">
                  <div className="flex gap-0">
                    {record.image_url && (
                      <div className="w-24 h-24 flex-shrink-0 bg-stone-100">
                        <img src={record.image_url} alt={record.predicted_category} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
                              style={{ backgroundColor: color }}
                            >
                              {record.predicted_category}
                            </span>
                            <span className="text-xs text-stone-400">
                              {Math.round((record.confidence || 0) * 100)}% confident
                            </span>
                          </div>
                          <p className="text-sm text-stone-600 truncate">{record.item_description}</p>
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-stone-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.created_date)}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {record.recycling_instructions && (
                    <div className="px-4 pb-3 pt-1">
                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                        {record.recycling_instructions}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}