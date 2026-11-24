import { PageHeader } from '@/components/dashboard/page-header'
import { SettingsView } from '@/components/settings/settings-view'

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Manage your profile, brand, and workspace preferences."
      />
      <SettingsView />
    </div>
  )
}
