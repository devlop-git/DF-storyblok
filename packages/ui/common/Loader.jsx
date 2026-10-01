import { RotatingLines } from "react-loader-spinner";

// Full-viewport loading overlay, used as `loading.js` for any route that
// needs one (Next.js wraps that route's page.js in a Suspense boundary and
// shows this while it's fetching).
//
// `fixed inset-0` always covers exactly the current viewport. The background
// is transparent because this also shows on router.refresh() (language
// switch), where the previous page's content should stay visible underneath.
export default function Loader() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-transparent">
      <RotatingLines
        visible
        height="56"
        width="56"
        strokeWidth="4"
        strokeColor="#8A8A8A"
        animationDuration="0.75"
        ariaLabel="loading"
      />
    </div>
  );
}
