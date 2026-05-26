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

type Mode = "signin" | "signup";

export default function Login() {
	const navigate = useNavigate();
	const [mode, setMode] = useState<Mode>("signin");
	const [role, setRole] = useState<"parent" | "child">("parent");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [parentEmail, setParentEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const goToRoleDashboard = (r: "parent" | "child") => {
		navigate(r === "parent" ? "/parent/dashboard" : "/child/dashboard");
	};

	const resetFormState = () => {
		setError("");
		setName("");
		setParentEmail("");
		setPassword("");
	};

	const switchMode = (next: Mode) => {
		if (next === mode) return;
		setMode(next);
		resetFormState();
	};

	const handleSignIn = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!email.trim() || !password) {
			setError("Please enter your email and password.");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("http://localhost:4000/api/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: email.trim(), password }),
			});
			const data = await res.json().catch(() => null);
			if (!res.ok) {
				setError((data && data.error) || "Sign in failed. Please try again.");
				return;
			}
			localStorage.setItem("focuskid_user", JSON.stringify(data));
			goToRoleDashboard(data.role);
		} catch (err) {
			console.error(err);
			setError("Sign in failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleSignUp = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		if (!name.trim() || !email.trim() || !password) {
			setError("Please fill in all the required fields.");
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		if (role === "child" && !parentEmail.trim()) {
			setError("Please provide your parent's email.");
			return;
		}
		setLoading(true);
		try {
			const res = await fetch("http://localhost:4000/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					password,
					role,
					parent_email: role === "child" ? parentEmail.trim() : undefined,
				}),
			});
			const data = await res.json().catch(() => null);
			if (!res.ok) {
				setError((data && data.error) || "Account creation failed.");
				return;
			}
			localStorage.setItem("focuskid_user", JSON.stringify(data));
			goToRoleDashboard(data.role);
		} catch (err) {
			console.error(err);
			setError("Account creation failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const isSignIn = mode === "signin";

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
							<h2>{isSignIn ? "Welcome Back!" : "Create your account"}</h2>
							<p>
								{isSignIn
									? "Choose a role and sign in to continue."
									: "Join FocusKid and start the adventure."}
							</p>
						</header>

						<div className="role-switch">
							<button
								type="button"
								className={role === "parent" ? "role-btn active" : "role-btn"}
								onClick={() => setRole("parent")}
							>
								<Users className="svg-icon" /> Parent
							</button>
							<button
								type="button"
								className={role === "child" ? "role-btn active" : "role-btn"}
								onClick={() => setRole("child")}
							>
								<UserRound className="svg-icon" /> Child
							</button>
						</div>

						<form
							className="signin-form"
							onSubmit={isSignIn ? handleSignIn : handleSignUp}
							noValidate
						>
							{!isSignIn && (
								<label>
									Name
									<input
										value={name}
										onChange={(e) => setName(e.target.value)}
										placeholder={role === "parent" ? "Parent name" : "Child name"}
										autoComplete="name"
									/>
								</label>
							)}

							<label>
								Email
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="email@example.com"
									autoComplete="email"
								/>
							</label>

							{!isSignIn && role === "child" && (
								<label>
									Parent Email
									<input
										type="email"
										value={parentEmail}
										onChange={(e) => setParentEmail(e.target.value)}
										placeholder="parent@example.com"
										autoComplete="email"
									/>
								</label>
							)}

							<label>
								Password
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder={isSignIn ? "Your password" : "At least 6 characters"}
									autoComplete={isSignIn ? "current-password" : "new-password"}
								/>
							</label>

							{error && <div className="error-text">{error}</div>}

							<button type="submit" className="primary-btn" disabled={loading}>
								{loading
									? isSignIn
										? "Signing in..."
										: "Creating..."
									: isSignIn
										? "Sign In"
										: "Create Account"}
							</button>
						</form>

						<p className="card-switch">
							{isSignIn ? "New here? " : "Already have an account? "}
							<button
								type="button"
								className="link-primary"
								onClick={() => switchMode(isSignIn ? "signup" : "signin")}
							>
								{isSignIn ? "Create Account" : "Sign In"}
							</button>
						</p>
					</div>
				</section>
			</div>
		</div>
	);
}
