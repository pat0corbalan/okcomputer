import { Suspense } from "react";
import HomeClient from "./home-client";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <HomeClient />
    </Suspense>
  );
}