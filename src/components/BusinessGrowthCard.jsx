import HighlightedMap from "./HighlightedMap";

export const BusinessGrowthCard = () => {
  const countriesData = [
    {
      name: "India",
      code: "IN",
      flag: "🇮🇳",
      customers: 231240,
      percentage: 67,
      color: "#e65f3d",
    },
    {
      name: "UAE",
      code: "AE",
      flag: "🇦🇪",
      customers: 198240,
      percentage: 36,
      color: "#30daa0",
    },
    {
      name: "Pakistan",
      code: "PK",
      flag: "🇵🇰",
      customers: 8420,
      percentage: 14,
      color: "#1c9952",
    },
  ];

  return (
    <div
      className="card shadow-sm rounded-4 w-100"
      style={{ maxWidth: "100%", height: "100%" }}
    >
      <div className="card-body">
        <h5 className="card-title mb-1 fw-semibold">Business Growth</h5>
        <p className="text-muted small">Based on Country</p>

        <HighlightedMap countriesData={countriesData} />

        {countriesData.map((country) => (
          <div
            key={country.code}
            className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2"
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className=" overflow-hidden"
                style={{
                  width: "42px",
                  aspectRatio: "1",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              >
                <img
                  src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                  alt={`${country.name} flag`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "50%",
                    display: "block",
                  }}
                />
              </div>

              <div>
                <div className="fw-semibold">{country.name}</div>
                <div className="text-muted small">
                  {new Intl.NumberFormat().format(country.customers)} Customers
                </div>
              </div>
            </div>
            <div className="text-start text-sm-end w-30 w-sm-50">
              <div className="progress" style={{ height: "6px" }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${country.percentage}%`,
                    backgroundColor: country.color,
                  }}
                  role="progressbar"
                  aria-valuenow={country.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <div className="small text-muted mt-1">{country.percentage}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
