import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    BarChart3,
    Users,
    UserSquare2,
    BookOpen,
    Notebook,
    FileText,
    Package,
    ShoppingBag,
    Contact2,
    Landmark,
    Percent,
    Settings,
    LogOut,
    Leaf,
    Menu
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, userRole, activeSection = 'admin', logout }) => {
    const adminLinks = [
        { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard" },
        { to: "/ledger", icon: BarChart3, text: "Ledger" },
        { to: "/beyparis", icon: Users, text: "Beyparis" },
        { to: "/customers", icon: UserSquare2, text: "Customers" },
        { to: "/udhaar", icon: BookOpen, text: "Udhaar" },
        { to: "/copybooks", icon: Notebook, text: "Copybooks" },
        { to: "/reports", icon: FileText, text: "Reports" },
        { to: "/inventory", icon: Package, text: "Inventory" },
        { to: "/admin/orders", icon: ShoppingBag, text: "Store Orders" },
        { to: "/hr", icon: Contact2, text: "HR" },
        { to: "/finance", icon: Landmark, text: "Finance" },
        { to: "/commission", icon: Percent, text: "Commission" },
        { to: "/settings", icon: Settings, text: "Settings" },
    ];

    const userLinks = [
        { to: "/store", icon: ShoppingBag, text: "Store" },
        { to: "/store/orders", icon: Package, text: "My Orders" },
        { to: "/store/profile", icon: Settings, text: "Account" },
    ];

    const links = activeSection === 'store' ? userLinks : (userRole === 'admin' ? adminLinks : userLinks);

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`} style={{ display: 'flex' }}>
            <div className="logo-section" style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '0.8rem', 
                marginBottom: '2rem',
                alignItems: 'flex-start'
            }}>
                <button
                    className="logo-icon"
                    onClick={toggleSidebar}
                    title="Toggle sidebar"
                >
                    <Leaf />
                </button>
                <h2 className="logo-text" style={{ margin: 0 }}>Javed <span>and Sons</span></h2>
            </div>

            <nav className="nav-links">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => window.innerWidth <= 1024 && toggleSidebar()}
                    >
                        <link.icon />
                        <span className="nav-text">{link.text}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <button className="nav-link" onClick={logout} style={{ width: '100%', background: 'transparent', cursor: 'pointer' }}>
                    <LogOut />
                    <span className="nav-text">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
