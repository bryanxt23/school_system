import RoleDashboard from "./RoleDashboard";

export default function TeacherDashboard({ user }) {
  return (
    <RoleDashboard
      eyebrow="Teacher"
      title={`Welcome${user?.linkedEntity?.displayName ? `, ${user.linkedEntity.displayName}` : ""}.`}
      sub="Your assigned classes, rosters and grade encoding tools will appear here once Phases 4 and 5 are wired in."
      user={user}
    />
  );
}
