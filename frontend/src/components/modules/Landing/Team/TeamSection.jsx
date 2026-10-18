/**
 * TeamSection
 * Sección "Quiénes hacemos Fiadito".
 * Grid con las 4 tarjetas del equipo del proyecto.
 */

import { TEAM } from '@/constants/landingData';
import SectionHead from '../shared/SectionHead';
import TeamCard from './TeamCard';
import './TeamSection.css';

const TeamSection = () => {
  return (
    <section className="section" id="equipo">
      <div className="container">
        <SectionHead
          title="Quiénes hacemos Fiadito"
          lead="Un equipo de estudiantes de Tecsup construyendo la herramienta que le hubiera servido al negocio de nuestras familias."
        />

        <div className="team">
          {TEAM.map((member) => (
            <TeamCard key={member.name} {...member} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;