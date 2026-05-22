import { DollarSign, Users, BookOpen, Printer, Award, Target, BarChart2 } from 'lucide-react';

export default function AdminReports({ admissions, courses, users, financialReport }) {
  const students = users.filter(u => u.role === 'student');
  const instructors = users.filter(u => u.role === 'instructor');
  const payments = financialReport?.payments || [];
  const totalRevenue = financialReport?.total || admissions.reduce((acc, adm) => {
    const c = courses.find(c => c._id === adm.course || c.title === adm.course);
    return acc + (c ? Number(c.fee) : 15000);
  }, 0);
  const avgPayment = payments.length ? Math.round(totalRevenue / payments.length) : 0;

  const gatewayData = Object.entries(financialReport?.gatewayBreakdown || {}).map(([name, data]) => ({
    name,
    count: data.count,
    total: data.total,
    pct: financialReport.count ? ((data.count / financialReport.count) * 100).toFixed(1) : 0
  }));

  const courseStats = financialReport?.courseRevenue?.length ? financialReport.courseRevenue : courses.map(c => ({
    title: c.title,
    count: admissions.filter(a => a.course === c._id || a.course === c.title).length,
    total: admissions.filter(a => a.course === c._id || a.course === c.title).reduce((sum, a) => sum + (Number(c.fee) || 0), 0)
  })).sort((a, b) => b.total - a.total).slice(0, 6);

  const monthlyRevenue = financialReport?.monthlyRevenue || [];
  const maxMonthly = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  const handleDownloadReport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue', totalRevenue],
      ['Total Payments', financialReport.count || payments.length],
      ['Average Payment', avgPayment],
      ['Total Students', students.length],
      ['Total Instructors', instructors.length]
    ];

    const gatewayRows = [['Gateway', 'Count', 'Revenue']].concat(gatewayData.map(g => [g.name, g.count, g.total]));
    const courseRows = [['Course', 'Payments', 'Revenue']].concat(courseStats.map(c => [c.course || c.title, c.count, c.total]));

    const csv = [
      'Admin Report',
      '',
      rows.map(r => r.join(',')).join('\n'),
      '',
      gatewayRows.map(r => r.join(',')).join('\n'),
      '',
      courseRows.map(r => r.join(',')).join('\n')
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'admin-financial-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const gatewayLabel = g => ({ eSewa: 'eSewa', Khalti: 'Khalti', Stripe: 'Stripe', PayPal: 'PayPal' }[g] || g);
  const gatewayColor = g => ({ eSewa: 'bg-green-500', Khalti: 'bg-purple-500', Stripe: 'bg-indigo-500', PayPal: 'bg-amber-500' }[g] || 'bg-slate-400');

  const courseTitle = c => c.course || c.title || 'Unknown';

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-slate-500">Financial summary, payment analytics, and course revenue insights.</p>
          <h2 className="text-lg font-bold text-slate-900">Dashboard Finance Report</h2>
        </div>
        <button onClick={handleDownloadReport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-semibold transition-colors">
          <Printer size={15} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[{
          label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`,
          icon: DollarSign, color: 'text-green-600 bg-green-50', sub: `${financialReport.count || payments.length} payments`
        }, {
          label: 'Total Students', value: students.length, icon: Users, color: 'text-blue-600 bg-blue-50', sub: `${instructors.length} instructors`
        }, {
          label: 'Avg. Payment', value: `Rs. ${avgPayment.toLocaleString()}`, icon: BookOpen, color: 'text-amber-600 bg-amber-50', sub: `${financialReport.count || payments.length} completed`
        }, {
          label: 'Top Revenue Course', value: courseTitle(courseStats[0] || {}), icon: Award, color: 'text-indigo-600 bg-indigo-50', sub: `${courseStats[0]?.total ? `Rs. ${courseStats[0].total.toLocaleString()}` : 'No data'}`
        }].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{sub}</p>
              </div>
              <div className={`p-3 rounded-xl ${color}`}><Icon size={18} /></div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-800 mb-5">Gateway Revenue Breakdown</h3>
          <div className="space-y-4">
            {gatewayData.length > 0 ? gatewayData.map(g => (
              <div key={g.name}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{gatewayLabel(g.name)}</span>
                  <span className="text-slate-500">{g.count} txns · Rs. {g.total.toLocaleString()}</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${gatewayColor(g.name)} transition-all`} style={{ width: `${g.pct}%` }} />
                </div>
              </div>
            )) : (
              <p className="text-sm text-slate-400">No payment gateway data available yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-base font-bold text-slate-800 mb-5">Monthly Revenue Trend</h3>
          <div className="flex items-end gap-3 h-36">
            {monthlyRevenue.length > 0 ? monthlyRevenue.map((m, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 gap-2">
                <span className="text-xs text-slate-500">Rs. {m.revenue.toLocaleString()}</span>
                <div className="w-full rounded-t-lg bg-indigo-100 overflow-hidden" style={{ height: '180px' }}>
                  <div className="h-full bg-indigo-500 rounded-t-lg transition-all" style={{ height: `${(m.revenue / maxMonthly) * 100}%` }} />
                </div>
                <span className="text-xs text-slate-500 font-medium">{m.label}</span>
              </div>
            )) : (
              <p className="text-sm text-slate-400">No monthly payment history available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-800">Top Courses by Payment Revenue</h3>
          <span className="text-xs text-slate-500">Updated live</span>
        </div>
        <div className="space-y-3">
          {courseStats.length > 0 ? courseStats.map((course, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800 truncate">{courseTitle(course)}</p>
                <p className="text-xs text-slate-500">{course.count} payments</p>
              </div>
              <p className="text-sm font-semibold text-slate-700">Rs. {course.total.toLocaleString()}</p>
            </div>
          )) : (
            <p className="text-sm text-slate-400">No course revenue data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
