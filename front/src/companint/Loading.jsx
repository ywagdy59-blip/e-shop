const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-dark" role="status"></div>
      <span className="mt-2 text-muted">{text}</span>
    </div>
  );
};

export default Loading;
