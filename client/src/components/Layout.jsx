import Sidebar from './Sidebar';

const Layout = ({ children, userRole }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <main className="lg:ml-64 transition-all duration-300 pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
};

export default Layout;
