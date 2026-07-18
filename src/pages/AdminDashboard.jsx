import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, BarChart3, TrendingUp, Recycle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Layout from '@/components/Layout';

export default function AdminDashboard() {
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke('getAdminStats', {})
      .then(({ data }) => {
        setRecords(data.records || []);
        setUsers(data.users || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categoryStats = records.reduce((acc, r) => {
    const cat = r.predicted_category || 'Unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryStats).sort((a, b) => b[1] - a[1]);
  const maxCount = sortedCategories.length > 0 ? sortedCategories[0][1] : 1;

  const timedRecords = records.filter(r => r.response_time_ms != null);
  const avgResponseMs = timedRecords.length > 0
    ? timedRecords.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / timedRecords.length
    : 0;
  const avgResponseSeconds = (avgResponseMs / 1000).toFixed(1);

  const slugColors = {
    Plastic: '#2563eb', Paper: '#d97706', Glass: '#0d9488',
    Metal: '#64748b', 'Organic Waste': '#65a30d', 'Electronic Waste': '#7c3aed'
  };

  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentRecords = records.filter(r => new Date(r.created_date) > sevenDaysAgo);

  const stats = [
    { label: 'Total Classifications', value: records.length, icon: Package, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Registered Users', value: users.length, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'This Week', value: recentRecords.length, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
    { label: 'Avg Response Time', value: `${avgResponseSeconds}s`, icon: Clock, color: 'bg-teal-50 text-teal-600' },
    { label: 'Waste Categories', value: sortedCategories.length, icon: BarChart3, color: 'bg-purple-50 text-purple-600' },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-stone-200 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-stone-800">Admin Dashboard</h1>
            <p className="text-sm text-stone-400">Platform overview and classification analytics</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-2xl border border-stone-200 p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-heading font-bold text-stone-800">{stat.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Category distribution */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <h2 className="font-semibold text-stone-800 mb-1">Classification Distribution</h2>
          <p className="text-xs text-stone-400 mb-5">Breakdown of classified waste by category</p>

          {sortedCategories.length === 0 ? (
            <div className="py-8 text-center text-sm text-stone-400">No classification data yet.</div>
          ) : (
            <div className="space-y-4">
              {sortedCategories.map(([category, count]) => {
                const color = slugColors[category] || '#16a34a';
                const percent = Math.round((count / maxCount) * 100);
                const share = Math.round((count / records.length) * 100);
                return (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-sm font-medium text-stone-700">{category}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span className="font-semibold text-stone-600">{count}</span>
                        <span>·</span>
                        <span>{share}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${percent}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent classifications */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-800 mb-1">Recent Activity</h2>
          <p className="text-xs text-stone-400 mb-4">Latest classifications across all users</p>

          {records.length === 0 ? (
            <div className="py-8 text-center text-sm text-stone-400">No activity yet.</div>
          ) : (
            <div className="space-y-2">
              {records.slice(0, 8).map(record => {
                const color = slugColors[record.predicted_category] || '#16a34a';
                return (
                  <div key={record.id} className="flex items-center gap-3 py-2 border-b border-stone-100 last:border-0">
                    {record.image_url && (
                      <img src={record.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-stone-100" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-700 truncate">{record.item_description || record.predicted_category}</p>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span>
                          {new Date(record.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {record.response_time_ms != null && (
                          <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {(record.response_time_ms / 1000).toFixed(1)}s
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-medium text-white flex-shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {record.predicted_category}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}