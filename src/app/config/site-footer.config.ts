import type { ComponentProps } from "react"

import communityIcon from "@/shared/assets/icons/social/community.svg"
import facebookIcon from "@/shared/assets/icons/social/facebook.svg"
import instagramIcon from "@/shared/assets/icons/social/instagram.svg"
import linkedinIcon from "@/shared/assets/icons/social/linkedin.svg"
import twitterIcon from "@/shared/assets/icons/social/twitter.svg"
import type { SiteFooter } from "@/shared/components/layout"

export const siteFooterConfig = {
  brand: {
    name: "KURIO",
    href: "#inicio",
    ariaLabel: "Kurio — página inicial",
  },
  benefitsLabel: "Vantagens Kurio e newsletter",
  benefits: [
    {
      symbol: "W",
      title: "Segurança da carteira",
      description:
        "Proteja sua carteira e colecione arte digital verificada com confiança.",
    },
    {
      symbol: "C",
      title: "Criadores em destaque",
      description:
        "Conheça artistas, estúdios e comunidades que moldam a cultura digital na rede.",
    },
    {
      symbol: "D",
      title: "Alertas de lançamentos",
      description:
        "Receba calendários de cunhagem, novidades de listas de acesso e análises do mercado.",
    },
  ],
  columns: [
    {
      title: "Meu perfil",
      links: [
        { label: "Meu perfil", href: "#meu-perfil" },
        { label: "Minha coleção", href: "#minha-colecao" },
        { label: "Atividade", href: "#atividade" },
        { label: "Estúdio do criador", href: "#estudio-do-criador" },
        { label: "Lista de interesse", href: "#lista-de-interesse" },
      ],
    },
    {
      title: "Central de ajuda",
      links: [
        { label: "Central de ajuda", href: "#central-de-ajuda" },
        { label: "Como comprar NFTs", href: "#como-comprar-nfts" },
        { label: "Carteira e segurança", href: "#carteira-e-seguranca" },
        { label: "Política do mercado", href: "#politica-do-mercado" },
        { label: "Denunciar item", href: "#denunciar-item" },
      ],
    },
    {
      title: "Coleções",
      links: [
        { label: "Arte digital", href: "#arte-digital" },
        { label: "Fotografia", href: "#fotografia" },
        { label: "Música", href: "#musica" },
        { label: "Arte 3D", href: "#arte-3d" },
        { label: "Utilidade", href: "#utilidade" },
      ],
    },
  ],
  socialsTitle: "Redes sociais",
  socials: [
    { label: "Facebook", href: "#facebook", iconSrc: facebookIcon },
    { label: "Instagram", href: "#instagram", iconSrc: instagramIcon },
    { label: "X / Twitter", href: "#twitter", iconSrc: twitterIcon },
    { label: "LinkedIn", href: "#linkedin", iconSrc: linkedinIcon },
    { label: "Comunidade", href: "#comunidade", iconSrc: communityIcon },
  ],
  newsletter: {
    title: "Antecipe-se ao próximo lançamento",
    description:
      "Receba lançamentos selecionados, histórias de criadores e novidades do mercado.",
    inputLabel: "Seu e-mail",
    placeholder: "digite seu e-mail...",
    submitLabel: "Enviar",
  },
  contact: {
    tagline: "Feito para colecionadores,\ncriadores e cultura",
    email: { label: "contato@email.com", href: "mailto:contato@email.com" },
    phone: { label: "+55 11 4002 8922", href: "tel:+551140028922" },
  },
  wallets: {
    title: "Carteiras compatíveis",
    items: ["METAMASK", "WALLETCONNECT", "COINBASE"],
  },
  copyright: "© 2026 Kurio. Propriedade digital para todos.",
} satisfies Omit<ComponentProps<typeof SiteFooter>, "className">
