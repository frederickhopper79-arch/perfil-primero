import { chileRegions, jobAreas, popularSearches, seniorityLevels } from "@/lib/domain/catalogs";

export function DirectoryLinks() {
  return (
    <section className="directoryBand" aria-label="Explorar perfiles">
      <DirectoryColumn title="Provincia" items={chileRegions.map((region) => region.name)} />
      <DirectoryColumn title="Área" items={jobAreas} />
      <DirectoryColumn title="Nivel laboral" items={seniorityLevels} />
      <DirectoryColumn title="Puestos mas buscados" items={popularSearches} />
    </section>
  );
}

function DirectoryColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="directoryColumn">
      <h2>{title}</h2>
      <div>
        {items.map((item) => (
          <a href={`/empresa?filtro=${encodeURIComponent(item)}`} key={item}>{item}</a>
        ))}
      </div>
    </div>
  );
}
