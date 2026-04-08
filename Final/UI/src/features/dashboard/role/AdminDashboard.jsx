import RoleDashboard from "./RoleDashboard";

export default function AdminDashboard({ user }) {
  return (
    <RoleDashboard
      eyebrow="Admin"
      title={`Welcome${user?.username ? `, ${user.username}` : ""}.`}
      sub="Manage academics, directory, staff, and the school calendar from the top nav. Reports and tuition reach this dashboard in later phases."
      user={user}
    />
  );
}
