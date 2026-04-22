import type { ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, Globe, Award, Target, Trophy } from "lucide-react";
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

	const handleLogin = () => {
		navigate("/dashboard");
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
							<p>Sign in to continue your learning adventure</p>
						</header>

						<div className="signin-actions">
							<button type="button" onClick={handleLogin} className="social-btn">
								<span className="social-icon">
									<Globe className="svg-icon" />
								</span>
								<span>Sign in with Google</span>
							</button>

							<button type="button" onClick={handleLogin} className="social-btn">
								<span className="social-icon">
									<Mail className="svg-icon" />
								</span>
								<span>Sign in with Email</span>
							</button>
						</div>

						<div className="divider">
							<span>or</span>
						</div>

						<button type="button" onClick={handleLogin} className="primary-btn">
							Start Learning
						</button>

						<footer className="card-footer">
							<button type="button" className="link-muted">
								Forgot password?
							</button>
							<button type="button" onClick={handleLogin} className="link-primary">
								Create account
							</button>
						</footer>
					</div>
				</section>
			</div>
		</div>
	);
}
