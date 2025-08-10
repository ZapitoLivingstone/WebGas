"use client";


import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SpecialServicesSection({ imagenUrl }: { imagenUrl?: string }) {
  const [showContact, setShowContact] = useState(false);

  return (
    <section className="w-full py-16 bg-white">
      <div className="container mx-auto flex flex-col md:flex-row items-center gap-16 px-4 md:px-8">
        {/* Texto */}
        <div className="flex-1 max-w-xl">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-neutral-900 leading-tight">
            Servicios de Gasfitería{" "}
            <span className="text-[#FFD200]">Especializados</span>
          </h2>
          <p className="text-lg md:text-xl text-neutral-700 mb-7 font-normal leading-relaxed">
            En <span className="font-bold text-[#FFD200]">PlasGas</span> te ayudamos a resolver necesidades de gasfitería <b>para hoteles, hospitales y grandes empresas</b>.
            <br />
            <span className="font-medium text-neutral-900">Profesionales certificados, soluciones integrales y atención personalizada para tu proyecto.</span>
          </p>
          <div className="flex gap-4 flex-col sm:flex-row">
            {/* Botón principal: Contáctanos */}
            <Button
              size="lg"
              className="bg-[#FFD200] hover:bg-[#ffe244] text-[#C22320] font-bold text-base px-8 py-2 rounded-full shadow transition"
              onClick={() => setShowContact(true)}
              type="button"
            >
              Contáctanos
            </Button>
            {/* Botón secundario: Ver más */}
            <Button
              size="lg"
              variant="ghost"
              className="text-[#C22320] border border-transparent hover:border-[#C22320] hover:bg-[#fff3f3] font-bold text-base px-8 py-2 rounded-full transition"
              asChild
            >
              <Link href="/servicios-gasfiteria">Ver detalles de servicios</Link>
            </Button>
          </div>
        </div>
        {/* Imagen */}
        <div className="flex-1 flex justify-center">
          {imagenUrl ? (
            <Image
              src={imagenUrl}
              alt="Servicios de gasfitería para hoteles y hospitales"
              width={420}
              height={320}
              className="rounded-2xl shadow-lg object-cover"
            />
          ) : (
            <div className="w-[320px] h-[220px] bg-[#FAFAFA] flex items-center justify-center rounded-2xl shadow border-2 border-[#FFD200]">
              <span className="text-[#C22320]/30 font-bold text-base text-center">
                [Aquí tu imagen de servicios]
              </span>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CONTACTO */}
      {showContact && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/60"
          onClick={() => setShowContact(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative border-2 border-[#FFD200]"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-neutral-400 hover:text-[#C22320] text-2xl"
              onClick={() => setShowContact(false)}
              aria-label="Cerrar"
              type="button"
            >
              ×
            </button>
            <h3 className="text-2xl font-black mb-3 text-[#C22320]">
              Contacto Servicios Gasfitería
            </h3>
            <div className="mb-3">
              <span className="font-semibold text-neutral-700">Teléfono:</span>{" "}
              <a href="tel:+56912345678" className="hover:underline text-[#1B98E0]">+56 9 1234 5678</a>
            </div>
            <div className="mb-3">
              <span className="font-semibold text-neutral-700">Email:</span>{" "}
              <a href="mailto:contacto@plasgas.cl" className="hover:underline text-[#1B98E0]">contacto@plasgas.cl</a>
            </div>
            <div>
              <span className="font-semibold text-neutral-700">Dirección:</span>{" "}
              <span>Santiago, Chile</span>
            </div>
            <div className="mt-7 text-right">
              <Button
                className="bg-[#FFD200] hover:bg-[#ffe244] text-[#C22320] font-bold px-7 py-2 rounded-full"
                onClick={() => setShowContact(false)}
                type="button"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
