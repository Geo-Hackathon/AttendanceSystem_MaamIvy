import Sidebar from './Sidebar';

const Layout = ({ children, userRole }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <main className="lg:ml-64 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
