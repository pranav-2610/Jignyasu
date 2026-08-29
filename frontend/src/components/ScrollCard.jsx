export default function ScrollCard({ children, className = "" }) {
  return <div className={`jg-scroll-card ${className}`}>{children}</div>;
}