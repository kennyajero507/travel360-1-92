
import ProfileDropdown from "./ProfileDropdown";

const Header = () => {
  return (
    <div className="h-16 flex items-center justify-end px-6 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-4">
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default Header;
