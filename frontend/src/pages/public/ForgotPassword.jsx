export default function ForgotPassword() {
  return (
    <main className="auth-page">
      <form className="auth-card">
        <span className="eyebrow">Account recovery</span>
        <h1>Reset your password</h1>
        <input placeholder="Email address" />
        <button className="primary-btn" type="button">Send reset link</button>
      </form>
    </main>
  );
}
