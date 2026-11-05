import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const lastUpdated = { es: "5 de noviembre de 2026", en: "November 5, 2026" };
const githubIssues = "https://github.com/Jairo0811/CineRD/issues/new";
const rawEmail = import.meta.env.VITE_CONTACT_EMAIL?.trim() || "";
const contactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail) ? rawEmail : null;

// Public, readable content. Keep aligned with actual deployment capabilities.
// The Cloudflare demo currently exposes a public catalog, not user accounts.
const content = {
  es: {
    privacy: {
      label: "TRANSPARENCIA Y PROTECCIÓN DE DATOS",
      title: "Política de Privacidad",
      intro: "Conoce qué información puede tratar CineRD, por qué se utiliza y cómo ejercer tus derechos.",
      sections: [
        { heading: "1. Sobre CineRD", paragraphs: [
          "CineRD es un proyecto independiente de información, descubrimiento y preservación del cine dominicano. Su versión pública actual en Cloudflare Pages funciona como catálogo de consulta y demostración.",
          "Las funciones de registro, verificación de talento, reclamaciones y administración forman parte del sistema completo, pero pueden no estar disponibles en la demostración pública."
        ] },
        { heading: "2. Información que podemos tratar", paragraphs: [
          "La versión pública ofrece información cinematográfica y profesional de películas y talentos, como nombres, filmografías, créditos y fotografías. Los proveedores de alojamiento pueden procesar datos técnicos de acceso, incluida la dirección IP, para entregar y proteger el sitio.",
          "Cuando se habiliten servicios con cuentas, CineRD podrá tratar datos aportados por el usuario, como nombre, correo, credenciales protegidas, solicitudes de verificación, reclamaciones y registros de seguridad. No solicitamos que se compartan documentos privados mediante incidencias públicas."
        ] },
        { heading: "3. Uso de la información", paragraphs: [
          "La información sirve para presentar el catálogo, mantener su precisión editorial, responder a correcciones, proteger el servicio y, cuando estén disponibles, gestionar cuentas y verificaciones.",
          "Solo se tratarán los datos necesarios para las funcionalidades activadas. Los materiales enviados como evidencia privada no deben exponerse públicamente ni utilizarse para publicidad."
        ] },
        { heading: "4. Almacenamiento local y cookies", paragraphs: [
          "CineRD guarda preferencias de idioma y tema visual en el almacenamiento local del navegador. Cuando se habiliten funciones autenticadas, podrán utilizarse cookies necesarias para la sesión y la seguridad.",
          "Actualmente la preparación técnica de Google AdSense no significa que se estén mostrando anuncios: la publicidad permanece desactivada mientras el sitio no esté aprobado y configurado."
        ] },
        { heading: "5. Publicidad de terceros", paragraphs: [
          "Si se activa Google AdSense, Google y otros proveedores publicitarios pueden utilizar cookies, identificadores, direcciones IP y tecnologías similares para mostrar, medir y proteger anuncios. Los anuncios pueden basarse en visitas anteriores a este u otros sitios, según la configuración y el consentimiento aplicables.",
          "Puedes gestionar la personalización desde la configuración de anuncios de Google. Cuando corresponda, CineRD implantará un mecanismo de consentimiento compatible con las exigencias aplicables antes de activar la publicidad."
        ] },
        { heading: "6. Proveedores y enlaces externos", paragraphs: [
          "El alojamiento público utiliza Cloudflare Pages. El catálogo puede incluir enlaces a sitios de terceros, como TMDb, YouTube, Spotify o redes sociales. Cada servicio externo tiene sus propias políticas y puede tratar información cuando lo visitas.",
          "La incorporación futura de analítica o servicios de publicidad se reflejará en esta política cuando se habiliten efectivamente."
        ] },
        { heading: "7. Conservación y seguridad", paragraphs: [
          "Las preferencias locales permanecen en el navegador hasta que se eliminen. Otros registros se conservarán solo durante el tiempo necesario para la finalidad correspondiente, las obligaciones aplicables y la protección del servicio.",
          "Se aplican medidas de seguridad acordes a cada componente activo. Ningún sistema en Internet ofrece una garantía absoluta contra incidentes."
        ] },
        { heading: "8. Solicitudes y correcciones", paragraphs: [
          "Puedes notificar errores del catálogo o solicitar una corrección mediante los canales publicados en la página de Contacto. No publiques identificaciones, direcciones, documentos ni otras evidencias confidenciales en GitHub Issues.",
          "Para solicitudes privadas sobre datos personales es necesario disponer de un canal privado oficial. Este canal aún está pendiente de configuración para la demostración pública."
        ] },
        { heading: "9. Menores y actualizaciones", paragraphs: [
          "CineRD no está dirigido específicamente a menores. Podemos actualizar esta política si cambian las funcionalidades, los proveedores o las obligaciones aplicables. La fecha visible indica la versión publicada."
        ] }
      ],
      resourcesTitle: "Información y opciones relacionadas",
      resources: [
        { label: "Configuración de anuncios de Google", href: "https://myadcenter.google.com/" },
        { label: "Cómo utiliza Google la información", href: "https://policies.google.com/technologies/partner-sites" }
      ]
    },
    terms: {
      label: "USO RESPONSABLE DEL ARCHIVO",
      title: "Términos de Uso",
      intro: "Condiciones de consulta, participación y uso de los contenidos y servicios de CineRD.",
      sections: [
        { heading: "1. Naturaleza del servicio", paragraphs: [
          "CineRD es una plataforma independiente para descubrir y organizar información del cine dominicano. No representa oficialmente a artistas, productoras, instituciones ni servicios externos salvo indicación expresa.",
          "El sitio público ofrece un catálogo informativo y no aloja ni distribuye películas mediante streaming."
        ] },
        { heading: "2. Exactitud y carácter editorial", paragraphs: [
          "Trabajamos para mantener datos correctos y verificables; aun así, puede haber errores, información incompleta o cambios posteriores. El contenido se ofrece con fines informativos y no equivale a una certificación oficial.",
          "Las solicitudes de corrección se evaluarán con fuentes y evidencias apropiadas, sin garantía de aceptación automática."
        ] },
        { heading: "3. Cuentas y funciones restringidas", paragraphs: [
          "Cuando se activen el registro, la verificación de talento y las reclamaciones, los usuarios deberán suministrar información veraz, respetar los permisos asignados y no intentar acceder a datos de terceros.",
          "CineRD podrá limitar las funciones de cuentas que se usen para suplantación, fraude, abuso o vulneración de la seguridad."
        ] },
        { heading: "4. Propiedad intelectual", paragraphs: [
          "Los derechos sobre películas, fotografías, carteles, marcas, tráileres y otros materiales pertenecen a sus titulares respectivos. Su presencia en CineRD no implica cesión de derechos ni autorización de reproducción o explotación comercial.",
          "Los usuarios no deben enviar contenidos que no tengan derecho a compartir. Las reclamaciones fundamentadas de derechos podrán dar lugar a la revisión o retirada de material."
        ] },
        { heading: "5. Uso permitido", paragraphs: [
          "Puedes explorar y enlazar el contenido público respetando las leyes, los derechos de terceros y el funcionamiento del servicio. No debes intentar extraer información privada, interferir con la plataforma, automatizar solicitudes abusivas ni alterar identidades o créditos."
        ] },
        { heading: "6. Servicios y enlaces de terceros", paragraphs: [
          "Los enlaces a TMDb, YouTube, Spotify y otros servicios son informativos. Sus condiciones, licencias y políticas son independientes de CineRD y pueden cambiar."
        ] },
        { heading: "7. Disponibilidad y cambios", paragraphs: [
          "El servicio puede modificarse, interrumpirse o suspenderse por mantenimiento, seguridad, revisión editorial o evolución técnica. No se garantiza disponibilidad ininterrumpida ni se ofrecen por ahora funciones comerciales o streaming."
        ] },
        { heading: "8. Publicidad y patrocinios", paragraphs: [
          "Si se habilita publicidad, los espacios publicitarios deberán distinguirse del contenido editorial. Los pagos o patrocinios no determinan la autenticidad de créditos profesionales ni la verificación de perfiles."
        ] },
        { heading: "9. Comunicaciones y vigencia", paragraphs: [
          "Las observaciones públicas y avisos de errores pueden realizarse desde la página de Contacto. No se deben publicar datos confidenciales en canales públicos.",
          "Estos términos podrán actualizarse y mostrarán la fecha de la versión vigente. El contenido debe revisarse jurídicamente antes del lanzamiento comercial definitivo."
        ] }
      ]
    },
    contact: {
      label: "COMUNIDAD Y COLABORACIÓN",
      title: "Contacto",
      intro: "Ayúdanos a construir un catálogo más preciso del cine dominicano.",
      publicHeading: "Correcciones y sugerencias públicas",
      publicText: "¿Encontraste un error en una filmografía, un crédito, una fecha o una película? Puedes abrir una incidencia en el repositorio oficial. Describe el problema y adjunta, si es posible, una fuente pública verificable.",
      action: "Abrir incidencia en GitHub",
      caution: "Importante: las incidencias de GitHub son públicas. No incluyas documentos de identidad, teléfonos privados, contraseñas, direcciones, evidencias confidenciales ni información sensible.",
      privateHeading: "Asuntos privados y solicitudes sobre datos",
      privateAvailable: "Para solicitudes de privacidad, derechos de imagen o comunicaciones confidenciales, escribe a este correo oficial:",
      privatePending: "El correo privado oficial de CineRD aún no está configurado en esta demostración. No envíes información confidencial por el canal público. Este canal se habilitará antes de gestionar solicitudes sensibles.",
      aboutHeading: "Sobre el proyecto",
      aboutText: "CineRD es una iniciativa independiente dedicada al cine dominicano. El catálogo público se encuentra en desarrollo y no ofrece streaming ni formularios de soporte con almacenamiento de mensajes.",
      repo: "Ver repositorio oficial"
    }
  },
  en: {
    privacy: {
      label: "TRANSPARENCY AND DATA PROTECTION",
      title: "Privacy Policy",
      intro: "Learn what information CineRD may process, why, and how to request corrections.",
      sections: [
        { heading: "1. About CineRD", paragraphs: [
          "CineRD is an independent project for discovering and documenting Dominican cinema. Its current public Cloudflare Pages version is a read-only catalog and demonstration.",
          "Registration, talent verification, credit claims and administration are part of the wider system but may not be enabled in the public demo."
        ] },
        { heading: "2. Data we may process", paragraphs: [
          "The public catalog contains film and professional information, such as names, credits, filmographies and photographs. Hosting providers may process technical access data, including IP addresses, to deliver and protect the website.",
          "If account features are enabled, CineRD may process user-submitted names, emails, protected credentials, verification requests, claims and security records. Never submit private documents via public issues."
        ] },
        { heading: "3. Purposes", paragraphs: [
          "We use information to deliver the catalog, maintain editorial accuracy, process correction requests, protect the service and operate enabled account features.",
          "Private evidence should not be made public or used for advertising."
        ] },
        { heading: "4. Local storage and cookies", paragraphs: [
          "The website stores language and theme preferences in your browser's local storage. Authentication features, when enabled, may use essential session and security cookies.",
          "AdSense ownership verification is installed, but this does not mean advertisements are currently being served. Ads remain disabled pending approval and activation."
        ] },
        { heading: "5. Third-party advertising", paragraphs: [
          "If Google AdSense is enabled, Google and other ad providers may use cookies, identifiers, IP addresses and similar technologies to display, measure and protect advertising. Advertising may reflect visits to this and other websites, subject to settings and applicable consent.",
          "You may manage ad personalization through Google's ad settings. Appropriate consent solutions will be configured where required before enabling advertising."
        ] },
        { heading: "6. Hosting and third parties", paragraphs: [
          "The public website is hosted on Cloudflare Pages. The catalog may link to third-party services such as TMDb, YouTube, Spotify and social networks. They apply their own privacy policies when you visit them.",
          "Material changes to analytics or advertising providers will be reflected in this policy."
        ] },
        { heading: "7. Retention and security", paragraphs: [
          "Local preferences remain until removed from your browser. Other information is retained only as needed for its purpose, applicable obligations and service security.",
          "Security measures are applied to active components; no online service can guarantee absolute security."
        ] },
        { heading: "8. Requests and corrections", paragraphs: [
          "You can report public catalog inaccuracies through the Contact page. Do not post identification, addresses or confidential evidence in GitHub Issues.",
          "A dedicated private contact channel for personal data requests is still pending setup for the public demo."
        ] },
        { heading: "9. Children and updates", paragraphs: [
          "CineRD is not specifically intended for children. This policy may change when features, providers or obligations change. The displayed date identifies the published version."
        ] }
      ],
      resourcesTitle: "Related information and controls",
      resources: [
        { label: "Google ad preferences", href: "https://myadcenter.google.com/" },
        { label: "How Google uses information", href: "https://policies.google.com/technologies/partner-sites" }
      ]
    },
    terms: {
      label: "RESPONSIBLE USE OF THE ARCHIVE",
      title: "Terms of Use",
      intro: "Conditions for browsing, contributing to and using CineRD information and services.",
      sections: [
        { heading: "1. Independent service", paragraphs: [
          "CineRD independently organizes and presents information about Dominican cinema. It does not officially represent artists, studios, institutions or third-party services unless expressly stated.",
          "The public website provides information; it does not host or stream films."
        ] },
        { heading: "2. Editorial accuracy", paragraphs: [
          "We aim for accurate, verifiable data, but information may be incomplete, incorrect or outdated. Content is informational and not an official certification.",
          "Correction requests are reviewed against appropriate sources and are not automatically accepted."
        ] },
        { heading: "3. Accounts and restricted features", paragraphs: [
          "When registration, talent verification and claims become available, users must submit truthful information, respect their permissions and avoid unauthorized access.",
          "CineRD may restrict abusive, fraudulent, impersonating or insecure accounts."
        ] },
        { heading: "4. Intellectual property", paragraphs: [
          "Rights in films, photographs, posters, marks, trailers and other materials belong to their respective owners. Display within CineRD does not grant reproduction or commercial exploitation rights.",
          "Do not contribute material you cannot lawfully share. Substantiated rights claims may result in content review or removal."
        ] },
        { heading: "5. Acceptable use", paragraphs: [
          "You may browse and link to the public catalog while respecting applicable law and third-party rights. Do not extract private information, interfere with the service, make abusive automated requests or falsify professional credits."
        ] },
        { heading: "6. Third-party services", paragraphs: [
          "Links to TMDb, YouTube, Spotify and other websites are informational. Their terms, licenses and policies are independent of CineRD."
        ] },
        { heading: "7. Availability and changes", paragraphs: [
          "The service may change or become unavailable due to maintenance, security, editorial review or ongoing development. Continuous availability is not guaranteed; paid features and streaming are not currently offered."
        ] },
        { heading: "8. Advertising and sponsorship", paragraphs: [
          "If advertising is activated, paid placements must be distinct from editorial content. Sponsorship does not establish the authenticity of credits or verification of talent."
        ] },
        { heading: "9. Updates and contact", paragraphs: [
          "Public error reports are welcome via Contact. Never submit confidential information via public channels. These terms may be updated and display their effective publication date.",
          "A legal review is recommended before a definitive commercial launch."
        ] }
      ]
    },
    contact: {
      label: "COMMUNITY AND COLLABORATION",
      title: "Contact",
      intro: "Help us build a more accurate catalog of Dominican cinema.",
      publicHeading: "Public corrections and feedback",
      publicText: "Found an error in a credit, filmography, release date or film? Open an issue in the official repository and, where possible, include a verifiable public source.",
      action: "Open a GitHub issue",
      caution: "Important: GitHub issues are public. Do not submit IDs, private phone numbers, passwords, addresses, confidential evidence or other sensitive information.",
      privateHeading: "Private and data-related requests",
      privateAvailable: "For privacy, image rights or confidential inquiries, use this official email:",
      privatePending: "A private official CineRD email address has not yet been configured for this demo. Do not post confidential information via public issues. This channel must be available before handling sensitive requests.",
      aboutHeading: "About the project",
      aboutText: "CineRD is an independent initiative dedicated to Dominican cinema. The public catalog is under development and does not offer streaming or a stored contact form.",
      repo: "View the official repository"
    }
  }
};

