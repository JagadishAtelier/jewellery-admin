import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function TargetCard({
  percentage = 62.28,
  target = 1.2,
  revenue = 0.298,
  sells = 0.747,
}) {
  const success = percentage >= 100;
  const remaining = 100 - percentage;

  return (
    <div className="targe-card bg-white border-0 shadow-sm p-4 rounded-4" style={{  height:" -webkit-fill-available"}}
>
      <h6 className="fw-bold mb-1">Target</h6>
      <p className="text-muted small mb-3">Revenue Target / Today</p>

      <div style={{ width: 250, margin: "0 auto" }} className="mb-3">
        <CircularProgressbarWithChildren
          value={percentage}
          strokeWidth={7}
          styles={buildStyles({
            trailColor: "#e9ecef",
            pathColor: "#b58900",
          })}
        >
          <div className="text-center">
            <div className="fw-bold fs-4">{percentage.toFixed(2)}%</div>
            {success ? (
              <div className="text-success small fw-semibold">Target Achieved!</div>
            ) : (
              <div className="text-danger small fw-semibold">
                -{remaining.toFixed(2)}%
              </div>
            )}
          </div>
        </CircularProgressbarWithChildren>
      </div>

      <p className="text-center small mb-4">
        You succeeded to earn <strong>₹ {sells}M</strong> today,
        <br />
        Current Sells Revenue is <strong>{percentage.toFixed(0)}%</strong>!
      </p>

      <div className="row text-center small border-top pt-3">
        <div className="col">
          <div className="text-muted">Target</div>
          <div className="fw-semibold">
            ₹ {target}M <FaArrowDown className="text-danger ms-1" />
          </div>
        </div>
        <div className="col">
          <div className="text-muted">Revenue</div>
          <div className="fw-semibold">
            ₹ {(revenue * 1000).toFixed(0)}k <FaArrowUp className="text-success ms-1" />
          </div>
        </div>
        <div className="col">
          <div className="text-muted">Sells</div>
          <div className="fw-semibold">
            ₹ {(sells * 1000).toFixed(0)}k <FaArrowUp className="text-success ms-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
