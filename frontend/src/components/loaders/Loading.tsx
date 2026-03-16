type LoadingProps = {
  width?: string;
};

export default function Loading({ width = "100px" }: LoadingProps) {
  return (
    <div className="flex items-center justify-center absolute top-0 left-0 w-screen h-screen bg-bgprimary">
      <p style={{ width: width, height: width }} className="spinner"></p>
    </div>
  );
}
