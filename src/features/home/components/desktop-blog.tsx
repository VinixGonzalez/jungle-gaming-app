import { blogPosts } from "../data/blog-posts"

export function DesktopBlog() {
  return (
    <section
      aria-labelledby="home-blog-title"
      className="flex h-119 w-full flex-col items-center gap-10 overflow-hidden"
      id="aprenda"
    >
      <header className="flex h-16.75 w-full shrink-0 flex-col items-center gap-3 overflow-hidden text-center">
        <h2
          className="w-full text-size-28 font-bold leading-9 text-text-primary"
          id="home-blog-title"
        >
          Diário da Cunhagem
        </h2>
        <p className="w-full text-size-14 font-normal leading-size-18 text-text-secondary">
          Histórias, guias e insights para colecionadores sobre o universo da
          propriedade digital.
        </p>
      </header>

      <div className="flex w-full items-start gap-6 overflow-hidden">
        {blogPosts.map((post) => (
          <article
            className="flex h-92.25 w-67 shrink-0 flex-col items-start overflow-hidden rounded-lg bg-surface-card"
            key={post.title}
          >
            <img
              alt={post.imageAlt}
              className="h-48.75 w-full shrink-0 object-cover"
              loading="lazy"
              src={post.image}
            />

            <div className="flex min-h-0 w-full flex-1 flex-col items-start gap-2 overflow-hidden px-4 pb-4 pt-3">
              <p className="w-full whitespace-pre-wrap text-size-12 leading-size-16 font-medium text-text-secondary">
                {post.date} <span aria-hidden="true"> | </span> {post.readingTime}
              </p>
              <h3 className="w-full text-size-16 font-bold leading-normal text-text-primary">
                {post.title}
              </h3>
              <p className="w-full text-size-12 leading-size-16 font-medium text-text-secondary">
                {post.description}
              </p>
              <a
                className="flex items-start gap-1 whitespace-nowrap text-size-12 font-bold leading-size-14 text-text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href="#"
              >
                Ler mais <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
