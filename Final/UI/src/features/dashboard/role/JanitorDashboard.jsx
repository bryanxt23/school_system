import RoleDashboard from "./RoleDashboard";

export default function JanitorDashboard({ user }) {
  return (
    <RoleDashboard
      eyebrow="Janitor"
      title={`Welcome${user?.linkedEntity?.displayName ? `, ${user.linkedEntity.displayName}` : ""}.`}
      sub="Your assigned areas, today's schedule, task checklist and incoming maintenance requests will appear here once Phase 10 is wired in."
      user={user}
    />
  );
}
