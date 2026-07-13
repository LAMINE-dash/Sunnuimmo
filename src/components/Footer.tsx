import { Building2, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps { onNavigate: (page: string) => void; }

export default function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">Teranga<span className="text-amber-500">Immo</span></span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 mb-6">
              La première plateforme immobilière du Sénégal. Trouvez, vendez et sécurisez vos transactions en toute confiance.
            </p>
            <div className="flex gap-3">
              {[Facebook,Twitter,Instagram,Linkedin].map((Icon,i) => (
                <a key={i} href="#" className="w-9 h-9 bg-gray-800 hover:bg-amber-500 rounded-lg flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wide">Plateforme</h3>
            <ul className="space-y-3">
              {[
                {label:'Annonces',page:'listings'},{label:'Vendre',page:'post-property'},
                {label:'Louer',page:'listings'},{label:'Estimation IA',page:'estimate'},
                {label:'Agences',page:'agencies'},{label:'Tarifs',page:'pricing'},
              ].map(l => (
                <li key={l.label}>
                  <button onClick={() => onNavigate(l.page)}
                    className="text-sm text-gray-400 hover:text-amber-400 transition-colors">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wide">Espaces métiers</h3>
            <ul className="space-y-3">
              {['Espace Agences','Espace Notaires','Espace Banques','Promoteurs','API Développeurs','Partenaires'].map(item => (
                <li key={item}><a href="#" className="text-sm text-gray-400 hover:text-amber-400 transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-5 uppercase tracking-wide">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <span className="text-sm text-gray-400">Almadies, Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-sm text-gray-400">+221 33 XXX XX XX</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-sm text-gray-400">contact@terangaimmo.sn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2024 TerangaImmo. Tous droits réservés.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-300">Mentions légales</a>
            <a href="#" className="hover:text-gray-300">Confidentialité</a>
            <a href="#" className="hover:text-gray-300">CGU</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
