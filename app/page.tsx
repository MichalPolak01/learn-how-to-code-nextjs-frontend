"use client"
import { Button } from '@nextui-org/button';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import { useState } from 'react';


export default function Home() {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (event: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = event;
    const { offsetWidth, offsetHeight } = currentTarget as HTMLDivElement;

    const x = Math.min(Math.max(clientX, 64), offsetWidth - 64);
    const y = Math.min(Math.max(clientY, 64), offsetHeight - 64);

    setMousePosition({ x, y });
  };

  return (
    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
      <div className="relative w-full h-full" onMouseMove={handleMouseMove}>
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            priority
            alt="Tło aplikacji LearnHowToCode"
            className="object-cover w-full h-full"
            layout="fill"
            src="/images/landing.jpg"
          />
          <div className="absolute inset-0 bg-black bg-opacity-70 z-5" />

          <div
            className="absolute w-40 h-40 bg-primary-500 bg-opacity-70 blur-3xl rounded-full pointer-events-none"
            style={{
              top: mousePosition.y - 64,
              left: mousePosition.x - 64,
            }}
          />
        </div>

        <div className="relative px-8 h-full m-auto max-w-7xl flex flex-col gap-8 justify-center items-center z-10">
          <h1 className="md:text-7xl text-4xl text-primary text-center font-semibold">
            Witaj w LearnHowToCode!
          </h1>
          <h2 className="text-white md:text-2xl text-lg text-center italic">
            <span className="text-primary font-medium">LearnHowToCode</span> to Twoje centrum nauki programowania, które łączy najlepsze kursy, interaktywne zadania i&nbsp;quizy w jednym miejscu.
          </h2>
          <h3 className="text-white md:text-2xl text-lg text-center italic">
            Dołącz do społeczności LearnHowToCode już dziś i zacznij tworzyć swój progamistyczny świat!
          </h3>

          <div className="flex sm:flex-row flex-col justify-center items-center sm:gap-8 gap-4 mt-4">
            <Button
              className="px-12 py-6 text-lg hover:scale-110"
              color="primary"
              radius="full"
              size="lg"
              variant="shadow"
              onClick={() => router.push("/login")}
            >
              Zaloguj się
            </Button>
            <p className="text-lg text-white">Lub</p>
            <Button
              className="px-12 py-6 text-lg hover:scale-110"
              color="primary"
              radius="full"
              size="lg"
              variant="shadow"
              onClick={() => router.push("/register")}
            >
              Zarejestruj się
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

