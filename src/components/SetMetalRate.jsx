import { Modal, Button, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import {
  getGoldRates,
  updateGoldRate,
} from "../api/goldRateApi";
import {
  getSilverRates,
  updateSilverRate,
} from "../api/silverRateapi.js";
import {
  getPlatinumRates,
  updatePlatinumRate,
} from "../api/platinumRateApi";

const karats = ["24k", "22k", "18k"];

const UpdateRateModal = ({ show, handleClose, metal }) => {
  const [form, setForm] = useState({ "24k": "", "22k": "", "18k": "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🟡 Fetch latest rate when modal opens
 useEffect(() => {
  const fetchLatest = async () => {
    if (show && metal) {
      setLoading(true);
      try {
        const getRateApi = {
          gold: getGoldRates,
          silver: getSilverRates,
          platinum: getPlatinumRates,
        };

        const metalKey = metal.toLowerCase();
        const fetchFunc = getRateApi[metalKey];

        const latest = await fetchFunc();
        const normalizedRates = latest.data.reduce((acc, entry) => {
          acc[entry.karat] = entry.ratePerGram.toFixed(2);
          return acc;
        }, {});

        setForm((prev) => ({
          ...prev,
          ...karats.reduce((acc, k) => {
            acc[k] = normalizedRates[k] || "";
            return acc;
          }, {}),
        }));
      } catch (err) {
        console.error("Failed to load latest rates:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  fetchLatest();
}, [show, metal]);




  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

 const handleSubmit = async () => {
  setSaving(true);
  try {
    const updateRateApi = {
      gold: updateGoldRate,
      silver: updateSilverRate,
      platinum: updatePlatinumRate,
    };

    const metalKey = metal.toLowerCase();
    const updateFunc = updateRateApi[metalKey];

    for (const karat of karats) {
      const ratePerGram = parseFloat(form[karat]);
      if (!isNaN(ratePerGram)) {
        await updateFunc({ karat, ratePerGram });
      }
    }
    handleClose(true);
  } catch (err) {
    console.error("Rate update failed:", err);
    handleClose(false);
  } finally {
    setSaving(false);
  }
};

  return (
    <Modal show={show} onHide={() => handleClose(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Update {metal?.charAt(0).toUpperCase() + metal?.slice(1)} Rates</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center text-muted">Fetching latest rates...</div>
        ) : (
          <Form>
            {karats.map((karat) => (
              <Form.Group key={karat} className="mb-3">
                <Form.Label>{karat.toUpperCase()} Rate (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name={karat}
                  value={form[karat]}
                  onChange={handleChange}
                  placeholder={`Enter ${karat} rate`}
                />
              </Form.Group>
            ))}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => handleClose(false)} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={saving || loading}>
          {saving ? "Saving..." : "Update"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UpdateRateModal;
