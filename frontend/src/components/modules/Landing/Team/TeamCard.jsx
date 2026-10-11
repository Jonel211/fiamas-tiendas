/**
 * TeamCard
 * Tarjeta individual de un miembro del equipo.
 * Muestra: avatar circular con inicial, nombre y rol.
 */

import './TeamCard.css';

const TeamCard = ({ name, role, initial, color }) => {
  return (
    <article className="team-card" data-reveal>
      <span className="team-card__avatar" style={{ background: color }}>
        {initial}
      </span>
      <h3>{name}</h3>
      <p>{role}</p>
    </article>
  );
};

export default TeamCard;