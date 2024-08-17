'use client'
import Navbar from "../components/landing-page/header";
import { useRouter } from "next/navigation";

const Home: React.FC = () => {
  const router = useRouter();

  const handleStartEnvironment = () => {
    router.push("/dashboard");
  };

  return (
    <main className="">
      <Navbar />
      <div className="h-[calc(100vh-64px)] w-full flex flex-col justify-center items-center gap-5">
        <h1 className="text-6xl font-bold">Stay Focused, Learn Better</h1>
        <p className="text-2xl">Master Your Studies with Precision Focus</p>
        <div
          onClick={handleStartEnvironment}
          className="text-xl py-2 px-4 bg-indigo-500 text-white rounded-lg cursor-pointer"
        >
          Start your environment
        </div>
        <p></p>
      </div>
    </main>
  );
};

export default Home;
