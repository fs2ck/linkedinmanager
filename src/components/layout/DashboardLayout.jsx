import Sidebar from './Sidebar';
import Header from './Header';
import './DashboardLayout.css';

export default function DashboardLayout({ children, title, headerActions }) {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-main">
                <Header title={title} actions={headerActions} />
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
