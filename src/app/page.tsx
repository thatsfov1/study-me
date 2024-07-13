import Link from "next/link";
import Navbar from "./components/Navbar";

const Home = () => {
  return (
    <main className="">
      <Navbar />
      <div className="h-[calc(100vh-64px)] w-full flex flex-col justify-center items-center gap-5">
        <h1 className="text-6xl font-bold">Stay Focused, Learn Better</h1>
        <p className="text-2xl">Master Your Studies with Precision Focus</p>
        <Link
          href="/dashboard"
          className="text-xl py-2 px-4 bg-indigo-500 text-white rounded-lg"
        >
          Start your session
        </Link>
        <p></p>
      </div>
    </main>
  );
};

export default Home;
