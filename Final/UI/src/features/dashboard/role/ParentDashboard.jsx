import RoleDashboard from "./RoleDashboard";

export default function ParentDashboard({ user }) {
  return (
    <RoleDashboard
      eyebrow="Parent"
      title={`Welcome${user?.linkedEntity?.displayName ? `, ${user.linkedEntity.displayName}` : ""}.`}
      sub="Your linked children's grades, tuition status, books and announcements will appear here once Phases 5–8 are wired in."
      user={user}
    />
  );
}
