import '../styles/Button.css';

const Button = ({ children, variant = 'primary', onClick, type = 'button', disabled, icon }) => {
  return (
    <button type={type} className={`btn btn-${variant}`} onClick={onClick} disabled={disabled}>
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
