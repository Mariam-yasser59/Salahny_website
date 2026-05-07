export default function AppButton({ variant = 'primary', children, ...props }) {
  return <button className={variant === 'ghost' ? 'ghost-btn' : 'primary-btn'} {...props}>{children}</button>;
}
