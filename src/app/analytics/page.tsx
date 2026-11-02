'use client';

import React, { useState, useEffect } from 'react';

export default function AnalyticsPage() {

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center">
        Loading system analytics...
      </div>
    );
  }

  if (!data) {
    return <div>Unable to load analytics.</div>;
  }

  return (
    <div className="space-y-8 p-6">

      <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl p-8">

        <h1 className="text-3xl font-bold">
          System Analytics & Skill Demand Matrix
        </h1>

        <p className="mt-3 text-slate-300">
          Analytics tracking technical skills, project requirements
          and application statistics.
        </p>

        <p className="mt-3 text-sky-300 text-sm">
          Engineered by Abhirup Roy (PES2UG24CS025)
        </p>

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {[
          ['Total Applications', data.application_funnel.total_submitted],
          ['Accepted', data.application_funnel.accepted],
          ['Pending', data.application_funnel.pending_review],
          ['Rejected', data.application_funnel.rejected]
        ].map(([label, value]) => (

          <div key={label} className="bg-white p-6 rounded-2xl shadow border">

            <p className="text-sm text-slate-500">
              {label}
            </p>

            <p className="text-3xl font-bold mt-2">
              {value}
            </p>

          </div>

        ))}

      </div>

      <div className="bg-white p-6 rounded-2xl shadow border">

        <h2 className="text-xl font-bold mb-5">
          Skill Demand vs Supply
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b">
                <th className="p-3">Skill</th>
                <th className="p-3">Students</th>
                <th className="p-3">Projects</th>
                <th className="p-3">Ratio</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>

              {data.skill_analytics.map((skill: any) => (

                <tr key={skill.skill_id} className="border-b">

                  <td className="p-3">{skill.skill_name}</td>

                  <td className="p-3">
                    {skill.students_with_skill}
                  </td>

                  <td className="p-3">
                    {skill.projects_requiring}
                  </td>

                  <td className="p-3">
                    {skill.supply_demand_ratio}%
                  </td>

                  <td className="p-3">
                    {skill.status}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      <div className="bg-white p-6 rounded-2xl shadow border">

        <h2 className="text-xl font-bold mb-4">
          Project Domain Distribution
        </h2>

        {Object.entries(data.domain_distribution).map(
          ([domain, count]) => (

            <div key={domain} className="flex justify-between border-b py-3">

              <span>{domain}</span>

              <span className="font-bold">{count as number}</span>

            </div>

          )
        )}

      </div>

    </div>
  );
}
