import type { ComponentType } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Award, Target, Trophy, UserRound, Users } from "lucide-react";
import "../assets/login.css";

type Feature = {
	icon: ComponentType<{ className?: string }>;
	title: string;
	desc: string;
};

const features: Feature[] = [
	{ icon: Target, title: "Focus Sessions", desc: "Pomodoro timer to stay on track" },
	{ icon: Trophy, title: "Earn Rewards", desc: "Unlock badges and achievements" },
	{ icon: Award, title: "Track Progress", desc: "See your learning journey" },
];

export default function Login() {
	const navigate = useNavigate();
	const [role, setRole] = useState<"parent" | "child">("parent");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const goToRoleDashboard = (r: "parent" | "child") => {
		navigate(r === "parent" ? "/parent/dashboard" : "/child/dashboard");
	};

	const handleLogin = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch("http://localhost:4000/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, role }),
			});
			if (!res.ok) {
				setError("Account not found. Please create an account.");
				return;
			}
			const user = await res.json();
			localStorage.setItem("focuskid_user", JSON.stringify(user));
			goToRoleDashboard(role);
		} catch (err) {
			console.error(err);
			setError("Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleCreateAccount = async () => {
		setLoading(true);
		setError("");
		try {
			const res = await fetch("http://localhost:4000/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email, role }),
			});
			if (!res.ok) {
				setError("Account creation failed.");
				return;
			}
			const user = await res.json();
			localStorage.setItem("focuskid_user", JSON.stringify(user));
			goToRoleDashboard(role);
		} catch (err) {
			console.error(err);
			setError("Account creation failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-page">
			<div className="login-shell">
				<section className="login-left">
					<div className="brand-row">
						<div className="brand-icon">
							<Sparkles className="svg-icon-lg" />
						</div>
						<h1 className="brand-name">FocusKid</h1>
					</div>

					<div className="hero-copy">
						<h2>Stay focused, earn rewards, and finish your mission!</h2>
						<p>A playful learning platform designed for young learners with ADHD</p>
					</div>

					<div className="feature-list">
						{features.map((feature) => (
							<article className="feature-item" key={feature.title}>
								<div className="feature-icon">
									<feature.icon className="svg-icon" />
								</div>
								<div className="feature-text">
									<strong>{feature.title}</strong>
									<span>{feature.desc}</span>
								</div>
							</article>
						))}
					</div>
				</section>

				<section className="login-card-wrap">
					<div className="login-card">
						<header className="card-header">
							<h2>Welcome Back!</h2>
							<p>Choose a role and sign in or create an account</p>
						</header>

						<div className="role-switch">
							<button type="button" className={role === "parent" ? "role-btn active" : "role-btn"} onClick={() => setRole("parent")}>
								<Users className="svg-icon" /> Parent
							</button>
							<button type="button" className={role === "child" ? "role-btn active" : "role-btn"} onClick={() => setRole("child")}>
								<UserRound className="svg-icon" /> Child
							</button>
						</div>

						<div className="signin-form">
							<label>
								Name
								<input value={name} onChange={(e) => setName(e.target.value)} placeholder={role === "parent" ? "Parent name" : "Child name"} />
							</label>
							<label>
								Email
								<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
							</label>
						</div>

						{error && <div className="error-text">{error}</div>}

						<div className="signin-actions">
							<button type="button" onClick={handleLogin} className="social-btn" disabled={loading}>
								Sign in
							</button>
						</div>

						<div className="divider">
							<span>or</span>
						</div>

						<button type="button" onClick={handleCreateAccount} className="primary-btn" disabled={loading}>
							Create Account
						</button>

						<footer className="card-footer">
							<button type="button" className="link-muted">
								Need help?
							</button>
							<button type="button" onClick={handleLogin} className="link-primary">
								Sign in
							</button>
						</footer>
					</div>
				</section>
			</div>
		</div>
	);
}
