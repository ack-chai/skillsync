import { NextResponse } from 'next/server';

import {
  mockSkills,
  mockUserSkills,
  mockProjectSkills,
  mockApplications,
  mockProjects
} from '@/lib/mock-data';

export async function GET() {

  const skillAnalytics = mockSkills.map((s) => {

    const supplyCount = mockUserSkills.filter(
      us => us.skill_id === s.skill_id
    ).length;

    const demandCount = mockProjectSkills.filter(
      ps => ps.skill_id === s.skill_id
    ).length;

    const ratio = demandCount === 0
      ? 100
      : Math.round((supplyCount / demandCount) * 100);

    return {
      skill_id: s.skill_id,
      skill_name: s.skill_name,
      category: s.category,
      students_with_skill: supplyCount,
      projects_requiring: demandCount,
      supply_demand_ratio: ratio,
      status: ratio >= 100 ? 'ADEQUATE' : 'HIGH_DEMAND'
    };
  });

  const totalApps = mockApplications.length;

  const acceptedApps = mockApplications.filter(
    a => a.status === 'ACCEPTED'
  ).length;

  const pendingApps = mockApplications.filter(
    a => a.status === 'PENDING'
  ).length;

  const rejectedApps = mockApplications.filter(
    a => a.status === 'REJECTED'
  ).length;

  const funnel = {
    total_submitted: totalApps,
    pending_review: pendingApps,
    accepted: acceptedApps,
    rejected: rejectedApps,
    acceptance_rate: totalApps > 0
      ? Math.round((acceptedApps / totalApps) * 100)
      : 0
  };

  const domainBreakdown: Record<string, number> = {};

  for (const p of mockProjects) {
    domainBreakdown[p.domain] =
      (domainBreakdown[p.domain] || 0) + 1;
  }

  return NextResponse.json({
    success: true,
    author: 'Abhirup Roy (PES2UG24CS025)',
    data: {
      skill_analytics: skillAnalytics,
      application_funnel: funnel,
      domain_distribution: domainBreakdown,
      generated_at: new Date().toISOString()
    }
  });
}