function usePublicPageMetadata(title, description, slug) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    const previousDescription = descriptionTag?.getAttribute("content");
    const previousCanonical = canonicalTag?.getAttribute("href");
    document.title = title + " | CineRD";
    descriptionTag?.setAttribute("content", description);
    canonicalTag?.setAttribute("href", "https://cinerd.pages.dev/" + slug);
    return () => {
      document.title = previousTitle;
      if (previousDescription !== null && previousDescription !== undefined) descriptionTag?.setAttribute("content", previousDescription);
      if (previousCanonical !== null && previousCanonical !== undefined) canonicalTag?.setAttribute("href", previousCanonical);
    };
  }, [title, description, slug]);
}

function PageHeader({ page, language, children }) {
  return (
    <div className="cinerd-info-page">
      <header className="cinerd-info-hero">
        <span className="cinerd-info-eyebrow">{page.label}</span>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <small>{language === "es" ? "Última actualización: " : "Last updated: "}{lastUpdated[language]}</small>
      </header>
      {children}
      <nav className="cinerd-info-bottom" aria-label={language === "es" ? "Información de CineRD" : "CineRD information"}>
        <Link to="/privacidad">{language === "es" ? "Privacidad" : "Privacy"}</Link>
        <Link to="/terminos">{language === "es" ? "Términos" : "Terms"}</Link>
        <Link to="/contacto">{language === "es" ? "Contacto" : "Contact"}</Link>
        <Link to="/">{language === "es" ? "Volver al inicio" : "Home"}</Link>
      </nav>
    </div>
  );
}

