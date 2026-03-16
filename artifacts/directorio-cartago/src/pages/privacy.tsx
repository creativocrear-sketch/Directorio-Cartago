import React from "react";
import { Layout } from "@/components/layout";
import { ShieldCheck } from "lucide-react";

export default function Privacy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ShieldCheck className="w-8 h-8" />
          </div>
        </div>
        
        <h1 className="text-4xl font-display font-bold text-center mb-12">Política de Privacidad y Tratamiento de Datos Personales</h1>
        
        <div className="prose prose-slate max-w-none text-muted-foreground prose-headings:text-foreground prose-h2:font-display">
          <p>
            Dando cumplimiento a lo dispuesto en la <strong>Ley 1581 de 2012</strong>, "Por el cual se dictan disposiciones generales para la protección de datos personales" y el Decreto 1377 de 2013 en Colombia, el Directorio de Cartago informa a sus usuarios sobre la política de tratamiento de la información.
          </p>

          <h2>1. Información Recopilada</h2>
          <p>
            Recopilamos información personal que nos proporcionas voluntariamente al registrarte en nuestra plataforma, tales como:
          </p>
          <ul>
            <li>Nombre completo o razón social.</li>
            <li>Correo electrónico.</li>
            <li>Número de teléfono o celular.</li>
            <li>Información pública del negocio (dirección, redes sociales, horarios).</li>
          </ul>

          <h2>2. Finalidad del Tratamiento</h2>
          <p>
            Los datos personales recolectados serán utilizados para las siguientes finalidades:
          </p>
          <ul>
            <li>Proveer los servicios del directorio comercial.</li>
            <li>Gestionar las cuentas de usuario y perfiles de negocios.</li>
            <li>Enviar comunicaciones operativas o promocionales relacionadas con el servicio.</li>
            <li>Analizar estadísticas de uso para mejorar la plataforma.</li>
          </ul>

          <h2>3. Derechos de los Titulares</h2>
          <p>
            De acuerdo con la Ley 1581 de 2012, tienes derecho a:
          </p>
          <ul>
            <li>Conocer, actualizar y rectificar tus datos personales.</li>
            <li>Solicitar prueba de la autorización otorgada.</li>
            <li>Ser informado sobre el uso que se ha dado a tus datos personales.</li>
            <li>Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios, derechos y garantías legales.</li>
            <li>Acceder en forma gratuita a tus datos personales que hayan sido objeto de Tratamiento.</li>
          </ul>

          <h2>4. Seguridad de la Información</h2>
          <p>
            Implementamos medidas de seguridad físicas, técnicas y administrativas para proteger tu información contra acceso no autorizado, alteración, divulgación o destrucción. Las contraseñas son almacenadas de forma cifrada (hash) y no tenemos acceso a las mismas en texto plano.
          </p>

          <h2>5. Contacto</h2>
          <p>
            Para ejercer tus derechos como titular de los datos o si tienes alguna pregunta sobre esta política, puedes contactarnos a través de:
            <br /><strong>Email:</strong> privacidad@directoriocartago.com
          </p>
        </div>
      </div>
    </Layout>
  );
}
