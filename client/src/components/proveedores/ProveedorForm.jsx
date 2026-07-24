import { useState, useEffect } from "react";

const TELEFONO_VACIO = { tipo: "", numero: "" };

const CAMPO_CONTACTO_VACIO = {
  nombre: "",
  puesto: "",
  correo: "",
  telefono: "",
  nota: "",
  telefonos: [{ tipo: "", numero: "" }],
};

const ESTADOS_MEXICO = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
  "Yucatán", "Zacatecas",
];

export default function ProveedorForm({
  initialData,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    numero: "",
    empresa: "",
    giroEmpresa: "",
    direccion: "",
    telefono: "",
    telefonosExtra: [],
    paginaWeb: "",
    notas: "",
    estado: "",
    contactos: [{ ...CAMPO_CONTACTO_VACIO }],
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        numero:      initialData.numero      || "",
        empresa:     initialData.empresa     || "",
        giroEmpresa: initialData.giroEmpresa || "",
        direccion:   initialData.direccion   || "",
        telefono:    initialData.telefono    || "",
        telefonosExtra: initialData.telefonosExtra?.length > 0 ? initialData.telefonosExtra : [],
        paginaWeb:   initialData.paginaWeb   || "",
        notas:       initialData.notas       || "",
        estado:      initialData.estado      || "",
        contactos: initialData.contactos?.length > 0
          ? initialData.contactos.map((c) => ({
              nombre:   c.nombre   || "",
              puesto:   c.puesto   || "",
              correo:   c.correo   || "",
              telefono: c.telefono || "",
              nota:     c.nota     || "",
              fechaUltimoCorreo: c.fechaUltimoCorreo || null,
              telefonos: c.telefonos?.length > 0 ? c.telefonos : [{ tipo: "", numero: "" }],
            }))
          : [{ ...CAMPO_CONTACTO_VACIO }],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ── Teléfonos extra de la empresa ──
  const handleTelefonoExtraChange = (telIndex, e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const telefonosExtra = [...prev.telefonosExtra];
      telefonosExtra[telIndex] = { ...telefonosExtra[telIndex], [name]: value };
      return { ...prev, telefonosExtra };
    });
  };

  const agregarTelefonoExtra = () => {
    setForm((prev) => ({
      ...prev,
      telefonosExtra: [...prev.telefonosExtra, { ...TELEFONO_VACIO }],
    }));
  };

  const eliminarTelefonoExtra = (telIndex) => {
    setForm((prev) => ({
      ...prev,
      telefonosExtra: prev.telefonosExtra.filter((_, i) => i !== telIndex),
    }));
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
      telefonosExtra: form.telefonosExtra.filter((t) => t.numero.trim() !== ""),
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
        .pf-input {
          width: 100%; padding: 0 12px; height: 38px; border-radius: 8px;
          background: #131720; color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 13px; font-family: inherit;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none; box-sizing: border-box;
          appearance: none; -webkit-appearance: none;
        }
        .pf-input::placeholder { color: rgba(255,255,255,0.22); }
        .pf-input:focus {
          border-color: rgba(99,130,246,0.6);
          box-shadow: 0 0 0 3px rgba(99,130,246,0.12);
        }
        .pf-textarea {
          width: 100%; padding: 10px 12px; border-radius: 8px;
          background: #131720; color: #e2e8f0;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 13px; font-family: inherit; resize: none;
          outline: none; box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .pf-textarea::placeholder { color: rgba(255,255,255,0.22); }
        .pf-textarea:focus {
          border-color: rgba(99,130,246,0.6);
          box-shadow: 0 0 0 3px rgba(99,130,246,0.12);
        }
        .pf-label {
          display: block; font-size: 10.5px; font-weight: 600;
          color: rgba(255,255,255,0.35); text-transform: uppercase;
          letter-spacing: 0.08em; margin-bottom: 5px;
        }
        .pf-section-title {
          font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.25);
          text-transform: uppercase; letter-spacing: 0.09em;
          padding-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.06);
          margin-bottom: 12px;
        }
        .pf-divider { border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 2px 0; }
        .pf-contact-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 14px; position: relative;
        }
        .pf-contact-num {
          font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.2);
          text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 10px;
        }
        .pf-add-btn {
          background: none; border: 1px solid rgba(99,130,246,0.3);
          color: #818cf8; font-size: 12px; font-weight: 500;
          padding: 4px 10px; border-radius: 6px; cursor: pointer;
          display: flex; align-items: center; gap: 4px;
          transition: background 0.15s, border-color 0.15s; font-family: inherit;
        }
        .pf-add-btn:hover { background: rgba(99,130,246,0.1); border-color: rgba(99,130,246,0.5); }
        .pf-remove-btn {
          position: absolute; top: 10px; right: 10px;
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; font-size: 14px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s;
        }
        .pf-remove-btn:hover { background: rgba(248,113,113,0.18); }
        .pf-btn-cancel {
          padding: 0 18px; height: 38px; border-radius: 8px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.55); font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s, border-color 0.15s; font-family: inherit;
        }
        .pf-btn-cancel:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.75); }
        .pf-btn-submit {
          padding: 0 20px; height: 38px; border-radius: 8px;
          background: #3b5bff; border: 1px solid rgba(99,130,246,0.4);
          color: #fff; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: background 0.15s; font-family: inherit;
        }
        .pf-btn-submit:hover { background: #2e4ee0; }
        .pf-required-badge {
          font-size: 10px; color: rgba(248,113,113,0.7); font-weight: 500;
          margin-left: 4px; text-transform: none; letter-spacing: 0;
        }
        .pf-nota-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 10px; color: rgba(250,204,21,0.7); font-weight: 500;
          margin-left: 4px; text-transform: none; letter-spacing: 0;
        }

        /* ── Teléfonos múltiples por contacto ── */
        .pf-tel-list {
          display: flex; flex-direction: column; gap: 6px;
        }
        .pf-tel-row {
          display: grid;
          grid-template-columns: 110px 1fr 26px;
          gap: 6px;
          align-items: center;
        }
        .pf-tel-input {
          height: 32px; padding: 0 10px;
        }
        .pf-tel-remove {
          width: 22px; height: 22px; border-radius: 50%;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2);
          color: #f87171; font-size: 13px; line-height: 1;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.15s; flex-shrink: 0;
        }
        .pf-tel-remove:hover { background: rgba(248,113,113,0.18); }
        .pf-add-tel-btn {
          background: none; border: 1px dashed rgba(99,130,246,0.35);
          color: #818cf8; font-size: 11.5px; font-weight: 500;
          padding: 5px 10px; border-radius: 6px; cursor: pointer;
          display: flex; align-items: center; gap: 4px; width: fit-content;
          transition: background 0.15s, border-color 0.15s; font-family: inherit;
        }
        .pf-add-tel-btn:hover { background: rgba(99,130,246,0.1); border-color: rgba(99,130,246,0.6); }
      `}</style>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

        <div className="pf-section-title">Información general</div>

        <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 10 }}>
          <div>
            <label className="pf-label">Número</label>
            <input type="text" name="numero" placeholder="001"
              value={form.numero} onChange={handleChange} className="pf-input" />
          </div>
          <div>
            <label className="pf-label">
              Empresa <span className="pf-required-badge">requerido</span>
            </label>
            <input type="text" name="empresa" placeholder="Nombre de la empresa"
              value={form.empresa} onChange={handleChange} className="pf-input" required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label className="pf-label">Giro de la empresa</label>
            <input type="text" name="giroEmpresa" placeholder="Manufactura, Logística..."
              value={form.giroEmpresa} onChange={handleChange} className="pf-input" />
          </div>
          <div>
            <label className="pf-label">Teléfono / Fax</label>
            <input type="text" name="telefono" placeholder="442 123 4567"
              value={form.telefono} onChange={handleChange} className="pf-input" />
          </div>
        </div>

        {/* ── Estado (sin categoría, esto solo aplica a proveedores) ── */}
        <div>
          <label className="pf-label">Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} className="pf-input">
            <option value="">— Elige un estado —</option>
            {ESTADOS_MEXICO.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <label className="pf-label" style={{ marginBottom: 0 }}>Teléfonos adicionales</label>
            <button type="button" onClick={agregarTelefonoExtra} className="pf-add-tel-btn">
              <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Agregar teléfono
            </button>
          </div>
          {form.telefonosExtra.length > 0 && (
            <div className="pf-tel-list">
              {form.telefonosExtra.map((tel, telIndex) => (
                <div key={telIndex} className="pf-tel-row">
                  <input
                    type="text"
                    name="tipo"
                    placeholder="Fijo, Celular..."
                    value={tel.tipo}
                    onChange={(e) => handleTelefonoExtraChange(telIndex, e)}
                    className="pf-input pf-tel-input"
                  />
                  <input
                    type="text"
                    name="numero"
                    placeholder="442 123 4567"
                    value={tel.numero}
                    onChange={(e) => handleTelefonoExtraChange(telIndex, e)}
                    className="pf-input pf-tel-input"
                  />
                  <button
                    type="button"
                    onClick={() => eliminarTelefonoExtra(telIndex)}
                    className="pf-tel-remove"
                    title="Eliminar teléfono"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="pf-label">Dirección</label>
          <input type="text" name="direccion" placeholder="Calle, número, colonia..."
            value={form.direccion} onChange={handleChange} className="pf-input" />
        </div>

        <div>
          <label className="pf-label">Página web</label>
          <input type="url" name="paginaWeb" placeholder="https://www.empresa.com"
            value={form.paginaWeb} onChange={handleChange} className="pf-input" />
        </div>

        <hr className="pf-divider" />

        {/* Contactos */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="pf-section-title" style={{ marginBottom: 0, borderBottom: "none", paddingBottom: 0 }}>
            Contactos
          </div>
          <button type="button" onClick={agregarContacto} className="pf-add-btn">
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Agregar
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {form.contactos.map((contacto, index) => (
            <div key={index} className="pf-contact-card">
              {form.contactos.length > 1 && (
                <button type="button" onClick={() => eliminarContacto(index)}
                  className="pf-remove-btn" title="Eliminar contacto">×</button>
              )}
              <div className="pf-contact-num">Contacto {index + 1}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="pf-label">Nombre</label>
                  <input type="text" name="nombre" placeholder="Nombre completo"
                    value={contacto.nombre} onChange={(e) => handleContactoChange(index, e)} className="pf-input" />
                </div>
                <div>
                  <label className="pf-label">Puesto / Área</label>
                  <input type="text" name="puesto" placeholder="Gerente, RH..."
                    value={contacto.puesto} onChange={(e) => handleContactoChange(index, e)} className="pf-input" />
                </div>
                <div>
                  <label className="pf-label">Correo electrónico</label>
                  <input type="email" name="correo" placeholder="correo@empresa.com"
                    value={contacto.correo} onChange={(e) => handleContactoChange(index, e)} className="pf-input" />
                </div>

                {/* ── Teléfonos (uno o más) ── */}
                <div>
                  <label className="pf-label">Teléfono(s)</label>
                  <div className="pf-tel-list">
                    {contacto.telefonos.map((tel, telIndex) => (
                      <div key={telIndex} className="pf-tel-row">
                        <input
                          type="text"
                          name="tipo"
                          placeholder="Fijo, Celular..."
                          value={tel.tipo}
                          onChange={(e) => handleTelefonoChange(index, telIndex, e)}
                          className="pf-input pf-tel-input"
                        />
                        <input
                          type="text"
                          name="numero"
                          placeholder="442 123 4567"
                          value={tel.numero}
                          onChange={(e) => handleTelefonoChange(index, telIndex, e)}
                          className="pf-input pf-tel-input"
                        />
                        {contacto.telefonos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarTelefono(index, telIndex)}
                            className="pf-tel-remove"
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
                      className="pf-add-tel-btn"
                    >
                      <span style={{ fontSize: 13, lineHeight: 1 }}>+</span> Agregar teléfono
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Nota del contacto ── */}
              <div style={{ marginTop: 10 }}>
                <label className="pf-label">
                  Nota de seguimiento
                  <span className="pf-nota-badge">✦ por contacto</span>
                </label>
                <textarea
                  name="nota"
                  placeholder="Ej: Interesado en expansión, llamar en agosto..."
                  value={contacto.nota}
                  onChange={(e) => handleContactoChange(index, e)}
                  rows={2}
                  className="pf-textarea"
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

        <hr className="pf-divider" />

        {/* Notas empresa */}
        <div>
          <label className="pf-label">Notas generales</label>
          <textarea name="notas" placeholder="Observaciones adicionales..."
            value={form.notas} onChange={handleChange} rows="3" className="pf-textarea" />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 }}>
          <button type="button" onClick={onCancel} className="pf-btn-cancel">Cancelar</button>
          <button type="submit" className="pf-btn-submit">Guardar</button>
        </div>
      </form>
    </>
  );
}