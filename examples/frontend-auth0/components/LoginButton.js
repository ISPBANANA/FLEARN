export default function LoginButton() {
  return (
    <a href="/api/auth/login" className="login-btn">
      <span className="icon">🔐</span>
      Login
    </a>
  );
}
