import { useState, useEffect } from "react";

const TELEFONO_VACIO = { tipo: "", numero: "" };

const CAMPO_CONTACTO_VACIO = {
  nombre: "",
  puesto: "",
  correo: "",
  telefono: "",
  nota: "",
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
    telefono2: "",
    paginaWeb: "",
    notas: "",
    contactos: [{ ...CAMPO_CONTACTO_VACIO }],
  });

  useEffect(() => {
    if (initialData) {
        console.log("initialData contactos:", initialData.contactos);
      setForm({
        parqueIndustrialId: initialData.parqueIndustrialId || parqueIndustrialId || "",
        numero:      initialData.numero      || "",
        empresa:     initialData.empresa     || "",
        giroEmpresa: initialData.giroEmpresa || "",
        direccion:   initialData.direccion   || "",
        telefono:    initialData.telefono    || "",
        telefono2:   initialData.telefono2   || "",
        paginaWeb:   initialData.paginaWeb   || "",
        notas:       initialData.notas       || "",
        contactos:
          initialData.contactos?.length > 0
            ? initialData.contactos.map((c) => ({
                nombre:   c.nombre   || "",
                puesto:   c.puesto   || "",
                correo:   c.correo   || "",
                telefono: c.telefono || "",
                nota:     c.nota     || "",       // ← nuevo campo
                fechaUltimoCorreo: c.fechaUltimoCorreo || null,
              }))
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
      contactos: [...prev.contactos, { ...CAMPO_CONTACTO_VACIO, telefonos: [{ ...TELEFONO_VACIO }] }],
    }));
  };

  const eliminarContacto = (index) => {
    setForm((prev) => ({
      ...prev,
      contactos: prev.contactos.filter((_, i) => i !== index),
    }));
  };

  // ── Teléfonos por contacto ──
  const handleTelefonoChange = (contactoIndex, telIndex, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const contactos = [...prev.contactos];
      const telefonos = [...contactos[contactoIndex].telefonos];
      telefonos[telIndex] = { ...telefonos[telIndex], [name]: value };
      contactos[contactoIndex] = { ...contactos[contactoIndex], telefonos };
      return { ...prev, contactos };
    });
  };

  const agregarTelefono = (contactoIndex) => {
    setForm((prev) => {
      const contactos = [...prev.contactos];
      contactos[contactoIndex] = {
        ...contactos[contactoIndex],
        telefonos: [...contactos[contactoIndex].telefonos, { ...TELEFONO_VACIO }],
      };
      return { ...prev, contactos };
    });
  };

  const eliminarTelefono = (contactoIndex, telIndex) => {
    setForm((prev) => {
      const contactos = [...prev.contactos];
      const telefonos = contactos[contactoIndex].telefonos.filter((_, i) => i !== telIndex);
      contactos[contactoIndex] = {
        ...contactos[contactoIndex],
        telefonos: telefonos.length > 0 ? telefonos : [{ ...TELEFONO_VACIO }],
      };
      return { ...prev, contactos };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      contactos: form.contactos
        .map((c) => ({
          ...c,
          telefonos: c.telefonos.filter((t) => t.numero.trim() !== ""),
        }))
        .filter(
          (c) =>
            c.nombre.trim() !== "" ||
            c.puesto.trim() !== "" ||
            c.correo.trim() !== "" ||
            c.nota.trim() !== "" ||
            c.telefonos.length > 0
        ),
    };
    onSubmit(payload);
  };

  return (
    <>
      <style>{`
        .ef-input {
          width: 100%; padding: 0 12px; height: 38px; border-radius: 8px;
          background: #131720; color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 13px; font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none; box-sizing: border-box;
          appearance: none; -webkit-appearance: none;
        }
        .ef-input::placeholder { color: rgba(255,255,255,0.22); }
        .ef-input:focus {
          border-color: rgba(99,130,246,0.6);
          box-shadow: 0 0 0 3px rgba(99,130,246,0.12);
        }
        .ef-textarea {
          width: 100%; padding: 10px 12px; border-radius: 8px;
          background: #131720; color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 13px; font-family: inherit; resize: none;
          outline: none; box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ef-textarea::placeholder { color: rgba(255,255,255,0.22); }
        .ef-textarea:focus {
          border-color: rgba(99,130,246,0.6);
          box-shadow: 0 0 0 3px rgba(99,130,246,0.12);
        }
        .ef-label {
          display: block; font-size: 10.5px; font-weight: 600;
          color: rgba(255,255,255,0.35); text-transform: uppercase;
          letter-spacing: 0.08em; margin-bottom: 5px;
        }
        .ef-section-title {
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.25);
          text-transform: uppercase; letter-spacing: 0.09em;
          padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 12px;
        }
        .ef-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 2px 0; }
        .ef-contact-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px; position: relative;
        }
        .ef-contact-num {
          font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.2);
          text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 10px;
        }
        .ef-add-btn {
          background: none; border: 1px solid rgba(99,130,246,0.3);
          color: #818cf8; font-size: 12px; font-weight: 500;
          padding: 4px 10px; border-radius: 6px; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          transition: background 0.15s, border-color 0.15s; font-family: inherit;
        }
        .ef-add-btn:hover { background: rgba(99,130,246,0.1); border-color: rgba(99,130,246,0.5); }
        .ef-remove-btn {
          position: absolute; top: 10px; right: 10px;
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; font-size: 14px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s;
        }
        .ef-remove-btn:hover { background: rgba(248,113,113,0.18); }
        .ef-btn-cancel {
          padding: 0 18px; height: 38px; border-radius: 8px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s, border-color 0.15s; font-family: inherit;
        }
        .ef-btn-cancel:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.75); }
        .ef-btn-submit {
          padding: 0 20px; height: 38px; border-radius: 8px;
          background: #3b5bff; border: 1px solid rgba(99,130,246,0.4);
          color: #fff; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s; font-family: inherit;
        }
        .ef-btn-submit:hover { background: #2e4ee0; }
        .ef-required-badge {
          font-size: 10px; color: rgba(248,113,113,0.7); font-weight: 500;
          margin-left: 4px; text-transform: none; letter-spacing: 0;
        }
        .ef-nota-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; color: rgba(250,204,21,0.7); font-weight: 500;
          margin-left: 4px; text-transform: none; letter-spacing: 0;
        }

        /* ── Teléfonos múltiples por contacto ── */
        .ef-tel-list {
          display: flex; flex-direction: column; gap: 6px;
        }
        .ef-tel-row {
          display: grid;
          grid-template-columns: 110px 1fr 26px;
          gap: 6px;
          align-items: center;
        }
        .ef-tel-input {
          height: 32px; padding: 0 10px;
        }
        .ef-tel-remove {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; font-size: 13px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s; flex-shrink: 0;
        }
        .ef-tel-remove:hover { background: rgba(248,113,113,0.18); }
        .ef-add-tel-btn {
          background: none; border: 1px dashed rgba(99,130,246,0.35);
          color: #818cf8; font-size: 11.5px; font-weight: 500;
          padding: 5px 10px; border-radius: 6px; cursor: pointer;
          display: flex; align-items: center; gap: 4px; width: fit-content;
          transition: background 0.15s, border-color 0.15s; font-family: inherit;
        }
        .ef-add-tel-btn:hover { background: rgba(99,130,246,0.1); border-color: rgba(99,130,246,0.6); }
      `}</style>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <div className="ef-section-title">Información general</div>

        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 10 }}>
          <div>
            <label className="ef-label">Número</label>
            <input type="text" name="numero" placeholder="001"
              value={form.numero} onChange={handleChange} className="ef-input" />
          </div>
          <div>
            <label className="ef-label">
              Empresa <span className="ef-required-badge">requerido</span>
            </label>
            <input type="text" name="empresa" placeholder="Nombre de la empresa"
              value={form.empresa} onChange={handleChange} className="ef-input" required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="ef-label">Giro de la empresa</label>
            <input type="text" name="giroEmpresa" placeholder="Manufactura, Logística..."
              value={form.giroEmpresa} onChange={handleChange} className="ef-input" />
          </div>
          <div>
            <label className="ef-label">Teléfono / Fax</label>
            <input type="text" name="telefono" placeholder="442 123 4567"
              value={form.telefono} onChange={handleChange} className="ef-input" />
          </div>
        </div>

        <div>
          <label className="ef-label">Dirección</label>
          <input type="text" name="direccion" placeholder="Calle, número, colonia..."
            value={form.direccion} onChange={handleChange} className="ef-input" />
        </div>

        <div>
          <label className="ef-label">Página web</label>
          <input type="url" name="paginaWeb" placeholder="https://www.empresa.com"
            value={form.paginaWeb} onChange={handleChange} className="ef-input" />
        </div>

        <hr className="ef-divider" />

        {/* Contactos */}
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
                <button type="button" onClick={() => eliminarContacto(index)}
                  className="ef-remove-btn" title="Eliminar contacto">×</button>
              )}
              <div className="ef-contact-num">Contacto {index + 1}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="ef-label">Nombre</label>
                  <input type="text" name="nombre" placeholder="Nombre completo"
                    value={contacto.nombre} onChange={(e) => handleContactoChange(index, e)} className="ef-input" />
                </div>
                <div>
                  <label className="ef-label">Puesto / Área</label>
                  <input type="text" name="puesto" placeholder="Gerente, RH..."
                    value={contacto.puesto} onChange={(e) => handleContactoChange(index, e)} className="ef-input" />
                </div>
                <div>
                  <label className="ef-label">Correo electrónico</label>
                  <input type="email" name="correo" placeholder="correo@empresa.com"
                    value={contacto.correo} onChange={(e) => handleContactoChange(index, e)} className="ef-input" />
                </div>

                {/* ── Teléfonos (uno o más) ── */}
                <div>
                  <label className="ef-label">Teléfono(s)</label>
                  <div className="ef-tel-list">
                    {contacto.telefonos.map((tel, telIndex) => (
                      <div key={telIndex} className="ef-tel-row">
                        <input
                          type="text"
                          name="tipo"
                          placeholder="Fijo, Celular..."
                          value={tel.tipo}
                          onChange={(e) => handleTelefonoChange(index, telIndex, e)}
                          className="ef-input ef-tel-input"
                        />
                        <input
                          type="text"
                          name="numero"
                          placeholder="442 123 4567"
                          value={tel.numero}
                          onChange={(e) => handleTelefonoChange(index, telIndex, e)}
                          className="ef-input ef-tel-input"
                        />
                        {contacto.telefonos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarTelefono(index, telIndex)}
                            className="ef-tel-remove"
                            title="Eliminar teléfono"
                          >
                            ×
                          </button>
                        )}
                        {contacto.telefonos.length === 1 && <span />}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <button
                      type="button"
                      onClick={() => agregarTelefono(index)}
                      className="ef-add-tel-btn"
                    >
                      <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Agregar teléfono
                    </button>
                  </div>
                </div>
                <div>
                  <label className="ef-label">Teléfono 2</label>
                  <input type="text" name="telefono2" placeholder="442 987 6543"
                    value={contacto.telefono2 || ""} onChange={(e) => handleContactoChange(index, e)} className="ef-input" />
                </div>
              </div>

              {/* ── Nota del contacto ── */}
              <div style={{ marginTop: 10 }}>
                <label className="ef-label">
                  Nota de seguimiento
                  <span className="ef-nota-badge">✦ por contacto</span>
                </label>
                <textarea
                  name="nota"
                  placeholder="Ej: Interesado en expansión, llamar en agosto..."
                  value={contacto.nota}
                  onChange={(e) => handleContactoChange(index, e)}
                  rows={2}
                  className="ef-textarea"
                />
              </div>

              {/* ── Último correo enviado (solo lectura) ── */}
              {contacto.fechaUltimoCorreo && (
                <div style={{
                  marginTop: 8, display: "flex", alignItems: "center", gap: 6,
                  fontSize: 10, color: "rgba(255,255,255,0.25)",
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "#34d399", display: "inline-block", flexShrink: 0,
                  }} />
                  Último correo enviado:{" "}
                  <span style={{ color: "rgba(52,211,153,0.7)", fontWeight: 500 }}>
                    {new Date(contacto.fechaUltimoCorreo).toLocaleDateString("es-MX", {
                      day: "2-digit", month: "short", year: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <hr className="ef-divider" />

        {/* Notas empresa */}
        <div>
          <label className="ef-label">Notas generales de la empresa</label>
          <textarea name="notas" placeholder="Observaciones adicionales..."
            value={form.notas} onChange={handleChange} rows="3" className="ef-textarea" />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
          <button type="button" onClick={onCancel} className="ef-btn-cancel">Cancelar</button>
          <button type="submit" className="ef-btn-submit">Guardar</button>
        </div>
      </form>
    </>
  );
}