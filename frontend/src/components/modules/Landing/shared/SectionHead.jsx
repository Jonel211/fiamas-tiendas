/**
 * SectionHead
 * Encabezado reutilizable para secciones: título centrado + subtítulo.
 * Se usa en Características, Cómo funciona, Equipo y FAQ.
 */

import './SectionHead.css';  

const SectionHead = ({ title, lead }) => {
  return (
    <div className="section__head" data-reveal>
      <h2 className="section__title">{title}</h2>
      {lead && <p className="section__lead">{lead}</p>}
    </div>
  );
};

export default SectionHead;