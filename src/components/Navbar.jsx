import UserImage from '../assets/user.jpg';
import { FiMenu } from 'react-icons/fi';
import { BiBell } from 'react-icons/bi'; // Notification icon
import { BsSun } from 'react-icons/bs'; // Theme toggle placeholder
import SearchBar from './SearchBar';

const Navbar = ({ toggleSidebar }) => {
  const today = new Date();

// Helper to get ordinal suffix (st, nd, rd, th)
const getOrdinalSuffix = (day) => {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1: return `${day}st`;
    case 2: return `${day}nd`;
    case 3: return `${day}rd`;
    default: return `${day}th`;
  }
};

const dayName = today.toLocaleDateString('en-GB', { weekday: 'long' }); // e.g., "Friday"
const monthName = today.toLocaleDateString('en-GB', { month: 'long' });  // e.g., "May"
const dayWithSuffix = getOrdinalSuffix(today.getDate());
const year = today.getFullYear();

const formattedDate = `${dayName} ${dayWithSuffix} ${monthName} ${year}`;

console.log(formattedDate); // ➜ "Friday 16th May 2025"


  return (
    <nav className="navbar navbar-expand-lg bg-transprent px-4 py-3">
      <div className="d-flex align-items-center w-100 justify-content-between">

        {/* Left Section: Sidebar toggle + Rates */}
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <button
            className="btn btn-light border d-md-none"
            onClick={toggleSidebar}
          >
            <FiMenu size={20} />
          </button>
          <SearchBar/>
        </div>

        {/* Right Section: Date, Icons, User */}
        <div className="d-flex align-items-center gap-3">
          <div className="small text-muted d-none d-md-block">
            <i className='bi-calendar3 me-1 fw-medium'></i>
            <span className="text-muted fw-medium">{formattedDate}</span>
          </div>
          <button className="btn  py-2">
            <BiBell size={20} /> <span style={{position:"absolute", top:"25%",fontSize:'10px', padding:'.2rem .3rem'}} className='small text-light rounded-pill bg-dark'>10</span>
          </button>
{/* 
          <button className="btn btn-light rounded-circle shadow-sm py-2 d-none d-md-inline">
            <BsSun size={18} />
          </button> */}

          <div className="d-flex align-items-center gap-2">
            <img
              src={UserImage}
              alt="User"
              className="rounded-circle border"
              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
            />
            <div className="d-none d-md-block">
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
