export default function PageSpinner({ text = 'загружаем...' }) {
  return (
    <div
      className="d-flex align-items-center justify-content-center gap-2 my-5"
      role="status"
    >
      <span className="spinner-border" aria-hidden="true" />
      <span>{text}</span>
    </div>
  )
}
