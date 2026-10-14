function PageLoader() {
  return (
    <div className="text-center py-5" role="status" aria-live="polite">
      <div className="spinner-border" aria-hidden="true" />
      <span className="visually-hidden">Cargando…</span>
    </div>
  );
}

export default PageLoader;
