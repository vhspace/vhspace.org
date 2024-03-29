import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Virtual HackerSpace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={styles.logo}>
          <img src="/vhs1.svg" alt="V Logo" />
        </div>
        <br />

        <h1 className={styles.title}>Virtual HackerSpace</h1>

        <p className={styles.description}>
          A hackerspace is a place for a community to form around the idea of
          making things and sharing knowledge. <br />
          Many real-world hackerspaces exist where members can hold meetups,
          teach classes, use tools like laser cutters or soldering irons. <br />
          A virtual hackerspace can skip out on costs like rent and tools, and
          associated drama. <br />
          People can collaborate from all over the world.
        </p>

        <h2>How can I participate?</h2>

        <div className={styles.grid}>
          <a href="https://discord.gg/RE93FmF6Um" className={styles.card}>
            <h2>Community Help &rarr;</h2>
            <p>
              Ask or answer technical questions. Get help or share your
              expertise.
            </p>
          </a>

          <a href="https://discord.gg/RE93FmF6Um" className={styles.card}>
            <h2>Hackathons &rarr;</h2>
            <p>
              Participate in hackathons to solve complicated problems together.
            </p>
          </a>

          <a href="https://discord.gg/RE93FmF6Um" className={styles.card}>
            <h2>Build Together &rarr;</h2>
            <p>
              Collaborate on projects, solve problems, co-found new projects.
              From software to innovative gardening.
            </p>
          </a>

          <a
            href="https://vhspace.social/"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.card}
          >
            <h2>Fediverse &rarr;</h2>
            <p>
              Join <code className={styles.code}>vhspace.social</code> - a
              community-run Decentralized Social Media site built on top of
              Mastodon. Join the movement for free. Move any time.
            </p>
          </a>
        </div>

        <div className={styles.col}>
          <button className={styles.button}>
            <a
              href="https://discord.gg/RE93FmF6Um"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnLink}
            >
              <h2>Join Discord &rarr;</h2>
            </a>
          </button>
        </div>

        <div className={styles.col}>
          <button className={styles.button}>
            <a
              href="https://vhspace.social/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnLink}
            >
              <h2>vhspace.social media &rarr;</h2>
            </a>
          </button>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Copyleft © {new Date().getFullYear()} Virtual HackerSpace (VHS)
          <span className={styles.logo}>
            {/* <Image src="/vhspace.svg" alt="Virtual HackerSpace Logo" width={40} height={20} /> */}
          </span>
        </a>
      </footer>
    </div>
  );
}
