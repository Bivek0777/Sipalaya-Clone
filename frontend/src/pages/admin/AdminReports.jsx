import { TrendingUp, DollarSign, Users, BookOpen, Printer } from 'lucide-react';

export default function AdminReports({ admissions, courses, users }) {
  const totalRevenue = admissions.reduce((acc, adm) => {
    const c = courses.find(c => c._id === adm.course || c.title === adm.course);
    return acc + (c ? Number(c.fee) : 15000);
  }, 0);

  const avgFee = admissions.length
    ? Math.round(totalRevenue / admissions.length)
    : 0;

  const gateways = ['esewa', 'khalti', 'stripe', 'cash'];
  const gatewayData = gateways.map(g => ({
    name: g,
    count: admissions.filter(a => a.paymentPreference === g).length,
    pct: admissions.length ? ((admissions.filter(a => a.paymentPreference === g).length / admissions.length) * 100).toFixed(1) : 0,
  }));

  const statusData = ['pending', 'approved', 'rejected'].map(s => ({
    name: s,
    count: admissions.filter(a => a.status === s).length,
  }));

  const gatewayColor = g => ({ esewa: 'bg-green-500', khalti: 'bg-purple-500', stripe: 'bg-indigo-500', cash: 'bg-amber-500' }[g] || 'bg-slate-400');
  const gatewayLabel = g => ({ esewa: 'eSewa', khalti: 'Khalti', stripe: 'Stripe', cash: 'Cash' }[g] || g);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-slate-500">Financial summary and enrollment analytics</p>
        <button onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors">
          <Printer size={15} /> Export / Print
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Est. Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Total Admissions', value: admissions.length, icon: TrendingUp, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Avg. Course Fee', value: `Rs. ${avgFee.toLocaleString()}`, icon: BookOpen, color: 'text-amber-600 bg-amber-50' },
          { label: 'Total Students', value: users.filter(u => u.role === 'student').length, icon: Users, color: 'text-blue-600 bg-blue-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">{label}</p>
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
              </div>
              <div className={`p-3 rounded-xl ${color}`}><Icon size={20} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gateway Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-800 mb-5">Revenue by Payment Gateway</h3>
          <div className="space-y-4">
            {gatewayData.map(g => (
              <div key={g.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{gatewayLabel(g.name)}</span>
                  <span className="text-slate-500">{g.count} txns &nbsp;·&nbsp; {g.pct}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${gatewayColor(g.name)} transition-all`} style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admission Status */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-800 mb-5">Admission Status Breakdown</h3>
          <div className="space-y-4">
            {statusData.map(s => {
              const pct = admissions.length ? ((s.count / admissions.length) * 100).toFixed(1) : 0;
              const color = { pending: 'bg-amber-400', approved: 'bg-green-500', rejected: 'bg-red-400' }[s.name];
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-slate-700 capitalize">{s.name}</span>
                    <span className="text-slate-500">{s.count} &nbsp;·&nbsp; {pct}%</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-3">Course Enrollment Share</h4>
            <div className="space-y-2">
              {courses.slice(0, 5).map(c => {
                const cnt = admissions.filter(a => a.course === c.title || a.course === c._id).length;
                const pct = admissions.length ? ((cnt / admissions.length) * 100).toFixed(1) : 0;
                return (
                  <div key={c._id} className="flex justify-between text-xs text-slate-600">
                    <span className="truncate max-w-[60%]">{c.title}</span>
                    <span className="font-semibold">{cnt} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
