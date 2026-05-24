import ParentNavBar from "../components/ParentNavBar";
import SettingsView from "../components/SettingsView";

export default function ParentSettings() {
  return (
    <div className="parent-dashboard">
      <ParentNavBar />
      <SettingsView />
    </div>
  );
}
