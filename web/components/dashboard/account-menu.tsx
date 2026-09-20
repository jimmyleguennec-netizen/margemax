"use client";

import Link from "next/link";
import {
  CircleHelp,
  Globe,
  LifeBuoy,
  LogIn,
  LogOut,
  MapPin,
  Settings,
  UserRound,
  Wallet,
} from "lucide-react";

import { logout } from "@/lib/actions/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuStaticRow,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Icone engrenage seule (sans texte) tout a droite du header dashboard --
 * ouvre un menu deroulant avec les raccourcis de compte. "Langue" / "Pays" /
 * "Devise" sont volontairement affiches comme de simples lignes
 * d'information NON cliquables : aucun systeme multilingue, multi-pays ou
 * multi-devise n'existe reellement dans le produit (France/EUR uniquement)
 * -- les presenter comme des reglages actionnables qui ne font rien au
 * clic serait le genre de fonctionnalite fantome deja retiree ailleurs sur
 * le site (voir passation.md).
 *
 * "Aide et paramètres", "Ton compte" et "Service client" menaient tous
 * les trois au meme endroit (l'onglet Mon compte) avant cette session --
 * chacun a maintenant sa propre destination reelle : Ton compte bascule
 * l'onglet dashboard, Aide ouvre une vraie modale FAQ, Service client
 * ouvre le formulaire de contact SANS quitter le dashboard.
 */
export function AccountMenu({
  isDemo,
  onGoToAccount,
  onOpenHelp,
  onOpenContact,
}: {
  isDemo: boolean;
  onGoToAccount: () => void;
  onOpenHelp: () => void;
  onOpenContact: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Menu du compte"
          title="Menu du compte"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70 transition-colors hover:border-cyan-400/40 hover:text-white"
        >
          <Settings aria-hidden="true" className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={onOpenHelp}>
          <CircleHelp aria-hidden="true" className="h-4 w-4 text-cyan-300" />
          Aide et paramètres
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onGoToAccount}>
          <UserRound aria-hidden="true" className="h-4 w-4 text-cyan-300" />
          Ton compte
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuStaticRow>
          <Globe aria-hidden="true" className="h-4 w-4" />
          Langue : Français
        </DropdownMenuStaticRow>
        <DropdownMenuStaticRow>
          <MapPin aria-hidden="true" className="h-4 w-4" />
          Pays : France
        </DropdownMenuStaticRow>
        <DropdownMenuStaticRow>
          <Wallet aria-hidden="true" className="h-4 w-4" />
          Devise : Euro (€)
        </DropdownMenuStaticRow>

        <DropdownMenuSeparator />

        <DropdownMenuItem onSelect={onOpenContact}>
          <LifeBuoy aria-hidden="true" className="h-4 w-4 text-cyan-300" />
          Service client
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {isDemo ? (
          <DropdownMenuItem asChild>
            <Link href="/login">
              <LogIn aria-hidden="true" className="h-4 w-4 text-cyan-300" />
              Se connecter
            </Link>
          </DropdownMenuItem>
        ) : (
          // logout() est une Server Action ("use server") : appelable
          // directement au clic, pas besoin d'un <form> ici -- redirect()
          // qu'elle declenche cote serveur est reconnu et applique par le
          // client Next.js meme hors soumission de formulaire.
          <DropdownMenuItem onSelect={() => void logout()}>
            <LogOut aria-hidden="true" className="h-4 w-4 text-pink-300" />
            Se déconnecter
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
