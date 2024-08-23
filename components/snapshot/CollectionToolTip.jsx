export default function CollectionToolTip({ text, show }) {
  return (
    <>
      {show ? (
        <div className="absolute text-xs flex w-full h-1/5 scale-105 bottom-[-10px] left-1/2 -translate-x-1/2 rounded-md justify-center items-center bg-black transition duration-100">
          {text}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
