function Navbar() {
  return (
    <nav className="fixed w-full top-0 flex p-4 z-50">
      <img
        src="/images/presby.png"
        alt="Presby Logo"
        className="w-12 h-12 lg:w-24 lg:h-24"
      />
      <img
        src="/images/ypg.png"
        alt="Ypg Logo"
        className="w-12 h-12 lg:w-24 lg:h-24"
      />
    </nav>
  );
}

export default Navbar;
