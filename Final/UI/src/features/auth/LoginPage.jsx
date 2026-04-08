import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import API_BASE from "../../config";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) { setError("Invalid username or password."); return; }
      const user = await res.json();
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(user));
      navigate("/dashboard", { replace: true });
    } catch {
      setError("Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left side — brand panel */}
      <div className={styles.left}>
        <div className={styles.logoCircle}>◐</div>
        <div className={styles.brandName}>PathWise</div>
        <div className={styles.brandSub}>Academy Management System</div>
        <div className={styles.brandTagline}>
          Guiding Growth,<br />Inspiring Success
        </div>
      </div>

      {/* Right side — card */}
      <div className={styles.right}>
        <div className={styles.card}>
          <h1 className={styles.cardTitle}>Login to Your Account</h1>
          <p className={styles.cardSub}>Please enter your login credentials to access your account.</p>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>👤</span> Email / Username
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter your username..."
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>
                <span className={styles.labelIcon}>🔒</span> Password
              </label>
              <div className={styles.passWrap}>
                <input
                  className={styles.input}
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password..."
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <div className={styles.row}>
              <label className={styles.rememberLabel}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className={styles.checkbox} />
                Remember me
              </label>
              <span className={styles.forgot}>Forgot Password?</span>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className={styles.divider} />
        </div>

        <p className={styles.footer}>© 2026 PathWise Academy. All rights reserved.</p>
      </div>
    </div>
  );
}
