import ChildNavBar from "../components/ChildNavBar";
import SettingsView from "../components/SettingsView";

export default function ChildSettings() {
  return (
    <div className="child-dashboard">
      <ChildNavBar />
      <SettingsView />
    </div>
  );
}
