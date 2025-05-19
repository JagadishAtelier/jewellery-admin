import UserImage from '../assets/user.jpg';
import { FiMenu } from 'react-icons/fi';
import { BiBell } from 'react-icons/bi';
import SearchBar from './SearchBar';

const Navbar = ({ toggleSidebar }) => {
  const today = new Date();

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1: return `${day}st`;
      case 2: return `${day}nd`;
      case 3: return `${day}rd`;
      default: return `${day}th`;
    }
  };

  const dayName = today.toLocaleDateString('en-GB', { weekday: 'long' });
  const monthName = today.toLocaleDateString('en-GB', { month: 'long' });
  const dayWithSuffix = getOrdinalSuffix(today.getDate());
  const year = today.getFullYear();
  const formattedDate = `${dayName} ${dayWithSuffix} ${monthName} ${year}`;

  return (
    <nav className="navbar bg-transparent px-2 px-md-3 py-2">
      <div className="d-flex flex-nowrap align-items-center justify-content-between w-100 gap-2">

        {/* Sidebar Toggle - Visible only on mobile */}
        <button
          className="btn border-0 d-md-none order-0"
          onClick={toggleSidebar}
        >
          <FiMenu size={20} />
        </button>

        {/* SearchBar - Centered on mobile */}
        <div className="flex-grow-1 d-flex justify-content-center justify-content-md-start">
        <SearchBar />
      </div>

        {/* Right section */}
        <div className="d-flex align-items-center gap-2 gap-md-3 order-2">
          {/* Date - Hidden on mobile */}
          <div className="small text-muted d-none d-md-block">
            <i className="bi-calendar3 me-1 fw-medium"></i>
            <span className="text-muted fw-medium">{formattedDate}</span>
          </div>

          {/* Notification */}
          <button className="btn position-relative p-0">
            <BiBell size={20} />
            <span
              className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark"
              style={{ fontSize: '10px', padding: '.2rem .3rem' }}
            >
              10
            </span>
          </button>

          {/* User Profile */}
          <div className="d-flex align-items-center gap-2">
            <img
              src={UserImage}
              alt="User"
              className="rounded-circle border"
              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            />
            <div className="d-none d-md-block text-start">
              <div className="fw-semibold small">Prasanth</div>
              <div className="text-muted small">Admin</div>
            </div>
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
