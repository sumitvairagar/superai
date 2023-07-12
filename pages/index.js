import Link from "next/link";
import Image from "next/image";
import HeroImage from "../public/hero.webp";
import { Logo } from "../components/logo";
export default function Home() {
  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center relative">
      <Image src={HeroImage} alt="Hero" fill className="absolute"></Image>
      <div className="relative z-10 text-white px-10 py-5 text-center max-w-screen-sm bg-slate-900/90 rounded-md backdrop-blur-sm">
        <Logo></Logo>
        <p>This is an AI powered solution</p>
        <Link href={"/post/new"} className="btn">
          Begin
        </Link>
      </div>
    </div>
  );
}
