import { BiSearch } from "react-icons/bi"; // Or use Bootstrap icon: <i className="bi bi-search"></i>

export default function SearchBar() {
  return (
    <div className="input-group bg-light rounded" style={{ maxWidth: 440 }}>
      <span className="input-group-text bg-transparent border-0">
        <BiSearch className="text-muted" />
      </span>
      <input
        type="text"
        className="form-control border-0 bg-light text-muted"
        placeholder="Search ..."
        style={{
          boxShadow: "none",
          backgroundColor: "#f8f9fa",
          width:"400px",
          height:"auto"
        }}
      />
    </div>
  );
}
