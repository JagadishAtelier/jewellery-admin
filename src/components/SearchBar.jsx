import { BiSearch } from "react-icons/bi";

export default function SearchBar() {
  return (
    <div className="input-group bg-light rounded w-100" style={{ maxWidth: '400px', width: '100%' }}>
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
          minWidth: "0",
          width: "100%",
        }}
      />
    </div>
  );
}
