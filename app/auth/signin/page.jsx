"use client";
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";

const SignIn = () => {
  const [providers, setProviders] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await getProviders();
      setProviders(res);
    })();
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center justify-center h-screen">
      <div className="h-1/2 md:h-full md:w-1/2 flex items-center justify-center">
        <script
          src="https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs"
          type="module"
        ></script>

        <dotlottie-player
          src="https://lottie.host/55a28447-eab2-406b-9656-4a43338150a7/50OGt5ZUnm.json"
          background="transparent"
          speed="1"
          style={{ width: "200px", height: "200px" }}
          loop
          autoplay
        ></dotlottie-player>
      </div>

      <div className="h-1/2 md:h-full md:w-1/2  flex flex-col items-center md:justify-center gap-5 md:bg-[#63727E]">
        {providers &&
          Object.values(providers).map((provider) => (
            <div key={provider.name}>
              <button
                className="bg-slate-100 text-gray-900 gap-2 items-center py-3 px-5 rounded sfProDisplay flex shadow-lg"
                onClick={() => signIn(provider.id, { callbackUrl: "/" })}
              >
                <img
                  src="/google.png"
                  width={20}
                  height={20}
                  alt={provider.name}
                  unoptimized
                />
                Sign in with {provider.name}
              </button>
            </div>
          ))}
        <div className="sfProDisplay text-xs text-slate-800 md:text-white opacity-85">
          Need help? Email{" "}
          <a
            className="underline underline-offset-2"
            href="mailto:hi@zzzzion.com"
          >
            hi@zzzzion.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
