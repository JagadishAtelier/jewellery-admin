import GoldRatesDisplay from "./GoldRatesDisplay"


export const Footer = () => {
  return (
    <footer
      className="bg-white border-top py-3 px-3 d-flex flex-column flex-md-row justify-content-between align-items-center"
      style={{ paddingLeft: "1rem", paddingRight: "1rem",marginLeft:'240px' }}
    >
      <GoldRatesDisplay />
      <small className="text-muted text-center text-md-end mt-2 mt-md-0 d-none d-md-block">
        © {new Date().getFullYear()} Jewelry. All rights reserved to{" "}
        <a href="#" className="text-decoration-none">Atelier</a>.
      </small>

    </footer>
  );
};


