'use client';

import { CompanyPostedJobsDashboard } from '@/components/company-posted-jobs-dashboard';

export default function AdminDashboardPage() {
  return (
    <CompanyPostedJobsDashboard
      title="Company dashboard"
      subtitle="Jobs your organization has published for candidates."
      jdCreateHref="/admin/jd-creator"
    />
  );
}
