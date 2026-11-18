// обычный компонент без хуков — годится и для сервера, и для клиента
export default function RoleBadge({ role }) {
  const color = role === 'ADMIN' ? 'text-bg-danger' : 'text-bg-secondary';
  return <span className={`badge ${color}`}>{role}</span>;
}
