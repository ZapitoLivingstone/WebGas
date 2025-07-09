import Link from "next/link"
import Image from "next/image"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#15151a] text-white mt-12 border-t border-yellow-400/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Company Info & Logo */}
          <div>
            <div className="flex items-center mb-5">
              <Image
                src="/logo-plasgas-sin-fondo.png"
                alt="Logo PLASGAS"
                width={54}
                height={54}
                className="rounded-none"
                priority
              />
              <span className="ml-3 text-2xl font-extrabold tracking-tight text-yellow-400">
                PLASGAS
              </span>
            </div>
            <p className="text-gray-400 mb-5 text-sm max-w-xs">
              Tu tienda especializada en soluciones de gasfitería y climatización.<br />
              Calidad garantizada para cada estación del año.
            </p>
            <div className="flex space-x-4 mt-3">
              <Link href="https://facebook.com" target="_blank" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-yellow-400 hover:text-white transition-colors" />
              </Link>
              <Link href="https://instagram.com" target="_blank" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-yellow-400 hover:text-white transition-colors" />
              </Link>
              <Link href="https://twitter.com" target="_blank" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-yellow-400 hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-400">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-yellow-300 transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-yellow-300 transition-colors">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-yellow-300 transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-yellow-300 transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-400">Atención al Cliente</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-gray-300 hover:text-yellow-300 transition-colors">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-300 hover:text-yellow-300 transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-yellow-300 transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/warranty" className="text-gray-300 hover:text-yellow-300 transition-colors">
                  Garantía
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-lg mb-4 text-yellow-400">Contacto</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300">+56 9 1234 5678</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300">contacto@plasgas.cl</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-yellow-400" />
                <span className="text-gray-300">Santiago, Chile</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-yellow-800/30 mt-10 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} PLASGAS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
