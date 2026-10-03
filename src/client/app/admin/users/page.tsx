import { dictionary } from "@/app/_i18n";
import { UserList } from "@/components/features/admin/users/UserList";

export default function AdminUsersPage() {
  return <UserList labels={ dictionary.adminUserList } />;
}
