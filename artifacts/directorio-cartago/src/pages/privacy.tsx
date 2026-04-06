import React from "react";
import { Layout } from "@/components/layout";
import { ShieldCheck } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>

        <h1 className="mb-6 text-center text-4xl font-display font-bold">
          Politica de privacidad y tratamiento de datos
        </h1>
        <p className="mx-auto mb-12 max-w-3xl text-center text-muted-foreground">
          Esta politica explica como Directorio Cartago recopila, usa y protege
          la informacion personal de usuarios y negocios registrados en la plataforma.
        </p>

        <div className="prose prose-slate max-w-none rounded-3xl border border-border/70 bg-card p-8 text-muted-foreground shadow-sm prose-headings:font-display prose-headings:text-foreground">
          <h2>1. Marco legal</h2>
          <p>
            Damos cumplimiento a la Ley 1581 de 2012 y a las normas complementarias
            vigentes en Colombia sobre proteccion de datos personales.
          </p>

          <h2>2. Datos que podemos recopilar</h2>
          <ul>
            <li>Nombre completo o nombre comercial.</li>
            <li>Correo electronico.</li>
            <li>Telefono de contacto.</li>
            <li>Informacion publica del negocio, como direccion, horarios y redes.</li>
            <li>Datos basicos de uso de la plataforma para mejorar el servicio.</li>
          </ul>

          <h2>3. Finalidad del tratamiento</h2>
          <ul>
            <li>Crear y administrar cuentas de usuario.</li>
            <li>Publicar y gestionar fichas de negocios dentro del directorio.</li>
            <li>Enviar comunicaciones operativas relacionadas con el servicio.</li>
            <li>Mejorar la experiencia, soporte y seguridad de la plataforma.</li>
          </ul>

          <h2>4. Derechos del titular</h2>
          <p>Como titular de los datos puedes solicitar en cualquier momento:</p>
          <ul>
            <li>Conocer, actualizar o corregir tu informacion.</li>
            <li>Solicitar evidencia de la autorizacion otorgada.</li>
            <li>Revocar la autorizacion cuando legalmente aplique.</li>
            <li>Solicitar la eliminacion de tus datos si no existe deber legal de conservarlos.</li>
          </ul>

          <h2>5. Seguridad</h2>
          <p>
            Aplicamos medidas tecnicas, administrativas y operativas para reducir
            riesgos de acceso no autorizado, perdida o alteracion de la informacion.
            Las contrasenas no se almacenan en texto plano.
          </p>

          <h2>6. Contacto</h2>
          <p>
            Para consultas sobre esta politica o solicitudes relacionadas con datos
            personales, puedes escribir a:
          </p>
          <p>
            <strong>privacidad@directoriocartago.com</strong>
          </p>
        </div>
      </div>
    </Layout>
  );
}
