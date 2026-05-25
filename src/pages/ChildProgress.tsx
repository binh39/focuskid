import ChildNavBar from "../components/ChildNavBar";
import ProgressView from "../components/ProgressView";

export default function ChildProgress() {
  return (
    <div className="child-dashboard">
      <ChildNavBar />
      <ProgressView audience="child" />
    </div>
  );
}
