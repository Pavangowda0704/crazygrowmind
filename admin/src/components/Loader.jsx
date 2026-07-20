import '../styles/Loader.css';

const Loader = ({ fullScreen }) => {
  return (
    <div className={fullScreen ? 'loader-fullscreen' : 'loader-inline'}>
      <div className="spinner" />
    </div>
  );
};

export default Loader;