function PolicyDocument({ type, slug }) {
  const { i18n } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const page = content[language][type];
  usePublicPageMetadata(page.title, page.intro, slug);
  return (
    <PageHeader page={page} language={language}>
      <div className="cinerd-info-document">
        {page.sections.map((section) => (
          <section key={section.heading} className="cinerd-info-section">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        {page.resources && (
          <section className="cinerd-info-section">
            <h2>{page.resourcesTitle}</h2>
            <ul>
              {page.resources.map((resource) => (
                <li key={resource.href}><a href={resource.href} target="_blank" rel="noopener noreferrer">{resource.label}</a></li>
              ))}
            </ul>
          </section>
        )}
        <p className="cinerd-info-note">
          {language === "es" ? "Para dudas o solicitudes relacionadas con esta información: " : "For questions or requests about this information: "}
          <Link to="/contacto">{language === "es" ? "Contacto" : "Contact"}</Link>.
        </p>
      </div>
    </PageHeader>
  );
}

export function PrivacyPolicy() {
  return <PolicyDocument type="privacy" slug="privacidad" />;
}

export function TermsOfUse() {
  return <PolicyDocument type="terms" slug="terminos" />;
}

export function Contact() {
  const { i18n } = useTranslation();
  const language = i18n.language?.startsWith("en") ? "en" : "es";
  const page = content[language].contact;
  usePublicPageMetadata(page.title, page.intro, "contacto");
  return (
    <PageHeader page={page} language={language}>
      <div className="cinerd-info-contact-grid">
        <section className="cinerd-info-contact-card">
          <span aria-hidden="true" className="cinerd-info-card-icon">🎬</span>
          <h2>{page.publicHeading}</h2>
          <p>{page.publicText}</p>
          <a className="btn btn-primary" href={githubIssues} target="_blank" rel="noopener noreferrer">{page.action}</a>
          <p className="cinerd-info-caution">{page.caution}</p>
        </section>
        <section className="cinerd-info-contact-card">
          <span aria-hidden="true" className="cinerd-info-card-icon">✉️</span>
          <h2>{page.privateHeading}</h2>
          {contactEmail ? (
            <>
              <p>{page.privateAvailable}</p>
              <a className="cinerd-info-email" href={"mailto:" + contactEmail}>{contactEmail}</a>
            </>
          ) : (
            <p className="cinerd-info-caution">{page.privatePending}</p>
          )}
        </section>
      </div>
      <section className="cinerd-info-section cinerd-info-about">
        <h2>{page.aboutHeading}</h2>
        <p>{page.aboutText}</p>
        <a href="https://github.com/Jairo0811/CineRD" target="_blank" rel="noopener noreferrer">{page.repo}</a>
      </section>
    </PageHeader>
  );
}
