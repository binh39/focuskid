import ParentNavBar from "../components/ParentNavBar";
import ProgressView from "../components/ProgressView";

export default function ParentProgress() {
  return (
    <div className="parent-dashboard">
      <ParentNavBar />
      <ProgressView audience="parent" />
    </div>
  );
}
