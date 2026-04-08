import RoleDashboard from "./RoleDashboard";

export default function GuardDashboard({ user }) {
  return (
    <RoleDashboard
      eyebrow="Security Guard"
      title={`Welcome${user?.linkedEntity?.displayName ? `, ${user.linkedEntity.displayName}` : ""}.`}
      sub="Your duty schedule, visitor log and incident reporting tools will appear here once Phase 11 is wired in."
      user={user}
    />
  );
}
