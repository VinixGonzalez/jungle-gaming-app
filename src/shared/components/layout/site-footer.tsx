import { useId, type FormEventHandler, type ReactNode } from "react"

import { BrandWordmark } from "@/shared/components/ui/brand-wordmark"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"

type FooterBrand = {
  name: string
  href: string
  ariaLabel?: string
}

type FooterBenefit = {
  symbol: ReactNode
  title: string
  description: string
}

type FooterLink = {
  label: string
  href: string
}

type FooterColumn = {
  title: string
  links: readonly FooterLink[]
}

type FooterSocialLink = {
  label: string
  href: string
  iconSrc: string
}

type FooterNewsletter = {
  title: string
  description: string
  inputLabel: string
  placeholder: string
  submitLabel: string
  onSubmit?: FormEventHandler<HTMLFormElement>
}

type FooterContactLink = {
  label: string
  href: string
}

type FooterContact = {
  tagline: string
  email: FooterContactLink
  phone: FooterContactLink
}

type FooterWallets = {
  title: string
  items: readonly string[]
}

type SiteFooterProps = {
  brand: FooterBrand
  benefits: readonly FooterBenefit[]
  benefitsLabel: string
  columns: readonly FooterColumn[]
  socials: readonly FooterSocialLink[]
  socialsTitle: string
  newsletter: FooterNewsletter
  contact: FooterContact
  wallets: FooterWallets
  copyright: string
  className?: string
}

function SiteFooter({
  brand,
  benefits,
  benefitsLabel,
  columns,
  socials,
  socialsTitle,
  newsletter,
  contact,
  wallets,
  copyright,
  className,
}: SiteFooterProps) {
  const emailInputId = useId()

  const handleNewsletterSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    if (newsletter.onSubmit) {
      newsletter.onSubmit(event)
      return
    }

    event.preventDefault()
  }

  return (
    <footer
      className={cn(
        "mx-auto hidden min-h-152.5 w-full max-w-content flex-col xl:flex",
        className,
      )}
    >
      <section
        className="h-62.5 bg-surface-card p-8"
        aria-label={benefitsLabel}
      >
        <div className="grid h-46.5 w-288.5 grid-cols-[repeat(3,264.667px)_357px] items-end">
          {benefits.map((benefit) => (
            <article
              className="flex h-full flex-col items-start gap-3 border-r border-primary px-4"
              key={benefit.title}
            >
              <span
                className="grid size-18.5 shrink-0 place-items-center rounded-full bg-primary text-size-24 font-bold leading-normal text-ink"
                aria-hidden="true"
              >
                {benefit.symbol}
              </span>
              <h2 className="w-full text-size-17 font-bold leading-size-16 text-foreground">
                {benefit.title}
              </h2>
              <p className="w-51 text-size-14 font-normal leading-size-22 text-text-secondary">
                {benefit.description}
              </p>
            </article>
          ))}

          <div className="flex h-full w-89.25 flex-col items-center gap-3 px-4">
            <div className="flex w-full flex-col items-start gap-4">
              <h2 className="w-full text-size-18 font-bold leading-size-16 text-foreground">
                {newsletter.title}
              </h2>
              <form
                className="flex h-10 w-full items-center justify-between rounded-md bg-surface-dark pl-3 shadow-[0_0_10px_rgb(10_6_4/45%)] focus-within:ring-2 focus-within:ring-ring"
                onSubmit={handleNewsletterSubmit}
              >
                <label className="sr-only" htmlFor={emailInputId}>
                  {newsletter.inputLabel}
                </label>
                <input
                  className="min-w-0 flex-1 bg-transparent text-size-14 font-normal leading-size-16 text-foreground outline-none placeholder:text-secondary focus-visible:ring-0"
                  id={emailInputId}
                  maxLength={254}
                  name="email"
                  type="email"
                  placeholder={newsletter.placeholder}
                  autoComplete="email"
                  disabled={!newsletter.onSubmit}
                  required
                />
                <Button
                  className="h-10 w-21.25 rounded-l-none rounded-r-md px-0 text-size-18 leading-size-16 font-bold text-ink disabled:opacity-100"
                  disabled={!newsletter.onSubmit}
                  type="submit"
                >
                  {newsletter.submitLabel}
                </Button>
              </form>
            </div>
            <p className="h-22.25 w-full text-size-13 font-normal leading-size-22 text-text-secondary">
              {newsletter.description}
            </p>
          </div>
        </div>
      </section>

      <section className="min-h-22 bg-surface-dark px-8 py-6">
        <div className="grid min-h-11 grid-cols-[repeat(3,minmax(0,1fr))_228px] items-center gap-x-16">
          <BrandWordmark
            className="py-2"
            href={brand.href}
            name={brand.name}
            aria-label={brand.ariaLabel}
          />
          <p className="whitespace-pre-line text-size-14 font-normal leading-size-22 text-foreground">
            {contact.tagline}
          </p>
          <a
            className="text-size-14 font-normal leading-size-22 text-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary"
            href={contact.email.href}
          >
            {contact.email.label}
          </a>
          <a
            className="text-size-14 font-normal leading-size-22 text-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary"
            href={contact.phone.href}
          >
            {contact.phone.label}
          </a>
        </div>
      </section>

      <section className="h-59 bg-surface-card p-8">
        <div className="grid w-full grid-cols-[repeat(3,minmax(0,1fr))_228px] items-start gap-31">
          {columns.map((column) => (
            <nav
              aria-label={column.title}
              className="flex min-w-0 flex-col gap-2"
              key={column.title}
            >
              <h2 className="w-full text-size-18 font-bold leading-size-16 text-foreground">
                {column.title}
              </h2>
              <ul>
                {column.links.map((link) => (
                  <li className="h-7.5" key={link.href}>
                    <a
                      className="text-size-14 font-normal leading-size-30 text-foreground outline-none transition-colors hover:text-primary focus-visible:text-primary"
                      href={link.href}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="flex w-57 flex-col items-start gap-8">
            <div className="flex w-47.5 flex-col items-start gap-5">
              <h2 className="w-full text-size-18 font-bold leading-size-16 text-foreground">
                {socialsTitle}
              </h2>
              <ul className="flex w-full items-center gap-2.5">
                {socials.map((social) => (
                  <li key={social.label}>
                    <a
                      className="block size-7.5 rounded-full outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring"
                      href={social.href}
                      aria-label={social.label}
                    >
                      <img
                        className="size-7.5"
                        src={social.iconSrc}
                        alt=""
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex w-full flex-col items-start gap-3">
              <h2 className="w-full text-size-18 font-bold leading-size-16 text-foreground">
                {wallets.title}
              </h2>
              <div className="flex h-6.5 w-full items-center justify-center rounded-md border border-border-soft bg-surface-dark px-2 text-size-9 font-bold leading-normal tracking-[0.1px] text-text-accent">
                {wallets.items.join("  •  ")}
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="mt-1.5 h-7.5 w-full text-center text-size-14 font-normal leading-size-30 text-foreground">
        {copyright}
      </p>
    </footer>
  )
}

export { SiteFooter }
