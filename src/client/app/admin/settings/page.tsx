import { dictionary } from "@/app/_i18n";
import { SettingsPage } from "@/components/features/admin/settings/SettingsPage";

export default function AdminSettingsPage() {
  return <SettingsPage labels={ dictionary.adminSettings } />;
}
