export default function AppBrand({ onClick }) {
  return (
    <button className="app-brand" type="button" onClick={onClick} aria-label="FeedSense home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>FeedSense</span>
    </button>
  );
}
