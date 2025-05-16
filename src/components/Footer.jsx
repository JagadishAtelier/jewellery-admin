import GoldRatesDisplay from "./GoldRatesDisplay"


export const Footer = () => {
  return (
<footer className="bg-white border-top d-flex justify-content-between py-2 px-3 ml-5" style={{marginLeft: "240px", paddingLeft: "30px"}}>
      <GoldRatesDisplay />
      <small className="text-muted d-block mt-2">
        © {new Date().getFullYear()} Jewelry. All rights reserved to{" "}
        <a href="#" style={{ textDecoration: "none" }}>Atelier</a>.
      </small>
    </footer>
  )
}

