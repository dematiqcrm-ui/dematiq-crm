import { useState, useEffect } from "react";

const CAMPO_CONTACTO_VACIO = {
  nombre: "",
  puesto: "",
  correo: "",
  telefono: "",
};

export default function EmpresaForm({
  initialData,
  parqueIndustrialId,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    parqueIndustrialId: parqueIndustrialId || "",
    numero: "",
    empresa: "",
    giroEmpresa: "",
    direccion: "",
    telefono: "",
    paginaWeb: "",
    notas: "",
    contactos: [{ ...CAMPO_CONTACTO_VACIO }],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        parqueIndustrialId:
          initialData.parqueIndustrialId || parqueIndustrialId || "",
        numero: initialData.numero || "",
        empresa: initialData.empresa || "",
        giroEmpresa: initialData.giroEmpresa || "",
        direccion: initialData.direccion || "",
        telefono: initialData.telefono || "",
        paginaWeb: initialData.paginaWeb || "",
        notas: initialData.notas || "",
        contactos:
          initialData.contactos?.length > 0
            ? initialData.contactos
            : [{ ...CAMPO_CONTACTO_VACIO }],
      });
    }
  }, [initialData, parqueIndustrialId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContactoChange = (index, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const contactos = [...prev.contactos];
      contactos[index] = { ...contactos[index], [name]: value };
      return { ...prev, contactos };
    });
  };

  const agregarContacto = () => {
    setForm((prev) => ({
      ...prev,
      contactos: [...prev.contactos, { ...CAMPO_CONTACTO_VACIO }],
    }));
  };

  const eliminarContacto = (index) => {
    setForm((prev) => ({
      ...prev,
      contactos: prev.contactos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      contactos: form.contactos.filter((c) =>
        Object.values(c).some((v) => v.trim() !== "")
      ),
    };
    onSubmit(payload);
  };

  return (
    <>
      <style>{`
        .ef-input {
          width: 100%;
          padding: 0 12px;
          height: 38px;
          border-radius: 8px;
          background: #131720;
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 13px;
          font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          box-sizing: border-box;
          appearance: none;
          -webkit-appearance: none;
        }
        .ef-input::placeholder { color: rgba(255,255,255,0.22); }
        .ef-input:focus {
          border-color: rgba(99,130,246,0.6);
          box-shadow: 0 0 0 3px rgba(99,130,246,0.12);
        }
        select.ef-input {
          background-color: #131720;
          color: #e2e8f0;
          cursor: pointer;
        }
        select.ef-input option {
          background-color: #1a2035;
          color: #e2e8f0;
        }
        .ef-textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 8px;
          background: #131720;
          color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 13px;
          font-family: inherit;
          resize: none;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ef-textarea::placeholder { color: rgba(255,255,255,0.22); }
        .ef-textarea:focus {
          border-color: rgba(99,130,246,0.6);
          box-shadow: 0 0 0 3px rgba(99,130,246,0.12);
        }
        .ef-label {
          display: block;
          font-size: 10.5px;
          font-weight: 600;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 5px;
        }
        .ef-section-title {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          letter-spacing: 0.09em;
          padding-bottom: 8px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 12px;
        }
        .ef-divider {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin: 2px 0;
        }
        .ef-contact-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 14px;
          position: relative;
        }
        .ef-contact-num {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.2);
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin-bottom: 10px;
        }
        .ef-add-btn {
          background: none;
          border: 1px solid rgba(99,130,246,0.3);
          color: #818cf8;
          font-size: 12px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: background 0.15s, border-color 0.15s;
          font-family: inherit;
        }
        .ef-add-btn:hover {
          background: rgba(99,130,246,0.1);
          border-color: rgba(99,130,246,0.5);
        }
        .ef-remove-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          color: #f87171;
          font-size: 14px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s;
        }
        .ef-remove-btn:hover { background: rgba(248,113,113,0.18); }
        .ef-btn-cancel {
          padding: 0 18px;
          height: 38px;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.55);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
          font-family: inherit;
        }
        .ef-btn-cancel:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.75);
        }
        .ef-btn-submit {
          padding: 0 20px;
          height: 38px;
          border-radius: 8px;
          background: #3b5bff;
          border: 1px solid rgba(99,130,246,0.4);
          color: #fff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
          font-family: inherit;
        }
        .ef-btn-submit:hover { background: #2e4ee0; }
        .ef-required-badge {
          font-size: 10px;
          color: rgba(248,113,113,0.7);
          font-weight: 500;
          margin-left: 4px;
          text-transform: none;
          letter-spacing: 0;
        }
      `}</style>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Sección: Información general */}
        <div className="ef-section-title">Información general</div>

        {/* Fila 1: Número + Empresa */}
        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 10 }}>
          <div>
            <label className="ef-label">Número</label>
            <input
              type="text"
              name="numero"
              placeholder="001"
              value={form.numero}
              onChange={handleChange}
              className="ef-input"
            />
          </div>
          <div>
            <label className="ef-label">
              Empresa <span className="ef-required-badge">requerido</span>
            </label>
            <input
              type="text"
              name="empresa"
              placeholder="Nombre de la empresa"
              value={form.empresa}
              onChange={handleChange}
              className="ef-input"
              required
            />
          </div>
        </div>

        {/* Fila 2: Giro + Teléfono */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="ef-label">Giro de la empresa</label>
            <input
              type="text"
              name="giroEmpresa"
              placeholder="Manufactura, Logística..."
              value={form.giroEmpresa}
              onChange={handleChange}
              className="ef-input"
            />
          </div>
          <div>
            <label className="ef-label">Teléfono / Fax</label>
            <input
              type="text"
              name="telefono"
              placeholder="442 123 4567"
              value={form.telefono}
              onChange={handleChange}
              className="ef-input"
            />
          </div>
        </div>

        {/* Dirección */}
        <div>
          <label className="ef-label">Dirección</label>
          <input
            type="text"
            name="direccion"
            placeholder="Calle, número, colonia..."
            value={form.direccion}
            onChange={handleChange}
            className="ef-input"
          />
        </div>

        {/* Página web */}
        <div>
          <label className="ef-label">Página web</label>
          <input
            type="url"
            name="paginaWeb"
            placeholder="https://www.empresa.com"
            value={form.paginaWeb}
            onChange={handleChange}
            className="ef-input"
          />
        </div>

        <hr className="ef-divider" />

        {/* Sección: Contactos */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="ef-section-title" style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
            Contactos
          </div>
          <button type="button" onClick={agregarContacto} className="ef-add-btn">
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Agregar
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {form.contactos.map((contacto, index) => (
            <div key={index} className="ef-contact-card">
              {form.contactos.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarContacto(index)}
                  className="ef-remove-btn"
                  title="Eliminar contacto"
                >
                  ×
                </button>
              )}
              <div className="ef-contact-num">Contacto {index + 1}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="ef-label">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre completo"
                    value={contacto.nombre}
                    onChange={(e) => handleContactoChange(index, e)}
                    className="ef-input"
                  />
                </div>
                <div>
                  <label className="ef-label">Puesto / Área</label>
                  <input
                    type="text"
                    name="puesto"
                    placeholder="Gerente, RH..."
                    value={contacto.puesto}
                    onChange={(e) => handleContactoChange(index, e)}
                    className="ef-input"
                  />
                </div>
                <div>
                  <label className="ef-label">Correo electrónico</label>
                  <input
                    type="email"
                    name="correo"
                    placeholder="correo@empresa.com"
                    value={contacto.correo}
                    onChange={(e) => handleContactoChange(index, e)}
                    className="ef-input"
                  />
                </div>
                <div>
                  <label className="ef-label">Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="442 123 4567"
                    value={contacto.telefono}
                    onChange={(e) => handleContactoChange(index, e)}
                    className="ef-input"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <hr className="ef-divider" />

        {/* Notas */}
        <div>
          <label className="ef-label">Notas</label>
          <textarea
            name="notas"
            placeholder="Observaciones adicionales..."
            value={form.notas}
            onChange={handleChange}
            rows="3"
            className="ef-textarea"
          />
        </div>

        {/* Botones */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
          <button type="button" onClick={onCancel} className="ef-btn-cancel">
            Cancelar
          </button>
          <button type="submit" className="ef-btn-submit">
            Guardar
          </button>
        </div>
      </form>
    </>
  );
}