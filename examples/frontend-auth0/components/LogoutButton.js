export default function LogoutButton() {
  return (
    <a href="/api/auth/logout" className="logout-btn">
      <span className="icon">🚪</span>
      Logout
    </a>
  );
}
