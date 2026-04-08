import RoleDashboard from "./RoleDashboard";

export default function StudentDashboard({ user }) {
  const link = user?.linkedEntity;
  return (
    <RoleDashboard
      eyebrow="Student"
      title={`Welcome${link?.displayName ? `, ${link.displayName}` : ""}.`}
      sub={link?.studentNumber
        ? `Student #${link.studentNumber}. Your grades, schedule, books and tuition will appear here as later phases come online.`
        : "Your grades, schedule, books and tuition will appear here as later phases come online."}
      user={user}
    />
  );
}
