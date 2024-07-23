import Image from "next/image";

export default function Spinner(props) {
  return (
    <div {...props}>
      <Image src="/spinner/spinner.gif" fill alt="" />
    </div>
  );
}
